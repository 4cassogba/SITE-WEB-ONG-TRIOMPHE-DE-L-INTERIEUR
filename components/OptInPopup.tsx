"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";

const STORAGE_KEY = "optin-bien-etre-v1";
const DISMISS_COOLDOWN_MS = 14 * 24 * 60 * 60 * 1000;
const TRIGGER_SCROLL_RATIO = 0.35;
const TRIGGER_DELAY_MS = 8000;
// Pages où une personne est déjà en plein parcours d'inscription ou possède
// déjà son badge : lui proposer une newsletter par-dessus serait hors sujet.
const SUPPRESSED_PATHS = ["/cigibm-2026/inscription"];
const SUPPRESSED_PATH_PREFIXES = ["/cigibm-2026/badge/"];

type Step = "intro" | "name" | "channel" | "contact" | "done";
type Channel = "whatsapp" | "email";

function readStorage(): { state: "done" | "dismissed"; at: number } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeStorage(state: "done" | "dismissed") {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ state, at: Date.now() }));
  } catch {
    // Navigation privée : le pop-up pourra simplement se réafficher.
  }
}

const inputClass =
  "w-full rounded-2xl border border-mist-50/20 bg-mist-50/10 px-4 py-3.5 text-base text-mist-50 placeholder:text-mist-100/40 outline-none transition-colors focus:border-leaf-300 focus:bg-mist-50/15";

export default function OptInPopup() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("intro");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [channel, setChannel] = useState<Channel>("whatsapp");
  const [contact, setContact] = useState("");
  const [needsHelp, setNeedsHelp] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  const suppressed =
    SUPPRESSED_PATHS.includes(pathname) ||
    SUPPRESSED_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix)) ||
    Boolean(searchParams.get("ref"));

  useEffect(() => {
    if (suppressed) return;
    const saved = readStorage();
    if (saved?.state === "done") return;
    if (saved?.state === "dismissed" && Date.now() - saved.at < DISMISS_COOLDOWN_MS) return;
    if (sessionStorage.getItem(STORAGE_KEY)) return;

    let shown = false;
    const show = () => {
      if (shown) return;
      shown = true;
      setOpen(true);
      sessionStorage.setItem(STORAGE_KEY, "1");
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("mouseleave", onMouseLeave);
      clearTimeout(timer);
    };
    const onScroll = () => {
      const ratio = window.scrollY / (document.body.scrollHeight - window.innerHeight || 1);
      if (ratio >= TRIGGER_SCROLL_RATIO) show();
    };
    const onMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) show();
    };
    const timer = setTimeout(show, TRIGGER_DELAY_MS);
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("mouseleave", onMouseLeave);
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("mouseleave", onMouseLeave);
      clearTimeout(timer);
    };
  }, [suppressed]);

  function close() {
    if (step !== "done") writeStorage("dismissed");
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, step]);

  function goToChannel(e: FormEvent) {
    e.preventDefault();
    if (firstName.trim().length < 1 || lastName.trim().length < 1) {
      setError("Indiquez votre prénom et votre nom.");
      return;
    }
    setError(null);
    setStep("channel");
  }

  function pickChannel(c: Channel) {
    setChannel(c);
    setContact("");
    setError(null);
    setStep("contact");
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/optin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: `${firstName.trim()} ${lastName.trim()}`,
          channel,
          contact,
          needsHelp,
          website: honeypot,
          sourcePath: pathname,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Une erreur est survenue, réessayez dans un instant.");
        return;
      }
      writeStorage("done");
      setStep("done");
    } catch {
      setError("Connexion impossible. Vérifiez votre réseau et réessayez.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  const stepIndex = { intro: 0, name: 1, channel: 2, contact: 3, done: 3 }[step];
  const first = firstName.trim();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="optin-title"
      className="fixed inset-0 z-[60] flex items-end justify-center bg-ink/60 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        ref={dialogRef}
        className="optin-card relative flex max-h-dvh w-full max-w-md flex-col overflow-hidden rounded-t-3xl border border-mist-50/12 bg-leaf-950 shadow-2xl sm:rounded-3xl"
      >
        <button
          type="button"
          onClick={close}
          aria-label="Fermer"
          className="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-black/35 text-lg text-mist-50 backdrop-blur transition-colors hover:bg-black/55"
        >
          ✕
        </button>

        <div className="relative h-44 shrink-0 sm:h-52">
          <Image
            src="/images/cigibm/Coach Christelle.jpg"
            alt="Coach Christelle Gnimassou, présidente-fondatrice de l'ONG Triomphe de l'Intérieur"
            fill
            sizes="(min-width: 640px) 448px, 100vw"
            quality={90}
            className="object-cover object-[50%_6%]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-leaf-950 via-leaf-950/30 to-transparent" />
          <p className="absolute bottom-3 left-6 text-[11px] font-bold uppercase tracking-[0.2em] text-leaf-300">
            Votre bien-être mental
          </p>
        </div>

        <div className="overflow-y-auto px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-2 sm:px-8 sm:pb-8">
          <div className="flex gap-1.5" aria-hidden>
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors duration-300 ${i <= stepIndex ? "bg-leaf-400" : "bg-mist-50/15"}`}
              />
            ))}
          </div>

          <div key={step} className="optin-step mt-5">
            {step === "intro" && (
              <>
                <h2 id="optin-title" className="font-display text-[1.7rem] leading-tight text-mist-50">
                  Ne manquez aucun de nos événements ni nos astuces pour votre bien-être mental.
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-mist-100/70">
                  Quelques messages utiles, de temps en temps, par la voix de Coach Christelle. Gratuit, sans spam,
                  et vous pouvez demander à vous arrêter quand vous voulez.
                </p>
                <button
                  type="button"
                  onClick={() => setStep("name")}
                  className="mt-6 min-h-14 w-full rounded-full bg-azure-500 text-base font-bold text-mist-50 transition-colors hover:bg-azure-400 active:bg-azure-600"
                >
                  Je veux en profiter
                </button>
                <button type="button" onClick={close} className="mt-3 min-h-11 w-full text-sm text-mist-100/55 underline underline-offset-4">
                  Non merci, plus tard
                </button>
              </>
            )}

            {step === "name" && (
              <form onSubmit={goToChannel}>
                <h2 id="optin-title" className="font-display text-2xl leading-tight text-mist-50">
                  Déjà, rappelez-nous votre prénom et votre nom, s&apos;il vous plaît ?
                </h2>
                <div className="mt-5 space-y-3">
                  <input
                    aria-label="Prénom"
                    placeholder="Prénom"
                    autoFocus
                    autoComplete="given-name"
                    autoCapitalize="words"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={inputClass}
                  />
                  <input
                    aria-label="Nom"
                    placeholder="Nom"
                    autoComplete="family-name"
                    autoCapitalize="words"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className={inputClass}
                  />
                </div>
                {error && <p className="mt-3 text-sm font-medium text-amber-300">{error}</p>}
                <button type="submit" className="mt-5 min-h-14 w-full rounded-full bg-azure-500 text-base font-bold text-mist-50 transition-colors hover:bg-azure-400 active:bg-azure-600">
                  Continuer
                </button>
              </form>
            )}

            {step === "channel" && (
              <>
                <h2 id="optin-title" className="font-display text-2xl leading-tight text-mist-50">
                  Enchanté(e), {first} ! Vous êtes plutôt WhatsApp ou Email ?
                </h2>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => pickChannel("whatsapp")}
                    className="flex min-h-28 flex-col items-center justify-center gap-2 rounded-2xl border border-mist-50/20 bg-mist-50/10 px-3 py-4 text-mist-50 transition-all hover:border-[#25d366] hover:bg-[#25d366]/15 active:scale-[0.98]"
                  >
                    <svg viewBox="0 0 24 24" className="h-8 w-8" fill="#25d366" aria-hidden>
                      <path d="M12.04 2a9.9 9.9 0 0 0-8.5 14.9L2 22l5.2-1.5A9.9 9.9 0 1 0 12.04 2Zm0 1.8a8.1 8.1 0 1 1-4.2 15l-.3-.2-3 .9.9-2.9-.2-.3A8.1 8.1 0 0 1 12.04 3.8Zm-3 3.7c-.2 0-.5.1-.7.4-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2 3.2 5 4.4 2.4 1 2.9.8 3.4.7.5 0 1.7-.7 1.9-1.4.2-.7.2-1.3.2-1.4-.1-.1-.3-.2-.6-.4l-1.8-.9c-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.6.1a6.6 6.6 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.300.1-.2 0-.3 0-.5l-.8-1.900c-.2-.5-.4-.4-.6-.4Z" />
                    </svg>
                    <span className="text-base font-bold">WhatsApp</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => pickChannel("email")}
                    className="flex min-h-28 flex-col items-center justify-center gap-2 rounded-2xl border border-mist-50/20 bg-mist-50/10 px-3 py-4 text-mist-50 transition-all hover:border-azure-400 hover:bg-azure-500/15 active:scale-[0.98]"
                  >
                    <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="#87b7de" strokeWidth="1.8" aria-hidden>
                      <rect x="3" y="5.5" width="18" height="13" rx="2" />
                      <path d="m4 7 8 6 8-6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-base font-bold">Email</span>
                  </button>
                </div>
                <button type="button" onClick={() => setStep("name")} className="mt-3 min-h-11 w-full text-sm text-mist-100/55 underline underline-offset-4">
                  Retour
                </button>
              </>
            )}

            {step === "contact" && (
              <form onSubmit={submit}>
                <h2 id="optin-title" className="font-display text-2xl leading-tight text-mist-50">
                  {channel === "whatsapp" ? "Quel est votre numéro WhatsApp ?" : "Quelle est votre adresse email ?"}
                </h2>
                <input
                  aria-label={channel === "whatsapp" ? "Numéro WhatsApp" : "Adresse email"}
                  type={channel === "whatsapp" ? "tel" : "email"}
                  inputMode={channel === "whatsapp" ? "tel" : "email"}
                  autoComplete={channel === "whatsapp" ? "tel" : "email"}
                  autoCapitalize="none"
                  autoFocus
                  required
                  placeholder={channel === "whatsapp" ? "+229 01 97 00 00 00" : "vous@exemple.com"}
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className={`mt-5 ${inputClass}`}
                />
                {/* Champ piège : invisible, hors tabulation, ignoré des lecteurs d'écran. */}
                <input
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden
                  name="website"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  className="absolute -left-[9999px] h-0 w-0 opacity-0"
                />
                <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-2xl border border-mist-50/15 bg-mist-50/5 p-3.5 text-sm leading-snug text-mist-100/80">
                  <input
                    type="checkbox"
                    checked={needsHelp}
                    onChange={(e) => setNeedsHelp(e.target.checked)}
                    className="mt-0.5 h-5 w-5 shrink-0 accent-[#4ab051]"
                  />
                  <span>
                    J&apos;aimerais aussi qu&apos;on me rappelle pour <strong className="text-mist-50">de l&apos;aide pour ma santé mentale</strong>.
                  </span>
                </label>
                {error && <p className="mt-3 text-sm font-medium text-amber-300">{error}</p>}
                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-5 min-h-14 w-full rounded-full bg-azure-500 text-base font-bold text-mist-50 transition-colors hover:bg-azure-400 active:bg-azure-600 disabled:opacity-60"
                >
                  {submitting ? "Envoi…" : "Rejoindre"}
                </button>
                <p className="mt-3 text-center text-xs leading-relaxed text-mist-100/45">
                  En validant, vous acceptez d&apos;être contacté(e) par l&apos;ONG Triomphe de l&apos;Intérieur.
                </p>
                <button type="button" onClick={() => setStep("channel")} className="mt-1 min-h-11 w-full text-sm text-mist-100/55 underline underline-offset-4">
                  Retour
                </button>
              </form>
            )}

            {step === "done" && (
              <div className="py-2 text-center" role="status">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-leaf-500/20">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#93d297" strokeWidth="3" className="h-9 w-9" aria-hidden>
                    <path d="m5 12.5 4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h2 id="optin-title" className="mt-4 font-display text-2xl text-mist-50">
                  Merci {first} !
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-mist-100/75">
                  {needsHelp
                    ? "Nous vous recontactons très bientôt, avec bienveillance. Vous n'êtes pas seul(e)."
                    : `Vous recevrez bientôt nos prochains événements et astuces par ${channel === "whatsapp" ? "WhatsApp" : "email"}.`}
                </p>
                <button type="button" onClick={() => setOpen(false)} className="mt-6 min-h-14 w-full rounded-full bg-azure-500 text-base font-bold text-mist-50 transition-colors hover:bg-azure-400">
                  Fermer
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
