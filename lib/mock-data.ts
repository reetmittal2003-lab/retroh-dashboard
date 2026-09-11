import { WaitlistEntry, ContactEntry, TastingFeedbackEntry } from "./types";

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

export const mockTastingFeedback: TastingFeedbackEntry[] = [
  {
    id: "tf-1",
    respondentName: "Kavya Reddy",
    respondentAge: "25-34",
    respondentEmail: "kavya.reddy@example.com",
    triedSamples: ["1AL", "NF / 2AL", "COCO / 1RC", "1CC"],
    dateSubmitted: daysAgo(1),
  },
  {
    id: "tf-2",
    respondentName: "Arjun Malhotra",
    respondentAge: "35-44",
    respondentEmail: "arjun.malhotra@example.com",
    triedSamples: ["1AL", "1CC"],
    dateSubmitted: daysAgo(2),
  },
  {
    id: "tf-3",
    respondentName: "Ishita Bose",
    respondentAge: "18-24",
    respondentEmail: "ishita.bose@example.com",
    triedSamples: ["NF / 2AL", "COCO / 1RC"],
    dateSubmitted: daysAgo(4),
  },
];
