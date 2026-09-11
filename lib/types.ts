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
  triedSamples: string[];
  dateSubmitted: string; // ISO string
};

export type SampleFeedbackEntry = {
  id: string;
  cookie: string;
  overall: string;
  taste: string;
  texture: string;
  sweetness: string;
  wouldBuy: string;
  likedMost: string;
  wouldChange: string;
  anythingElse: string;
  name: string;
  contact: string;
  dateSubmitted: string; // ISO string
};

export type CustomerType = "Retailer" | "Influencer" | "Distributor";

export type Customer = {
  id: string;
  name: string;
  type: CustomerType;
  email: string;
  phone: string;
  location: string;
  notes: string;
  dateAdded: string; // ISO string
};
