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
