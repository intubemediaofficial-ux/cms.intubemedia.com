import { kv } from "@/lib/redis";

const VENDORS_KEY = "cms_vendors";
const ASSIGNMENTS_KEY = "cms_channel_vendor_assignments";

export interface Vendor {
  id: string;
  name: string;
  createdByUserId: string | null;
  createdByEmail: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChannelVendorAssignment {
  channelId: string;
  vendorId: string;
  assignedByEmail: string;
  assignedAt: string;
  updatedAt: string;
}

export function getVendorsForOwner(
  vendors: Vendor[],
  ownerUserId: string | null
): Vendor[] {
  return vendors.filter((vendor) =>
    ownerUserId
      ? vendor.createdByUserId === ownerUserId
      : vendor.createdByUserId === null || vendor.createdByUserId === undefined
  );
}

export function removeScopedChannelVendorAssignments(
  assignments: ChannelVendorAssignment[],
  channelIds: Set<string>,
  scopedVendorIds: Set<string>
): ChannelVendorAssignment[] {
  return assignments.filter(
    (assignment) =>
      !channelIds.has(assignment.channelId) ||
      !scopedVendorIds.has(assignment.vendorId)
  );
}

export async function getVendors(): Promise<Vendor[]> {
  return (await kv.get<Vendor[]>(VENDORS_KEY)) || [];
}

export async function saveVendors(vendors: Vendor[]): Promise<void> {
  await kv.set(VENDORS_KEY, vendors);
}

export async function getVendorAssignments(): Promise<ChannelVendorAssignment[]> {
  return (await kv.get<ChannelVendorAssignment[]>(ASSIGNMENTS_KEY)) || [];
}

export async function saveVendorAssignments(
  assignments: ChannelVendorAssignment[]
): Promise<void> {
  await kv.set(ASSIGNMENTS_KEY, assignments);
}

export async function clearChannelVendorAssignments(channelIds: string[]): Promise<void> {
  if (channelIds.length === 0) return;
  const ids = new Set(channelIds);
  const assignments = await getVendorAssignments();
  const next = assignments.filter((assignment) => !ids.has(assignment.channelId));
  if (next.length !== assignments.length) await saveVendorAssignments(next);
}
