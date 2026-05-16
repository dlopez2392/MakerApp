import { getDatabase } from "../database/connection";
import { invoiceRepository } from "../database/repositories/InvoiceRepository";
import { InvoiceLineItemRepository } from "../database/repositories/InvoiceLineItemRepository";
import { InvoicePaymentRepository } from "../database/repositories/InvoicePaymentRepository";
import { QuoteLineItemRepository } from "../database/repositories/QuoteLineItemRepository";
import { quoteRepository } from "../database/repositories/QuoteRepository";
import { getDeductionsByProject } from "../database/repositories/DeductionRepository";
import { inventoryRepository } from "../database/repositories/InventoryRepository";
import type { Invoice, LineItem, InvoicePayment, PaymentMethod } from "../types";
import { FREE_LIMITS } from "../types";

export class InvoiceServiceError extends Error {
  constructor(message: string, public code: "LIMIT_REACHED" | "NOT_FOUND" | "INVALID") {
    super(message);
  }
}

function getActiveQuotesAndInvoicesCount(): number {
  const db = getDatabase();
  const quotes = db.getFirstSync(
    "SELECT COUNT(*) as cnt FROM quotes WHERE status NOT IN ('rejected', 'expired')",
  ) as { cnt: number };
  const invoices = db.getFirstSync(
    "SELECT COUNT(*) as cnt FROM invoices WHERE status NOT IN ('void')",
  ) as { cnt: number };
  return (quotes?.cnt ?? 0) + (invoices?.cnt ?? 0);
}

function generateInvoiceNumber(prefix: string): string {
  const db = getDatabase();
  const row = db.getFirstSync("SELECT COUNT(*) as cnt FROM invoices") as { cnt: number };
  const next = (row?.cnt ?? 0) + 1;
  return `${prefix}-${String(next).padStart(4, "0")}`;
}

function getInvoiceTotal(invoiceId: string): number {
  const lineItems = InvoiceLineItemRepository.getByInvoice(invoiceId);
  return lineItems.reduce((sum, li) => sum + li.lineTotal, 0);
}

export const InvoiceService = {
  getAll(): Invoice[] {
    return invoiceRepository.getAll();
  },
  getById(id: string): Invoice {
    const invoice = invoiceRepository.getById(id);
    if (!invoice) throw new InvoiceServiceError("Invoice not found", "NOT_FOUND");
    return invoice;
  },
  getByClient(clientId: string): Invoice[] {
    return invoiceRepository.getAll("client_id = ?", [clientId]);
  },
  getWithLineItems(invoiceId: string): { invoice: Invoice; lineItems: LineItem[]; payments: InvoicePayment[] } {
    const invoice = this.getById(invoiceId);
    const lineItems = InvoiceLineItemRepository.getByInvoice(invoiceId);
    const payments = InvoicePaymentRepository.getByInvoice(invoiceId);
    return { invoice, lineItems, payments };
  },
  create(data: Omit<Invoice, "id" | "createdAt" | "updatedAt" | "invoiceNumber">, prefix: string = "INV"): Invoice {
    const activeCount = getActiveQuotesAndInvoicesCount();
    if (activeCount >= FREE_LIMITS.activeQuotesInvoices) {
      throw new InvoiceServiceError(
        `Free tier limit of ${FREE_LIMITS.activeQuotesInvoices} active quotes/invoices reached`,
        "LIMIT_REACHED",
      );
    }
    const invoiceNumber = generateInvoiceNumber(prefix);
    return invoiceRepository.create({ ...data, invoiceNumber });
  },
  update(id: string, data: Partial<Invoice>): Invoice {
    const invoice = invoiceRepository.update(id, data);
    if (!invoice) throw new InvoiceServiceError("Invoice not found", "NOT_FOUND");
    return invoice;
  },
  convertFromQuote(quoteId: string, prefix: string = "INV"): Invoice {
    const quote = quoteRepository.getById(quoteId);
    if (!quote) throw new InvoiceServiceError("Quote not found", "NOT_FOUND");

    const invoice = this.create({
      quoteId: quote.id,
      clientId: quote.clientId,
      projectId: quote.projectId,
      issueDate: new Date().toISOString().split("T")[0],
      paymentTerms: "net_30",
      status: "draft",
      discountType: quote.discountType,
      discountValue: quote.discountValue,
      taxRate: quote.taxRate,
      notesClient: quote.notesClient,
      notesInternal: quote.notesInternal,
    }, prefix);

    const quoteLineItems = QuoteLineItemRepository.getByQuote(quoteId);
    for (const li of quoteLineItems) {
      InvoiceLineItemRepository.create(invoice.id, {
        description: li.description,
        category: li.category,
        quantity: li.quantity,
        unit: li.unit,
        unitPrice: li.unitPrice,
        lineTotal: li.lineTotal,
        taxable: li.taxable,
        sortOrder: li.sortOrder,
      });
    }

    return invoice;
  },
  recordPayment(invoiceId: string, amount: number, method?: PaymentMethod, date?: string): InvoicePayment {
    this.getById(invoiceId); // ensure exists
    const payment = InvoicePaymentRepository.create({
      invoiceId,
      amount,
      paymentMethod: method,
      paymentDate: date || new Date().toISOString().split("T")[0],
    });

    const totalPaid = InvoicePaymentRepository.getTotalPaid(invoiceId);
    const invoiceTotal = getInvoiceTotal(invoiceId);
    const newStatus = totalPaid >= invoiceTotal ? "paid" : "partial";
    invoiceRepository.update(invoiceId, { status: newStatus });

    return payment;
  },
  getBalanceDue(invoiceId: string): number {
    const invoiceTotal = getInvoiceTotal(invoiceId);
    const totalPaid = InvoicePaymentRepository.getTotalPaid(invoiceId);
    return invoiceTotal - totalPaid;
  },
  getOverdue(): Invoice[] {
    const today = new Date().toISOString().split("T")[0];
    return invoiceRepository.getAll(
      "due_date < ? AND status NOT IN ('paid', 'void')",
      [today],
    );
  },
  pullFromProjectMaterials(invoiceId: string, projectId: string): LineItem[] {
    this.getById(invoiceId); // ensure exists
    const deductions = getDeductionsByProject(projectId);
    const created: LineItem[] = [];
    let sortOrder = 0;

    for (const ded of deductions) {
      const item = inventoryRepository.getById(ded.inventoryItemId);
      const unitCost = item?.unitCost ?? 0;
      const lineTotal = ded.quantityDeducted * unitCost;
      const lineItem = InvoiceLineItemRepository.create(invoiceId, {
        description: item ? `${item.name} (${ded.quantityDeducted} ${ded.unit})` : `Material deduction`,
        category: "material",
        quantity: ded.quantityDeducted,
        unit: ded.unit,
        unitPrice: unitCost,
        lineTotal,
        taxable: true,
        sortOrder: sortOrder++,
      });
      created.push(lineItem);
    }

    return created;
  },
  delete(id: string): void {
    const db = getDatabase();
    db.runSync("DELETE FROM invoice_payments WHERE invoice_id = ?", [id]);
    InvoiceLineItemRepository.deleteByInvoice(id);
    invoiceRepository.delete(id);
  },
};
