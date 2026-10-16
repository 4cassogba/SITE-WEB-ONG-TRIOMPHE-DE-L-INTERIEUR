"use server";

import { requireAdmin } from "@/lib/admin/auth";
import { upsertTeamMember } from "@/lib/admin/team";
import { generatePassword, generateScannerEmail, parseTeamLines } from "@/lib/admin/team-batch";

const EMAIL_DOMAIN = "ongtriomphedelinterieur.com";
const MAX_LINES = 30;

export type BatchRow = {
  fullName: string;
  email: string;
  password: string | null;
  status: "created" | "attributed" | "unchanged" | "failed";
};

export type BatchState = { error?: string; rows?: BatchRow[] } | null;

export async function addScannersAction(_prev: BatchState, formData: FormData): Promise<BatchState> {
  await requireAdmin();

  const role = formData.get("role")?.toString() === "admin" ? "admin" : "scanner";
  const lines = parseTeamLines(formData.get("names")?.toString() ?? "");
  if (lines.length === 0) return { error: "Écrivez au moins un nom." };
  if (lines.length > MAX_LINES) return { error: `Maximum ${MAX_LINES} personnes à la fois.` };

  const rows: BatchRow[] = [];
  for (const line of lines) {
    const email = line.email ?? generateScannerEmail(line.fullName, EMAIL_DOMAIN);
    const password = generatePassword();
    try {
      const result = await upsertTeamMember({ fullName: line.fullName, email, password, role });
      rows.push({
        fullName: line.fullName,
        email,
        password: result.status === "created" ? password : null,
        status: result.status,
      });
    } catch (err) {
      console.error("Team member creation failed", line.fullName, err);
      rows.push({ fullName: line.fullName, email, password: null, status: "failed" });
    }
  }
  return { rows };
}
