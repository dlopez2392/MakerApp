import { ProjectService } from "./ProjectService";
import { InventoryService } from "./InventoryService";
import { JournalService } from "./JournalService";

export interface ShopContext {
  activeProjects: { name: string; status: string; disciplines: string[] }[];
  lowStockItems: { name: string; quantity: number; unit: string }[];
  recentJournalTopics: string[];
  shopStats: {
    totalProjects: number;
    totalInventoryItems: number;
    journalStreak: number;
  };
}

export const ContextGatherer = {
  gather(): ShopContext {
    let activeProjects: ShopContext["activeProjects"] = [];
    let lowStockItems: ShopContext["lowStockItems"] = [];
    let recentJournalTopics: string[] = [];
    let totalProjects = 0;
    let totalInventoryItems = 0;
    let journalStreak = 0;

    try {
      const projects = ProjectService.getAll();
      totalProjects = projects.length;
      activeProjects = projects
        .filter((p) => ["idea", "design", "in-progress", "finishing"].includes(p.status))
        .slice(0, 5)
        .map((p) => ({ name: p.name, status: p.status, disciplines: p.disciplineTags }));
    } catch {}

    try {
      const items = InventoryService.getAll();
      totalInventoryItems = items.length;
      lowStockItems = InventoryService.getLowStockItems()
        .slice(0, 5)
        .map((i) => ({ name: i.name, quantity: i.quantity, unit: i.unit }));
    } catch {}

    try {
      const entries = JournalService.getAll().slice(0, 5);
      recentJournalTopics = entries
        .map((e) => e.title || e.bodyRichText?.slice(0, 60) || "")
        .filter(Boolean);
      journalStreak = JournalService.getStreak();
    } catch {}

    return {
      activeProjects,
      lowStockItems,
      recentJournalTopics,
      shopStats: { totalProjects, totalInventoryItems, journalStreak },
    };
  },

  formatForPrompt(ctx: ShopContext): string {
    const parts: string[] = [];

    if (ctx.activeProjects.length > 0) {
      parts.push(
        "Active projects: " +
          ctx.activeProjects
            .map((p) => `${p.name} (${p.status}, ${p.disciplines.join("/") || "general"})`)
            .join("; "),
      );
    }

    if (ctx.lowStockItems.length > 0) {
      parts.push(
        "Low stock: " +
          ctx.lowStockItems.map((i) => `${i.name}: ${i.quantity} ${i.unit}`).join("; "),
      );
    }

    if (ctx.recentJournalTopics.length > 0) {
      parts.push("Recent journal topics: " + ctx.recentJournalTopics.join("; "));
    }

    parts.push(
      `Shop stats: ${ctx.shopStats.totalProjects} projects, ${ctx.shopStats.totalInventoryItems} inventory items, ${ctx.shopStats.journalStreak}-day journal streak`,
    );

    if (parts.length === 0) return "";
    return "\n\nUser's shop context:\n" + parts.join("\n");
  },
};
