import { getStore } from "@netlify/blobs";
import { Customer } from "./types";
import { mockWaitlist, mockContacts } from "./mock-data";

type Store = {
  waitlistOverrides: Record<string, { status?: string; source?: string }>;
  contactOverrides: Record<string, { followUpStatus?: string }>;
  customers: Customer[];
};

const BLOB_KEY = "dashboard-store";

// Seeded from mock-data.ts so the sample-data demo shows realistic variety.
// Once real Netlify submissions are wired up, these ids won't match and the
// overrides simply won't apply.
const DEFAULT_WAITLIST_OVERRIDES = Object.fromEntries(
  mockWaitlist.map((w) => [w.id, { status: w.status, source: w.source }])
);
const DEFAULT_CONTACT_OVERRIDES = Object.fromEntries(
  mockContacts.map((c) => [c.id, { followUpStatus: c.followUpStatus }])
);

const DEFAULT_STORE: Store = {
  waitlistOverrides: DEFAULT_WAITLIST_OVERRIDES,
  contactOverrides: DEFAULT_CONTACT_OVERRIDES,
  customers: [
    {
      id: "cust-1",
      name: "FreshMart Grocers",
      type: "Retailer",
      email: "orders@freshmart.example.com",
      phone: "+91 98765 43210",
      location: "Mumbai, IN",
      notes: "Interested in stocking the full snack range across 4 outlets.",
      dateAdded: new Date().toISOString(),
    },
    {
      id: "cust-2",
      name: "Kavya Rao",
      type: "Influencer",
      email: "kavya.rao@example.com",
      phone: "+91 90000 11122",
      location: "Bengaluru, IN",
      notes: "Food content creator, 80k followers. Sent a sample kit.",
      dateAdded: new Date().toISOString(),
    },
    {
      id: "cust-3",
      name: "Coastal Foods Distribution",
      type: "Distributor",
      email: "partnerships@coastalfoods.example.com",
      phone: "+91 98111 22334",
      location: "Kochi, IN",
      notes: "Covers Kerala + Tamil Nadu modern trade.",
      dateAdded: new Date().toISOString(),
    },
  ],
};

function blobStore() {
  const siteID = process.env.NETLIFY_SITE_ID;
  const token = process.env.NETLIFY_ACCESS_TOKEN;
  if (!siteID || !token) {
    throw new Error(
      "NETLIFY_SITE_ID and NETLIFY_ACCESS_TOKEN are required to store dashboard data (Netlify Blobs)."
    );
  }
  // Explicit credentials work both on Netlify (where they're normally implicit)
  // and anywhere else this app is deployed, since Blobs is just an authenticated API.
  return getStore({ name: "retroh-dashboard", siteID, token });
}

async function readStore(): Promise<Store> {
  const store = blobStore();
  const data = await store.get(BLOB_KEY, { type: "json" });
  if (!data) {
    await store.setJSON(BLOB_KEY, DEFAULT_STORE);
    return DEFAULT_STORE;
  }
  return data as Store;
}

async function writeStore(store: Store) {
  await blobStore().setJSON(BLOB_KEY, store);
}

export async function getWaitlistOverrides() {
  return (await readStore()).waitlistOverrides;
}

export async function setWaitlistOverride(
  id: string,
  update: { status?: string; source?: string }
) {
  const store = await readStore();
  store.waitlistOverrides[id] = { ...store.waitlistOverrides[id], ...update };
  await writeStore(store);
  return store.waitlistOverrides[id];
}

export async function getContactOverrides() {
  return (await readStore()).contactOverrides;
}

export async function setContactFollowUp(id: string, followUpStatus: string) {
  const store = await readStore();
  store.contactOverrides[id] = { followUpStatus };
  await writeStore(store);
  return store.contactOverrides[id];
}

export async function getCustomers(): Promise<Customer[]> {
  return (await readStore()).customers;
}

export async function addCustomer(
  customer: Omit<Customer, "id" | "dateAdded">
): Promise<Customer> {
  const store = await readStore();
  const newCustomer: Customer = {
    ...customer,
    id: `cust-${Date.now()}`,
    dateAdded: new Date().toISOString(),
  };
  store.customers.unshift(newCustomer);
  await writeStore(store);
  return newCustomer;
}

export async function updateCustomer(
  id: string,
  update: Partial<Customer>
): Promise<Customer | null> {
  const store = await readStore();
  const idx = store.customers.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  store.customers[idx] = { ...store.customers[idx], ...update };
  await writeStore(store);
  return store.customers[idx];
}

export async function deleteCustomer(id: string) {
  const store = await readStore();
  store.customers = store.customers.filter((c) => c.id !== id);
  await writeStore(store);
}
