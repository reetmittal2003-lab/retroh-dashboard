import { ContactEntry, WaitlistEntry } from "./types";

export type LeadTotals = {
  totalLeads: number;
  totalWaitlist: number;
  totalContacts: number;
  converted: number;
  conversionRate: number;
};

export type LeadBucket = {
  key: string;
  label: string;
  waitlist: number;
  contacts: number;
  total: number;
};

function dayKey(iso: string) {
  return new Date(iso).toISOString().slice(0, 10);
}

function dayLabel(key: string) {
  return new Date(key).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function weekKey(iso: string) {
  const d = new Date(iso);
  const start = new Date(d);
  start.setDate(d.getDate() - d.getDay());
  return start.toISOString().slice(0, 10);
}

function weekLabel(key: string) {
  return `Week of ${new Date(key).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
}

export function getLeadTotals(waitlist: WaitlistEntry[], contacts: ContactEntry[]): LeadTotals {
  const totalWaitlist = waitlist.length;
  const totalContacts = contacts.length;
  const converted = waitlist.filter((w) => w.status === "Converted").length;
  const totalLeads = totalWaitlist + totalContacts;

  return {
    totalLeads,
    totalWaitlist,
    totalContacts,
    converted,
    conversionRate: totalWaitlist ? Math.round((converted / totalWaitlist) * 1000) / 10 : 0,
  };
}

function bucketLeads(
  waitlist: WaitlistEntry[],
  contacts: ContactEntry[],
  keyFn: (iso: string) => string,
  labelFn: (key: string) => string
): LeadBucket[] {
  const buckets = new Map<string, { waitlist: number; contacts: number }>();

  waitlist.forEach((w) => {
    const key = keyFn(w.dateJoined);
    const entry = buckets.get(key) ?? { waitlist: 0, contacts: 0 };
    entry.waitlist += 1;
    buckets.set(key, entry);
  });

  contacts.forEach((c) => {
    const key = keyFn(c.dateSubmitted);
    const entry = buckets.get(key) ?? { waitlist: 0, contacts: 0 };
    entry.contacts += 1;
    buckets.set(key, entry);
  });

  return Array.from(buckets.keys())
    .sort()
    .map((key) => {
      const { waitlist, contacts } = buckets.get(key)!;
      return { key, label: labelFn(key), waitlist, contacts, total: waitlist + contacts };
    });
}

export function getLeadsByDay(waitlist: WaitlistEntry[], contacts: ContactEntry[]): LeadBucket[] {
  return bucketLeads(waitlist, contacts, dayKey, dayLabel);
}

export function getLeadsByWeek(waitlist: WaitlistEntry[], contacts: ContactEntry[]): LeadBucket[] {
  return bucketLeads(waitlist, contacts, weekKey, weekLabel);
}
