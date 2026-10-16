"use server";

import { requireScanAccess } from "@/lib/admin/auth";
import {
  checkInParticipant,
  checkInParticipantById,
  registerWalkIn,
  searchParticipants,
  type CheckInResult,
  type ParticipantMatch,
} from "@/lib/checkin/checkin";

export async function checkInAction(token: string): Promise<CheckInResult> {
  const session = await requireScanAccess();
  return checkInParticipant(token.trim(), session.id);
}

// Manual fallback for bad lighting / camera failures at the door: search by
// name or phone instead of scanning the QR code.
export async function searchParticipantsAction(query: string): Promise<ParticipantMatch[]> {
  await requireScanAccess();
  return searchParticipants(query);
}

// Personne absente de la liste : inscription + présence en un seul geste.
export async function registerWalkInAction(input: {
  fullName: string;
  phone?: string;
  email?: string;
}): Promise<CheckInResult> {
  const session = await requireScanAccess();
  return registerWalkIn(input, session.id);
}

// Companion to searchParticipantsAction: check in whoever staff picked from
// the search results.
export async function checkInByIdAction(participantId: string): Promise<CheckInResult> {
  const session = await requireScanAccess();
  return checkInParticipantById(participantId, session.id);
}
