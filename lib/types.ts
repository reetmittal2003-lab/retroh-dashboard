export type WaitlistEntry = {
  id: string;
  email: string;
  dateJoined: string; // ISO string
  source: string;
  status: "New" | "Contacted" | "Converted" | "Unsubscribed";
};

export type ContactEntry = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  dateSubmitted: string; // ISO string
  followUpStatus: "Open" | "In progress" | "Resolved";
};

// The three cookies the tasting form asks about. Each key is also the prefix
// of its Netlify field names (e.g. "butter_almond_overall"). nf2al is a retired
// trial kept only so older responses still show up.
export const PRODUCT_KEYS = ["butter_almond", "choco_chip", "coconut", "nf2al"] as const;
export type ProductKey = (typeof PRODUCT_KEYS)[number];

export const PRODUCT_META: Record<ProductKey, { code: string; displayName: string | null }> = {
  butter_almond: { code: "Butter Almond", displayName: "Butter Almond" },
  choco_chip: { code: "Choco Chip", displayName: "Choco Chip" },
  coconut: { code: "Coconut", displayName: "Coconut" },
  nf2al: { code: "NF/2AL", displayName: null },
};

// Field-name prefixes used by earlier versions of the form, so old
// submissions still parse.
export const LEGACY_FIELD_PREFIXES: Record<ProductKey, string> = {
  butter_almond: "1al",
  choco_chip: "1cc",
  coconut: "coco1rc",
  nf2al: "nf2al",
};

export type Sweetness = "Too sweet" | "Just right" | "Not sweet enough";
export type Aftertaste = "None" | "Pleasant" | "Unpleasant";
export type PricePref = "₹100–120" | "₹120–160" | "₹160+";

export type ProductRating = {
  tried: boolean;
  overall: number | null; // 1-5
  taste: number | null; // 1-5
  texture: number | null; // 1-5
  sweetness: Sweetness | null;
  aftertaste: Aftertaste | null;
  price: PricePref | null;
  notes: string | null;
};

export type TastingFeedbackEntry = {
  id: string;
  respondentName: string;
  respondentAge: string;
  respondentEmail: string;
  triedSamples: string[]; // kept for backwards compat with the old summary/CSV view
  dateSubmitted: string; // ISO string
  products: Record<ProductKey, ProductRating>;
  // Not collected by the live form yet (no trial/batch/campaign/source
  // fields exist today). Always undefined against real data; present so
  // the analysis layer and UI have somewhere to hang this once it exists.
  batchId?: string;
  trialId?: string;
  campaign?: string;
  source?: string;
};

