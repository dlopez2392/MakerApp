export type ProjectStatus = "idea" | "design" | "in-progress" | "finishing" | "complete" | "delivered" | "archived";
export type Discipline = "woodworking" | "laser" | "cnc" | "3d-print" | "resin" | "knife" | "leather" | "candle" | "soap" | "mixed";
export type QuoteStatus = "draft" | "sent" | "viewed" | "accepted" | "rejected" | "expired";
export type InvoiceStatus = "draft" | "sent" | "viewed" | "partial" | "paid" | "overdue" | "void";
export type PaymentTerms = "due_on_receipt" | "net_7" | "net_15" | "net_30" | "net_60";
export type PaymentMethod = "cash" | "check" | "venmo" | "zelle" | "paypal" | "card" | "other";
export type Mood = "great" | "good" | "okay" | "rough";
export type LineItemCategory = "labor" | "material" | "laser_work" | "cnc_work" | "3d_printing" | "finishing" | "design" | "delivery" | "other";
export type InventoryCategory = "woodworking" | "laser" | "cnc" | "3d_printing" | "general_shop" | "resin" | "knife" | "leather" | "candle" | "soap";
export type ClientTag = "residential" | "commercial" | "wholesale" | "repeat" | "vip" | "lead";
export type ClientSource = "referral" | "instagram" | "etsy" | "website" | "word_of_mouth" | "other";
export type UnitSystem = "imperial" | "metric";

export interface Project {
  id: string;
  userId?: string;
  name: string;
  clientId?: string;
  status: ProjectStatus;
  disciplineTags: Discipline[];
  startDate?: string;
  targetDate?: string;
  completedDate?: string;
  estimatedHours?: number;
  actualHours: number;
  budget?: number;
  notes?: string;
  coverPhotoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryItem {
  id: string;
  userId?: string;
  name: string;
  masterCategory: InventoryCategory;
  subCategory?: string;
  sku?: string;
  supplierName?: string;
  supplierUrl?: string;
  quantity: number;
  unit: string;
  unitCost?: number;
  location?: string;
  lowStockThreshold?: number;
  notes?: string;
  photoUrl?: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryDeduction {
  id: string;
  inventoryItemId: string;
  projectId?: string;
  quantityDeducted: number;
  unit: string;
  notes?: string;
  deductedAt: string;
  userId?: string;
}

export interface Client {
  id: string;
  userId?: string;
  fullName: string;
  company?: string;
  email?: string;
  phone?: string;
  preferredContact?: string;
  billingAddress?: string;
  shippingAddress?: string;
  tags: ClientTag[];
  source?: ClientSource;
  notes?: string;
  internalRating?: number;
  createdAt: string;
  updatedAt: string;
}

export interface JournalEntry {
  id: string;
  userId?: string;
  entryDate: string;
  title?: string;
  bodyRichText?: string;
  disciplineTags: Discipline[];
  projectIds: string[];
  hoursLogged?: number;
  mood?: Mood;
  machineUsed?: string;
  photoUrls: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Quote {
  id: string;
  userId?: string;
  clientId: string;
  projectId?: string;
  quoteNumber: string;
  validUntil?: string;
  status: QuoteStatus;
  discountType?: "percentage" | "flat";
  discountValue?: number;
  taxRate?: number;
  notesClient?: string;
  notesInternal?: string;
  terms?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LineItem {
  id: string;
  parentId: string;
  description: string;
  category?: LineItemCategory;
  quantity: number;
  unit?: string;
  unitPrice: number;
  lineTotal: number;
  taxable: boolean;
  sortOrder: number;
}

export interface Invoice {
  id: string;
  userId?: string;
  quoteId?: string;
  clientId: string;
  projectId?: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate?: string;
  paymentTerms: PaymentTerms;
  status: InvoiceStatus;
  discountType?: "percentage" | "flat";
  discountValue?: number;
  taxRate?: number;
  notesClient?: string;
  notesInternal?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoicePayment {
  id: string;
  invoiceId: string;
  amount: number;
  paymentMethod?: PaymentMethod;
  paymentDate: string;
  notes?: string;
}

export interface CalculatorResult {
  id: string;
  userId?: string;
  projectId?: string;
  module: string;
  calculatorType: string;
  inputsJson: Record<string, unknown>;
  outputsJson: Record<string, unknown>;
  label?: string;
  createdAt: string;
}

export interface SavedRecipe {
  id: string;
  userId?: string;
  module: string;
  recipeType: string;
  name: string;
  configJson: Record<string, unknown>;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WoodSpecies {
  id: string;
  commonName: string;
  botanicalName?: string;
  jankaHardness?: number;
  densityLbsFt3?: number;
  tangentialShrinkage?: number;
  radialShrinkage?: number;
  typicalUses?: string;
  finishingNotes?: string;
  toxicityWarnings?: string;
  priceTier?: string;
  domestic: boolean;
}

export interface UserSettings {
  unitSystem: UnitSystem;
  shopName?: string;
  shopLogoUrl?: string;
  hourlyRate?: number;
  taxRate?: number;
  markupPercent?: number;
  quotePrefix?: string;
  invoicePrefix?: string;
  terms?: string;
}

export const FREE_LIMITS = {
  projects: 10,
  inventoryItems: 50,
  journalEntries: 30,
  clients: 5,
  activeQuotesInvoices: 3,
  calculatorResultsPerModule: 10,
} as const;
