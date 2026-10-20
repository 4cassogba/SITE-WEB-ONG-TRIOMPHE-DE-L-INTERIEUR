import { NextRequest, NextResponse } from "next/server";
import { createLead } from "@/lib/leads";

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  // Champ piège, invisible pour une vraie personne : un robot qui le remplit
  // reçoit un succès de façade, sans que rien ne soit enregistré.
  if (typeof body.website === "string" && body.website.trim() !== "") return NextResponse.json({ ok: true });

  const { fullName, channel, contact, needsHelp, sourcePath } = body;
  if (typeof fullName !== "string" || typeof contact !== "string" || (channel !== "email" && channel !== "whatsapp")) {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  try {
    const result = await createLead({
      fullName,
      channel,
      contact,
      needsHelp: needsHelp === true,
      sourcePath: typeof sourcePath === "string" ? sourcePath : undefined,
    });
    if (result.status === "invalid") return NextResponse.json({ error: result.error }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Opt-in lead creation failed", err);
    return NextResponse.json({ error: "Une erreur est survenue, réessayez dans un instant." }, { status: 500 });
  }
}
