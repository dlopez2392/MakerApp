import { inventoryRepository, getItemsBelowThreshold, getInventoryValue } from "../database/repositories/InventoryRepository";
import { createDeduction, getDeductionsByProject, getDeductionsByItem } from "../database/repositories/DeductionRepository";
import type { InventoryItem, InventoryDeduction, InventoryCategory } from "../types";
import { FREE_LIMITS } from "../types";

export class InventoryServiceError extends Error {
  constructor(message: string, public code: "LIMIT_REACHED" | "NOT_FOUND" | "INSUFFICIENT_STOCK" | "INVALID") {
    super(message);
  }
}

export const InventoryService = {
  getAll(): InventoryItem[] {
    return inventoryRepository.getAll();
  },
  getByCategory(category: InventoryCategory): InventoryItem[] {
    return inventoryRepository.getAll("master_category = ?", [category]);
  },
  getById(id: string): InventoryItem {
    const item = inventoryRepository.getById(id);
    if (!item) throw new InventoryServiceError("Inventory item not found", "NOT_FOUND");
    return item;
  },
  search(query: string): InventoryItem[] {
    return inventoryRepository.getAll("name LIKE ? OR sku LIKE ?", [`%${query}%`, `%${query}%`]);
  },
  create(data: Omit<InventoryItem, "id" | "createdAt" | "updatedAt">): InventoryItem {
    const count = inventoryRepository.count();
    if (count >= FREE_LIMITS.inventoryItems) {
      throw new InventoryServiceError(`Free tier limit of ${FREE_LIMITS.inventoryItems} inventory items reached`, "LIMIT_REACHED");
    }
    return inventoryRepository.create(data);
  },
  update(id: string, data: Partial<InventoryItem>): InventoryItem {
    const item = inventoryRepository.update(id, data);
    if (!item) throw new InventoryServiceError("Inventory item not found", "NOT_FOUND");
    return item;
  },
  deduct(itemId: string, quantity: number, projectId?: string, notes?: string): InventoryDeduction {
    const item = this.getById(itemId);
    if (item.quantity < quantity) {
      throw new InventoryServiceError(
        `Insufficient stock: have ${item.quantity} ${item.unit}, need ${quantity}`,
        "INSUFFICIENT_STOCK",
      );
    }
    const deduction = createDeduction({
      inventoryItemId: itemId,
      projectId,
      quantityDeducted: quantity,
      unit: item.unit,
      notes,
    });
    inventoryRepository.update(itemId, { quantity: item.quantity - quantity });
    return deduction;
  },
  getLowStockItems(): InventoryItem[] {
    return getItemsBelowThreshold();
  },
  getConsumptionByProject(projectId: string): InventoryDeduction[] {
    return getDeductionsByProject(projectId);
  },
  getConsumptionHistory(itemId: string): InventoryDeduction[] {
    return getDeductionsByItem(itemId);
  },
  getTotalValue(category?: InventoryCategory): number {
    return getInventoryValue(category);
  },
  delete(id: string): void {
    inventoryRepository.delete(id);
  },
};
