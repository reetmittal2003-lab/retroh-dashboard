import { getStore } from "@netlify/blobs";
import { mockWaitlist, mockContacts } from "./mock-data";

type Store = {
  waitlistOverrides: Record<string, { status?: string; source?: string }>;
  contactOverrides: Record<string, { followUpStatus?: string }>;
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
