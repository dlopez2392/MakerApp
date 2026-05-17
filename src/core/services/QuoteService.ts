import { getDatabase } from "../database/connection";
import { quoteRepository } from "../database/repositories/QuoteRepository";
import { QuoteLineItemRepository } from "../database/repositories/QuoteLineItemRepository";
import type { Quote, LineItem, CalculatorResult } from "../types";
import { FREE_LIMITS } from "../types";

export class QuoteServiceError extends Error {
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

function generateQuoteNumber(prefix: string): string {
  const db = getDatabase();
  const row = db.getFirstSync("SELECT COUNT(*) as cnt FROM quotes") as { cnt: number };
  const next = (row?.cnt ?? 0) + 1;
  return `${prefix}-${String(next).padStart(4, "0")}`;
}

export const QuoteService = {
  getAll(): Quote[] {
    return quoteRepository.getAll();
  },
  getById(id: string): Quote {
    const quote = quoteRepository.getById(id);
    if (!quote) throw new QuoteServiceError("Quote not found", "NOT_FOUND");
    return quote;
  },
  getByClient(clientId: string): Quote[] {
    return quoteRepository.getAll("client_id = ?", [clientId]);
  },
  getWithLineItems(quoteId: string): { quote: Quote; lineItems: LineItem[] } {
    const quote = this.getById(quoteId);
    const lineItems = QuoteLineItemRepository.getByQuote(quoteId);
    return { quote, lineItems };
  },
  create(data: Omit<Quote, "id" | "createdAt" | "updatedAt" | "quoteNumber">, prefix: string = "Q"): Quote {
    const activeCount = getActiveQuotesAndInvoicesCount();
    if (activeCount >= FREE_LIMITS.activeQuotesInvoices) {
      throw new QuoteServiceError(
        `Free tier limit of ${FREE_LIMITS.activeQuotesInvoices} active quotes/invoices reached`,
        "LIMIT_REACHED",
      );
    }
    const quoteNumber = generateQuoteNumber(prefix);
    return quoteRepository.create({ ...data, quoteNumber });
  },
  update(id: string, data: Partial<Quote>): Quote {
    const quote = quoteRepository.update(id, data);
    if (!quote) throw new QuoteServiceError("Quote not found", "NOT_FOUND");
    return quote;
  },
  addLineItem(quoteId: string, data: Omit<LineItem, "id" | "parentId">): LineItem {
    this.getById(quoteId); // ensure exists
    return QuoteLineItemRepository.create(quoteId, data);
  },
  updateLineItem(lineItemId: string, data: Partial<LineItem>): LineItem | null {
    return QuoteLineItemRepository.update(lineItemId, data);
  },
  removeLineItem(lineItemId: string): void {
    QuoteLineItemRepository.delete(lineItemId);
  },
  addTimeBasedLineItem(quoteId: string, description: string, estimatedMinutes: number, hourlyRate: number): LineItem {
    const hours = estimatedMinutes / 60;
    const lineTotal = Math.round(hours * hourlyRate * 100) / 100;
    return this.addLineItem(quoteId, {
      description,
      category: "labor",
      quantity: 1,
      unitPrice: lineTotal,
      lineTotal,
      taxable: true,
      sortOrder: 0,
    });
  },
  addLineItemFromCalculator(quoteId: string, result: CalculatorResult): LineItem {
    const outputs = result.outputsJson as Record<string, unknown>;
    const lineTotal = (outputs.totalCost as number) || (outputs.total as number) || 0;
    return this.addLineItem(quoteId, {
      description: result.label || `${result.calculatorType} calculation`,
      category: "other",
      quantity: 1,
      unitPrice: lineTotal,
      lineTotal,
      taxable: true,
      sortOrder: 0,
    });
  },
  delete(id: string): void {
    const db = getDatabase();
    db.runSync("DELETE FROM quote_line_items WHERE quote_id = ?", [id]);
    quoteRepository.delete(id);
  },
};
