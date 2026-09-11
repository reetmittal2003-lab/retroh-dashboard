import { WaitlistEntry, ContactEntry, TastingFeedbackEntry, SampleFeedbackEntry } from "./types";
import { mockWaitlist, mockContacts, mockTastingFeedback, mockSampleFeedback } from "./mock-data";

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

export async function fetchTastingFeedbackSubmissions(): Promise<
  Pick<TastingFeedbackEntry, "id" | "respondentName" | "respondentAge" | "triedSamples" | "dateSubmitted">[]
> {
  if (!isConfigured()) {
    return mockTastingFeedback.map(
      ({ id, respondentName, respondentAge, triedSamples, dateSubmitted }) => ({
        id,
        respondentName,
        respondentAge,
        triedSamples,
        dateSubmitted,
      })
    );
  }
  const submissions = await getSubmissionsForForm("tasting-feedback");
  return submissions.map((s) => ({
    id: s.id,
    respondentName: s.data.respondent_name ?? "",
    respondentAge: s.data.respondent_age ?? "",
    triedSamples: [
      s.data["1al_tried"] ? "1AL" : null,
      s.data["nf2al_tried"] ? "NF / 2AL" : null,
      s.data["coco1rc_tried"] ? "COCO / 1RC" : null,
      s.data["1cc_tried"] ? "1CC" : null,
    ].filter((v): v is string => Boolean(v)),
    dateSubmitted: s.created_at,
  }));
}

export async function fetchSampleFeedbackSubmissions(): Promise<
  Pick<
    SampleFeedbackEntry,
    | "id"
    | "cookie"
    | "overall"
    | "taste"
    | "texture"
    | "sweetness"
    | "wouldBuy"
    | "likedMost"
    | "wouldChange"
    | "anythingElse"
    | "name"
    | "contact"
    | "dateSubmitted"
  >[]
> {
  if (!isConfigured()) {
    return mockSampleFeedback.map(
      ({
        id,
        cookie,
        overall,
        taste,
        texture,
        sweetness,
        wouldBuy,
        likedMost,
        wouldChange,
        anythingElse,
        name,
        contact,
        dateSubmitted,
      }) => ({
        id,
        cookie,
        overall,
        taste,
        texture,
        sweetness,
        wouldBuy,
        likedMost,
        wouldChange,
        anythingElse,
        name,
        contact,
        dateSubmitted,
      })
    );
  }
  const submissions = await getSubmissionsForForm("sample-feedback");
  return submissions.map((s) => ({
    id: s.id,
    cookie: s.data.cookie ?? "",
    overall: s.data.overall ?? "",
    taste: s.data.taste ?? "",
    texture: s.data.texture ?? "",
    sweetness: s.data.sweetness ?? "",
    wouldBuy: s.data.would_buy ?? "",
    likedMost: s.data.liked_most ?? "",
    wouldChange: s.data.would_change ?? "",
    anythingElse: s.data.anything_else ?? "",
    name: s.data.name ?? "",
    contact: s.data.contact ?? "",
    dateSubmitted: s.created_at,
  }));
}

export function isUsingLiveData() {
  return isConfigured();
}
