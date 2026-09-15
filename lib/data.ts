import {
  fetchContactSubmissions,
  fetchWaitlistSubmissions,
  fetchTastingFeedbackSubmissions,
  isUsingLiveData,
} from "./netlify";
import { getContactOverrides, getWaitlistOverrides } from "./store";
import { ContactEntry, WaitlistEntry, TastingFeedbackEntry } from "./types";

export async function getWaitlistData(): Promise<{ entries: WaitlistEntry[]; live: boolean }> {
  const [submissions, overrides] = await Promise.all([
    fetchWaitlistSubmissions(),
    getWaitlistOverrides(),
  ]);

  const entries: WaitlistEntry[] = submissions.map((s) => ({
    id: s.id,
    email: s.email,
    dateJoined: s.dateJoined,
    source: overrides[s.id]?.source ?? "Netlify Forms",
    status: (overrides[s.id]?.status as WaitlistEntry["status"]) ?? "New",
  }));

  entries.sort((a, b) => new Date(b.dateJoined).getTime() - new Date(a.dateJoined).getTime());

  return { entries, live: isUsingLiveData() };
}

export async function getContactsData(): Promise<{ entries: ContactEntry[]; live: boolean }> {
  const [submissions, overrides] = await Promise.all([
    fetchContactSubmissions(),
    getContactOverrides(),
  ]);

  const entries: ContactEntry[] = submissions.map((s) => ({
    id: s.id,
    name: s.name,
    email: s.email,
    subject: s.subject,
    message: s.message,
    dateSubmitted: s.dateSubmitted,
    followUpStatus:
      (overrides[s.id]?.followUpStatus as ContactEntry["followUpStatus"]) ?? "Open",
  }));

  entries.sort(
    (a, b) => new Date(b.dateSubmitted).getTime() - new Date(a.dateSubmitted).getTime()
  );

  return { entries, live: isUsingLiveData() };
}

export async function getTastingFeedbackData(): Promise<{
  entries: TastingFeedbackEntry[];
  live: boolean;
}> {
  const submissions = await fetchTastingFeedbackSubmissions();

  const entries: TastingFeedbackEntry[] = submissions.map((s) => ({
    id: s.id,
    respondentName: s.respondentName,
    respondentAge: s.respondentAge,
    respondentEmail: s.respondentEmail,
    triedSamples: s.triedSamples,
    dateSubmitted: s.dateSubmitted,
    products: s.products,
  }));

  entries.sort(
    (a, b) => new Date(b.dateSubmitted).getTime() - new Date(a.dateSubmitted).getTime()
  );

  return { entries, live: isUsingLiveData() };
}
