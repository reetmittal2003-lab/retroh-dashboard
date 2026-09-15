import {
  WaitlistEntry,
  ContactEntry,
  TastingFeedbackEntry,
  ProductKey,
  ProductRating,
  PRODUCT_KEYS,
  PRODUCT_META,
} from "./types";

const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
};

export const mockWaitlist: WaitlistEntry[] = [
  { id: "wl-1", email: "aisha.k@example.com", dateJoined: daysAgo(1), source: "Netlify Forms", status: "New" },
  { id: "wl-2", email: "rohan.mehta@example.com", dateJoined: daysAgo(3), source: "Netlify Forms", status: "Contacted" },
  { id: "wl-3", email: "priya.sen@example.com", dateJoined: daysAgo(6), source: "Netlify Forms", status: "New" },
  { id: "wl-4", email: "dev.patel@example.com", dateJoined: daysAgo(10), source: "Netlify Forms", status: "Converted" },
  { id: "wl-5", email: "neha.iyer@example.com", dateJoined: daysAgo(14), source: "Netlify Forms", status: "New" },
  { id: "wl-6", email: "kabir.shah@example.com", dateJoined: daysAgo(20), source: "Netlify Forms", status: "Unsubscribed" },
  { id: "wl-7", email: "sara.j@example.com", dateJoined: daysAgo(28), source: "Netlify Forms", status: "New" },
  { id: "wl-8", email: "vikram.rao@example.com", dateJoined: daysAgo(35), source: "Netlify Forms", status: "Contacted" },
];

export const mockContacts: ContactEntry[] = [
  {
    id: "ct-1",
    name: "Ananya Gupta",
    email: "ananya.g@example.com",
    subject: "Trade & Distribution",
    message: "We run a specialty grocery chain in Mumbai and would love to stock RETROH products.",
    dateSubmitted: daysAgo(2),
    followUpStatus: "Open",
  },
  {
    id: "ct-2",
    name: "Sam Fernandes",
    email: "sam.f@example.com",
    subject: "Press & Media",
    message: "Writing a feature on comfort-food brands, would love a quote from the founders.",
    dateSubmitted: daysAgo(5),
    followUpStatus: "In progress",
  },
  {
    id: "ct-3",
    name: "Meera Nair",
    email: "meera.n@example.com",
    subject: "General enquiry",
    message: "Do you ship to Kochi? Loved the packaging on Instagram.",
    dateSubmitted: daysAgo(9),
    followUpStatus: "Resolved",
  },
];

// Not tried: every field stays null so downstream aggregation treats it
// exactly like a real "Didn't try" skip.
const skipped: ProductRating = {
  tried: false,
  overall: null,
  taste: null,
  texture: null,
  sweetness: null,
  aftertaste: null,
  price: null,
  notes: null,
};

function rated(r: Omit<ProductRating, "tried">): ProductRating {
  return { tried: true, ...r };
}

function productsFor(entries: Partial<Record<ProductKey, ProductRating>>): Record<ProductKey, ProductRating> {
  return Object.fromEntries(PRODUCT_KEYS.map((k) => [k, entries[k] ?? skipped])) as Record<
    ProductKey,
    ProductRating
  >;
}

function triedSamplesFor(products: Record<ProductKey, ProductRating>): string[] {
  return PRODUCT_KEYS.filter((k) => products[k].tried).map(
    (k) => PRODUCT_META[k].displayName ?? PRODUCT_META[k].code
  );
}

function tastingEntry(
  id: string,
  respondentName: string,
  respondentAge: string,
  daysBack: number,
  entries: Partial<Record<ProductKey, ProductRating>>
): TastingFeedbackEntry {
  const products = productsFor(entries);
  return {
    id,
    respondentName,
    respondentAge,
    respondentEmail: `${respondentName.toLowerCase().replace(/\s+/g, ".")}@example.com`,
    triedSamples: triedSamplesFor(products),
    dateSubmitted: daysAgo(daysBack),
    products,
  };
}

export const mockTastingFeedback: TastingFeedbackEntry[] = [
  tastingEntry("tf-1", "Kavya Reddy", "25–34", 1, {
    "1al": rated({ overall: 4, taste: 4, texture: 5, sweetness: "Just right", aftertaste: "Pleasant", price: "₹120–160", notes: "Really buttery, almonds came through nicely." }),
    nf2al: rated({ overall: 3, taste: 3, texture: 3, sweetness: "Not sweet enough", aftertaste: "None", price: "₹100–120", notes: "Felt a bit plain compared to the others." }),
    coco1rc: rated({ overall: 5, taste: 5, texture: 4, sweetness: "Just right", aftertaste: "Pleasant", price: "₹120–160", notes: "Coconut flavour is strong, loved it." }),
    "1cc": rated({ overall: 4, taste: 5, texture: 3, sweetness: "Too sweet", aftertaste: "Pleasant", price: "₹120–160", notes: "Texture a bit too soft for a choco chip cookie." }),
  }),
  tastingEntry("tf-2", "Arjun Malhotra", "35–44", 2, {
    "1al": rated({ overall: 5, taste: 5, texture: 4, sweetness: "Just right", aftertaste: "Pleasant", price: "₹160+", notes: "Best of the four, would buy immediately." }),
    "1cc": rated({ overall: 3, taste: 4, texture: 2, sweetness: "Too sweet", aftertaste: "Unpleasant", price: "₹100–120", notes: "Too soft and a bit too sweet for my taste." }),
  }),
  tastingEntry("tf-3", "Ishita Bose", "18–24", 4, {
    nf2al: rated({ overall: 3, taste: 3, texture: 4, sweetness: "Just right", aftertaste: "None", price: "₹100–120", notes: null }),
    coco1rc: rated({ overall: 4, taste: 4, texture: 4, sweetness: "Just right", aftertaste: "Pleasant", price: "₹120–160", notes: "Nostalgic, tastes like the coconut biscuits from childhood." }),
  }),
  tastingEntry("tf-4", "Rhea Kapoor", "25–34", 5, {
    "1al": rated({ overall: 4, taste: 4, texture: 4, sweetness: "Just right", aftertaste: "Pleasant", price: "₹120–160", notes: "Solid, nothing to change." }),
    coco1rc: rated({ overall: 3, taste: 3, texture: 3, sweetness: "Too sweet", aftertaste: "Unpleasant", price: "₹100–120", notes: "A little too sweet, aftertaste lingered." }),
    "1cc": rated({ overall: 5, taste: 5, texture: 4, sweetness: "Just right", aftertaste: "Pleasant", price: "₹160+", notes: "Perfect balance, this is the one." }),
  }),
  tastingEntry("tf-5", "Vivaan Shah", "45–54", 7, {
    "1al": rated({ overall: 4, taste: 4, texture: 3, sweetness: "Just right", aftertaste: "Pleasant", price: "₹120–160", notes: null }),
    nf2al: rated({ overall: 2, taste: 2, texture: 3, sweetness: "Not sweet enough", aftertaste: "Unpleasant", price: "₹100–120", notes: "Didn't stand out, felt unfinished." }),
    "1cc": rated({ overall: 4, taste: 4, texture: 3, sweetness: "Just right", aftertaste: "Pleasant", price: "₹120–160", notes: "Good, texture could be a touch crunchier." }),
  }),
  tastingEntry("tf-6", "Ananya Iyer", "18–24", 8, {
    coco1rc: rated({ overall: 5, taste: 5, texture: 5, sweetness: "Just right", aftertaste: "Pleasant", price: "₹160+", notes: "Favourite by far." }),
    "1cc": rated({ overall: 3, taste: 3, texture: 2, sweetness: "Too sweet", aftertaste: "Unpleasant", price: "₹100–120", notes: "Too soft, felt underbaked." }),
  }),
  tastingEntry("tf-7", "Karthik Nair", "35–44", 10, {
    "1al": rated({ overall: 3, taste: 3, texture: 3, sweetness: "Just right", aftertaste: "None", price: "₹100–120", notes: "Fine, not memorable." }),
    nf2al: rated({ overall: 3, taste: 3, texture: 3, sweetness: "Just right", aftertaste: "None", price: "₹100–120", notes: null }),
    coco1rc: rated({ overall: 4, taste: 4, texture: 4, sweetness: "Just right", aftertaste: "Pleasant", price: "₹120–160", notes: null }),
    "1cc": rated({ overall: 4, taste: 4, texture: 3, sweetness: "Too sweet", aftertaste: "Pleasant", price: "₹120–160", notes: "Sweetness on the edge but still good." }),
  }),
  tastingEntry("tf-8", "Meher Chawla", "55+", 12, {
    "1al": rated({ overall: 5, taste: 4, texture: 5, sweetness: "Just right", aftertaste: "Pleasant", price: "₹160+", notes: "Reminds me of homemade almond cookies." }),
    "1cc": rated({ overall: 2, taste: 3, texture: 1, sweetness: "Too sweet", aftertaste: "Unpleasant", price: "₹100–120", notes: "Too soft and too sweet, needs work." }),
  }),
];
