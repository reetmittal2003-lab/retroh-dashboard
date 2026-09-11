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

export type TastingFeedbackEntry = {
  id: string;
  respondentName: string;
  respondentAge: string;
  respondentEmail: string;
  triedSamples: string[];
  dateSubmitted: string; // ISO string
};

