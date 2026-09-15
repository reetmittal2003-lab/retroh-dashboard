import {
  WaitlistEntry,
  ContactEntry,
  TastingFeedbackEntry,
  ProductKey,
  ProductRating,
  PRODUCT_KEYS,
  PRODUCT_META,
  Sweetness,
  Aftertaste,
  PricePref,
} from "./types";
import { mockWaitlist, mockContacts, mockTastingFeedback } from "./mock-data";

const NETLIFY_API = "https://api.netlify.com/api/v1";

type NetlifyForm = {
  id: string;
  name: string;
};

type NetlifySubmission = {
  id: string;
  created_at: string;
  data: Record<string, string>;
};

function isConfigured() {
  return Boolean(process.env.NETLIFY_ACCESS_TOKEN && process.env.NETLIFY_SITE_ID);
}

async function netlifyFetch<T>(path: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${NETLIFY_API}${path}`, {
      headers: { Authorization: `Bearer ${process.env.NETLIFY_ACCESS_TOKEN}` },
      cache: "no-store",
    });
  } catch {
    throw new Error("Could not reach the Netlify API. Check your network connection.");
  }
  if (res.status === 401 || res.status === 403) {
    throw new Error("Netlify rejected the access token. Check NETLIFY_ACCESS_TOKEN.");
  }
  if (res.status === 404) {
    throw new Error("Netlify site not found. Check NETLIFY_SITE_ID.");
  }
  if (!res.ok) {
    throw new Error(`Netlify API error ${res.status}: ${await res.text()}`);
  }
  return res.json() as Promise<T>;
}

async function getSubmissionsForForm(formName: string): Promise<NetlifySubmission[]> {
  const forms = await netlifyFetch<NetlifyForm[]>(
    `/sites/${process.env.NETLIFY_SITE_ID}/forms`
  );
  const form = forms.find((f) => f.name === formName);
  if (!form) return [];
  return netlifyFetch<NetlifySubmission[]>(`/forms/${form.id}/submissions`);
}

export async function fetchWaitlistSubmissions(): Promise<
  Pick<WaitlistEntry, "id" | "email" | "dateJoined">[]
> {
  if (!isConfigured()) {
    return mockWaitlist.map(({ id, email, dateJoined }) => ({ id, email, dateJoined }));
  }
  const submissions = await getSubmissionsForForm("waitlist");
  return submissions.map((s) => ({
    id: s.id,
    email: s.data.email ?? "",
    dateJoined: s.created_at,
  }));
}

export async function fetchContactSubmissions(): Promise<
  Pick<ContactEntry, "id" | "name" | "email" | "subject" | "message" | "dateSubmitted">[]
> {
  if (!isConfigured()) {
    return mockContacts.map(({ id, name, email, subject, message, dateSubmitted }) => ({
      id,
      name,
      email,
      subject,
      message,
      dateSubmitted,
    }));
  }
  const submissions = await getSubmissionsForForm("contact");
  return submissions.map((s) => ({
    id: s.id,
    name: s.data.name ?? "",
    email: s.data.email ?? "",
    subject: s.data.subject ?? "",
    message: s.data.message ?? "",
    dateSubmitted: s.created_at,
  }));
}

const SWEETNESS_VALUES: Sweetness[] = ["Too sweet", "Just right", "Not sweet enough"];
const AFTERTASTE_VALUES: Aftertaste[] = ["None", "Pleasant", "Unpleasant"];
const PRICE_VALUES: PricePref[] = ["₹100–120", "₹120–160", "₹160+"];

function toRating1to5(v: string | undefined): number | null {
  if (!v) return null;
  const n = Number(v);
  return Number.isInteger(n) && n >= 1 && n <= 5 ? n : null;
}
function toEnum<T extends string>(v: string | undefined, allowed: T[]): T | null {
  return v && (allowed as string[]).includes(v) ? (v as T) : null;
}
function toTextOrNull(v: string | undefined): string | null {
  const t = v?.trim();
  return t ? t : null;
}

function parseProductRating(data: Record<string, string>, code: string): ProductRating {
  const f = (key: string) => data[`${code}_${key}`];
  return {
    tried: f("tried") === "yes",
    overall: toRating1to5(f("overall")),
    taste: toRating1to5(f("taste")),
    texture: toRating1to5(f("texture")),
    sweetness: toEnum(f("sweetness"), SWEETNESS_VALUES),
    aftertaste: toEnum(f("aftertaste"), AFTERTASTE_VALUES),
    price: toEnum(f("price"), PRICE_VALUES),
    notes: toTextOrNull(f("notes")),
  };
}

export async function fetchTastingFeedbackSubmissions(): Promise<
  Pick<
    TastingFeedbackEntry,
    | "id"
    | "respondentName"
    | "respondentAge"
    | "respondentEmail"
    | "triedSamples"
    | "dateSubmitted"
    | "products"
  >[]
> {
  if (!isConfigured()) {
    return mockTastingFeedback;
  }
  const submissions = await getSubmissionsForForm("tasting-feedback");
  return submissions.map((s) => {
    const products = Object.fromEntries(
      PRODUCT_KEYS.map((key) => [key, parseProductRating(s.data, key)])
    ) as Record<ProductKey, ProductRating>;
    return {
      id: s.id,
      respondentName: s.data.respondent_name ?? "",
      respondentAge: s.data.respondent_age ?? "",
      respondentEmail: s.data.respondent_email ?? "",
      triedSamples: PRODUCT_KEYS.filter((key) => products[key].tried).map(
        (key) => PRODUCT_META[key].displayName ?? PRODUCT_META[key].code
      ),
      dateSubmitted: s.created_at,
      products,
    };
  });
}

export function isUsingLiveData() {
  return isConfigured();
}
