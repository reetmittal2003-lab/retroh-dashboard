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

// The four in-market trial codes the tasting form asks about today.
// "productKey" is what the raw Netlify field names are prefixed with
// (e.g. "1al_overall"); "displayName" is what we call it once it has a
// public identity. NF/2AL has none yet — it's still an unnamed trial.
export const PRODUCT_KEYS = ["1al", "nf2al", "coco1rc", "1cc"] as const;
export type ProductKey = (typeof PRODUCT_KEYS)[number];

export const PRODUCT_META: Record<ProductKey, { code: string; displayName: string | null }> = {
  "1al": { code: "1AL", displayName: "Butter Almond" },
  nf2al: { code: "NF/2AL", displayName: null },
  coco1rc: { code: "COCO/1RC", displayName: "Coconut Crunch" },
  "1cc": { code: "1CC", displayName: "Choco Chip" },
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

