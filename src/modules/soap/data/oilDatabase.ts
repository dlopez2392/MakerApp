export interface SoapOil {
  name: string;
  sapNaOH: number;
  sapKOH: number;
  iodine: number;
  ins: number;
  hardness: number;
  cleansing: number;
  conditioning: number;
  bubbly: number;
  creamy: number;
  notes: string | null;
}

export const oilData: SoapOil[] = [
  { name: "Olive Oil", sapNaOH: 0.134, sapKOH: 0.188, iodine: 85, ins: 109, hardness: 17, cleansing: 0, conditioning: 82, bubbly: 0, creamy: 17, notes: "Castile base. High conditioning, low lather." },
  { name: "Coconut Oil 76", sapNaOH: 0.190, sapKOH: 0.266, iodine: 10, ins: 258, hardness: 79, cleansing: 67, conditioning: 6, bubbly: 67, creamy: 12, notes: "High cleansing and lather. Cap at 33% to avoid dryness." },
  { name: "Coconut Oil 92", sapNaOH: 0.190, sapKOH: 0.266, iodine: 10, ins: 258, hardness: 79, cleansing: 67, conditioning: 6, bubbly: 67, creamy: 12, notes: "Refined high-melt coconut. Same SAP as 76." },
  { name: "Palm Oil", sapNaOH: 0.141, sapKOH: 0.198, iodine: 53, ins: 145, hardness: 50, cleansing: 0, conditioning: 44, bubbly: 0, creamy: 50, notes: "Hardness and stable lather. Sustainability concerns." },
  { name: "Castor Oil", sapNaOH: 0.128, sapKOH: 0.180, iodine: 86, ins: 95, hardness: 0, cleansing: 0, conditioning: 90, bubbly: 46, creamy: 0, notes: "Lather booster. Use 5-10%. Sticky at high %." },
  { name: "Avocado Oil", sapNaOH: 0.133, sapKOH: 0.187, iodine: 86, ins: 99, hardness: 10, cleansing: 0, conditioning: 84, bubbly: 0, creamy: 10, notes: "Nourishing. Good for sensitive skin." },
  { name: "Sweet Almond Oil", sapNaOH: 0.136, sapKOH: 0.190, iodine: 99, ins: 97, hardness: 11, cleansing: 0, conditioning: 79, bubbly: 0, creamy: 11, notes: "Mild and conditioning." },
  { name: "Sunflower Oil", sapNaOH: 0.134, sapKOH: 0.188, iodine: 133, ins: 63, hardness: 11, cleansing: 0, conditioning: 79, bubbly: 0, creamy: 11, notes: "High oleic preferred for longer shelf life." },
  { name: "Soybean Oil", sapNaOH: 0.135, sapKOH: 0.190, iodine: 130, ins: 61, hardness: 16, cleansing: 0, conditioning: 78, bubbly: 0, creamy: 16, notes: "Inexpensive. Prone to rancidity—use antioxidant." },
  { name: "Lard", sapNaOH: 0.138, sapKOH: 0.194, iodine: 67, ins: 139, hardness: 47, cleansing: 0, conditioning: 47, bubbly: 0, creamy: 47, notes: "Traditional. Creamy lather, hard bar." },
  { name: "Tallow", sapNaOH: 0.140, sapKOH: 0.196, iodine: 47, ins: 147, hardness: 56, cleansing: 0, conditioning: 40, bubbly: 0, creamy: 56, notes: "Hard bar, creamy lather. Excellent for shaving soap." },
  { name: "Shea Butter", sapNaOH: 0.128, sapKOH: 0.180, iodine: 64, ins: 116, hardness: 45, cleansing: 0, conditioning: 50, bubbly: 0, creamy: 45, notes: "Adds conditioning. Use 5-15%." },
  { name: "Cocoa Butter", sapNaOH: 0.137, sapKOH: 0.193, iodine: 36, ins: 157, hardness: 60, cleansing: 0, conditioning: 34, bubbly: 0, creamy: 60, notes: "Hardness and skin feel. Cap at 15%." },
  { name: "Jojoba Oil", sapNaOH: 0.069, sapKOH: 0.097, iodine: 82, ins: 11, hardness: 0, cleansing: 0, conditioning: 96, bubbly: 0, creamy: 0, notes: "Technically a wax ester. Use 3-8% as superfat booster." },
  { name: "Hemp Seed Oil", sapNaOH: 0.135, sapKOH: 0.190, iodine: 166, ins: 39, hardness: 0, cleansing: 0, conditioning: 80, bubbly: 0, creamy: 0, notes: "High linolenic. Use with antioxidants. Skin-loving." },
  { name: "Grapeseed Oil", sapNaOH: 0.135, sapKOH: 0.190, iodine: 131, ins: 66, hardness: 0, cleansing: 0, conditioning: 85, bubbly: 0, creamy: 0, notes: "Light, conditioning. Prone to rancidity." },
  { name: "Rice Bran Oil", sapNaOH: 0.128, sapKOH: 0.180, iodine: 105, ins: 70, hardness: 19, cleansing: 0, conditioning: 75, bubbly: 0, creamy: 19, notes: "Good for skin. Similar to olive in behavior." },
  { name: "Mango Butter", sapNaOH: 0.137, sapKOH: 0.193, iodine: 55, ins: 146, hardness: 50, cleansing: 0, conditioning: 43, bubbly: 0, creamy: 50, notes: "Hard butter, adds skin feel. Use 5-15%." },
  { name: "Apricot Kernel Oil", sapNaOH: 0.135, sapKOH: 0.190, iodine: 100, ins: 91, hardness: 10, cleansing: 0, conditioning: 80, bubbly: 0, creamy: 10, notes: "Similar to sweet almond. Good for sensitive skin." },
  { name: "Canola Oil", sapNaOH: 0.124, sapKOH: 0.174, iodine: 110, ins: 56, hardness: 0, cleansing: 0, conditioning: 85, bubbly: 0, creamy: 0, notes: "Inexpensive olive substitute. Adds conditioning." },
];

export function findOil(name: string): SoapOil | undefined {
  return oilData.find(o => o.name.toLowerCase() === name.toLowerCase());
}
