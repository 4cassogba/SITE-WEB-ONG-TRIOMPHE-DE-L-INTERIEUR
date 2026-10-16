"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { unstable_rethrow } from "next/navigation";
import jsQR from "jsqr";
import { checkInAction, checkInByIdAction, registerWalkInAction, searchParticipantsAction } from "./actions";
import type { CheckInResult, ParticipantMatch } from "@/lib/checkin/checkin";

// "walkin" : le formulaire d'inscription sur place est ouvert. Tout état autre
// qu'"idle" bloque déjà les scans caméra et les taps de recherche (cf.
// submitToken / submitParticipant), donc la caméra ne peut pas enregistrer un
// badge pendant que l'hôtesse saisit.
type ScanState =
  | { kind: "idle" }
  | { kind: "walkin" }
  | { kind: "checking" }
  | { kind: "result"; result: CheckInResult }
  | { kind: "error"; message: string };

// Résultat de la dernière recherche *complétée*, gardé avec la requête à
// laquelle il correspond. L'état "en cours de recherche" n'est pas stocké :
// il se déduit au rendu en comparant `searchQuery` à `outcome.query` (voir
// `outcomeForQuery` plus bas), pour ne jamais appeler setState de façon
// synchrone depuis l'effet de recherche.
type SearchOutcome =
  | { query: string; kind: "results"; matches: ParticipantMatch[] }
  | { query: string; kind: "error" };

const CHECKIN_FAILURE_MESSAGE = "Échec de la vérification. Vérifiez la connexion et réessayez.";
const SEARCH_DEBOUNCE_MS = 300;

export default function ScannerClient() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const lastSubmittedToken = useRef<string | null>(null);
  // Incrémenté à chaque recherche réellement envoyée au serveur ; permet
  // d'ignorer la réponse d'une requête devenue obsolète (une frappe plus
  // récente a déjà déclenché une nouvelle recherche).
  const searchRequestId = useRef(0);
  // Miroir de `state.kind`, lu par `submitToken`. `submitToken` doit rester
  // sans dépendances (voir l'effet caméra, `[submitToken]` : le faire
  // dépendre de `state` relancerait getUserMedia() à chaque check-in et
  // ferait clignoter le flux vidéo) mais doit quand même savoir si un scan
  // est déjà en cours ou un panneau affiché, pour ne pas écraser un résultat
  // encore non acquitté par l'agent avec celui d'un badge suivant.
  const stateKindRef = useRef<ScanState["kind"]>("idle");

  const [cameraError, setCameraError] = useState<string | null>(null);
  const [state, setState] = useState<ScanState>({ kind: "idle" });
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOutcome, setSearchOutcome] = useState<SearchOutcome | null>(null);
  const [walkIn, setWalkIn] = useState({ fullName: "", phone: "", email: "" });
  const [walkInError, setWalkInError] = useState<string | null>(null);
  const [walkInSubmitting, setWalkInSubmitting] = useState(false);

  // Seul point d'écriture de `state` : garde `stateKindRef` synchronisé sans
  // effet séparé (donc sans décalage d'une frame entre le rendu et le ref).
  const applyState = useCallback((next: ScanState) => {
    stateKindRef.current = next.kind;
    setState(next);
  }, []);

  const submitToken = useCallback(async (token: string) => {
    if (!token) return;
    // Un résultat, une erreur ou une vérification en cours occupe déjà
    // l'écran : un badge qui dérive dans le cadre ne doit ni relancer un
    // check-in concurrent, ni écraser silencieusement ce qui est affiché
    // avant que l'agent n'ait acquitté ("Scanner suivant"/"Réessayer").
    if (stateKindRef.current !== "idle") return;
    if (lastSubmittedToken.current === token) return;
    lastSubmittedToken.current = token;
    applyState({ kind: "checking" });
    try {
      const result = await checkInAction(token);
      applyState({ kind: "result", result });
    } catch (err) {
      // Une redirection interne à Next.js (ex. session admin expirée pendant
      // l'événement -> /admin/login) doit continuer sa route normale : elle
      // ne doit pas être avalée et affichée comme une simple erreur réseau.
      unstable_rethrow(err);
      console.error("Échec du check-in par jeton", err);
      // On relâche le verrou anti-doublon : sans ça, un badge dont la
      // vérification a échoué une fois ne pourrait plus jamais être
      // re-scanné sans recharger la page. Le badge ne sera cependant
      // re-décodé qu'après "Réessayer" (retour à idle), pas pendant que
      // l'erreur est affichée — voir le garde-fou stateKindRef ci-dessus.
      lastSubmittedToken.current = null;
      applyState({ kind: "error", message: CHECKIN_FAILURE_MESSAGE });
    }
  }, [applyState]);

  // Check-in déclenché par un résultat de recherche (secours manuel) plutôt
  // que par le scan caméra — même logique de résultat/erreur. Gardé sur
  // `state.kind` (pas seulement "checking") : tant qu'un résultat ou une
  // erreur est affiché, un second tap ne doit pas relancer de check-in.
  const submitParticipant = useCallback(
    async (participant: ParticipantMatch) => {
      if (state.kind !== "idle") return;
      applyState({ kind: "checking" });
      try {
        const result = await checkInByIdAction(participant.id);
        applyState({ kind: "result", result });
      } catch (err) {
        unstable_rethrow(err);
        console.error("Échec du check-in par recherche", err);
        applyState({ kind: "error", message: CHECKIN_FAILURE_MESSAGE });
      }
    },
    [state.kind, applyState],
  );

  // Préremplit depuis ce que l'hôtesse vient de chercher : des chiffres = un
  // téléphone, sinon un nom — elle ne retape pas ce qu'elle vient de saisir.
  const openWalkIn = useCallback(
    (prefill?: string) => {
      const text = (prefill ?? "").trim();
      const looksLikePhone = /^[+\d][\d\s.()-]{5,}$/.test(text);
      setWalkIn({ fullName: looksLikePhone ? "" : text, phone: looksLikePhone ? text : "", email: "" });
      setWalkInError(null);
      lastSubmittedToken.current = null;
      applyState({ kind: "walkin" });
    },
    [applyState],
  );

  const closeWalkIn = useCallback(() => {
    applyState({ kind: "idle" });
  }, [applyState]);

  async function submitWalkIn() {
    if (walkInSubmitting) return;
    setWalkInSubmitting(true);
    setWalkInError(null);
    try {
      const result = await registerWalkInAction(walkIn);
      if (result.status === "invalid") {
        setWalkInError(result.message);
        return;
      }
      applyState({ kind: "result", result });
      setSearchQuery("");
      setSearchOutcome(null);
    } catch (err) {
      unstable_rethrow(err);
      console.error("Échec de l'inscription sur place", err);
      setWalkInError(CHECKIN_FAILURE_MESSAGE);
    } finally {
      setWalkInSubmitting(false);
    }
  }

  // Après un résultat affiché, on autorise à nouveau le même jeton (au cas
  // où le même visiteur reviendrait volontairement se faire re-scanner) une
  // fois que l'agent a repris un nouveau scan. On réinitialise aussi la
  // recherche : la transaction précédente est terminée, la prochaine repart
  // d'une recherche vierge.
  const resetForNextScan = useCallback(() => {
    lastSubmittedToken.current = null;
    applyState({ kind: "idle" });
    setSearchQuery("");
    setSearchOutcome(null);
  }, [applyState]);

  // Dismiss d'un échec de vérification : relâche le verrou de jeton (pour
  // permettre un nouveau scan du même badge) sans toucher à la recherche en
  // cours, pour pouvoir retaper immédiatement sur le même résultat.
  const dismissError = useCallback(() => {
    lastSubmittedToken.current = null;
    applyState({ kind: "idle" });
  }, [applyState]);

  useEffect(() => {
    let stream: MediaStream | null = null;
    // Si l'agent quitte la page pendant que la boîte de dialogue de
    // permission caméra est encore ouverte, le nettoyage de cet effet
    // s'exécute avant que getUserMedia() ne se résolve — stream et
    // rafRef.current valent encore null à ce moment-là. Ce drapeau, capturé
    // par la closure, permet de le détecter quand la promesse se résout plus
    // tard et d'arrêter net (piste caméra coupée, boucle jamais démarrée).
    let cancelled = false;

    async function startCamera() {
      try {
        const acquired = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        if (cancelled) {
          acquired.getTracks().forEach((track) => track.stop());
          return;
        }
        stream = acquired;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        if (cancelled) return;
        scanLoop();
      } catch (err) {
        if (cancelled) return;
        console.error("Camera access failed", err);
        setCameraError("Impossible d'accéder à la caméra. Utilisez la recherche ci-dessous.");
      }
    }

    function scanLoop() {
      if (cancelled) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
        rafRef.current = requestAnimationFrame(scanLoop);
        return;
      }
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        rafRef.current = requestAnimationFrame(scanLoop);
        return;
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const decoded = jsQR(imageData.data, imageData.width, imageData.height);
      if (decoded?.data) {
        void submitToken(decoded.data);
      }
      rafRef.current = requestAnimationFrame(scanLoop);
    }

    startCamera();

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [submitToken]);

  // Recherche par nom/téléphone au fil de la frappe, avec un anti-rebond de
  // ~300 ms — une file d'attente à la porte ne doit pas dépendre d'un tap
  // supplémentaire sur un bouton "Rechercher". En dessous de 2 caractères, on
  // ne programme rien : l'affichage "vide" se déduit au rendu (showSearchPanel).
  useEffect(() => {
    const query = searchQuery.trim();
    if (query.length < 2) return;

    const timer = setTimeout(() => {
      const requestId = ++searchRequestId.current;
      searchParticipantsAction(query)
        .then((matches) => {
          if (searchRequestId.current !== requestId) return; // réponse obsolète
          setSearchOutcome({ query, kind: "results", matches });
        })
        .catch((err) => {
          unstable_rethrow(err);
          if (searchRequestId.current !== requestId) return;
          console.error("Échec de la recherche de participants", err);
          setSearchOutcome({ query, kind: "error" });
        });
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Retour tactile (Android uniquement : iOS n'expose pas l'API vibration) pour
  // qu'une hôtesse qui ne regarde pas l'écran sente un échec ou un doublon.
  useEffect(() => {
    if (state.kind !== "result") return;
    const ok = state.result.status === "success" || state.result.status === "registered";
    navigator.vibrate?.(ok ? [80] : [200, 100, 200]);
  }, [state]);

  const trimmedQuery = searchQuery.trim();
  const showSearchPanel = trimmedQuery.length >= 2;
  // N'affiche le résultat mémorisé que s'il correspond à la requête actuelle
  // — sinon une recherche précédente encore visible tromperait l'agent
  // pendant que la nouvelle est en cours (debounce ou requête en vol).
  const outcomeForQuery = searchOutcome?.query === trimmedQuery ? searchOutcome : null;

  const resultTone =
    state.kind === "result"
      ? state.result.status === "success" || state.result.status === "registered"
        ? "success"
        : state.result.status === "already"
          ? "warning"
          : "danger"
      : state.kind === "error"
        ? "danger"
        : null;

  const toneClass = {
    success: "bg-leaf-500 text-leaf-950",
    warning: "bg-amber-400 text-amber-950",
    danger: "bg-red-500 text-white",
  } as const;

  return (
    <div className="mx-auto mt-4 flex w-full max-w-md flex-1 flex-col gap-5 pb-48">
      {/* Réduite pendant une recherche : sinon, clavier ouvert, les résultats
          et le bouton d'inscription sur place tombent sous le clavier. La vidéo
          reste montée (simple changement de classe), le scan continue. */}
      <div
        className={`relative w-full overflow-hidden rounded-3xl bg-black shadow-2xl shadow-black/40 ring-1 ring-mist-50/15 transition-[height] duration-300 ${
          searchQuery.trim() ? "h-28" : "aspect-square max-h-[50dvh]"
        }`}
      >
        <video ref={videoRef} className="absolute inset-0 h-full w-full object-cover" autoPlay muted playsInline />
        <canvas ref={canvasRef} className="hidden" />
        {/* Cadre de visée : repères d'angle, sans bloquer la lecture du QR. */}
        <div aria-hidden className="pointer-events-none absolute inset-[12%] rounded-2xl">
          <span className="absolute left-0 top-0 h-8 w-8 rounded-tl-xl border-l-4 border-t-4 border-leaf-300" />
          <span className="absolute right-0 top-0 h-8 w-8 rounded-tr-xl border-r-4 border-t-4 border-leaf-300" />
          <span className="absolute bottom-0 left-0 h-8 w-8 rounded-bl-xl border-b-4 border-l-4 border-leaf-300" />
          <span className="absolute bottom-0 right-0 h-8 w-8 rounded-br-xl border-b-4 border-r-4 border-leaf-300" />
        </div>
        {!cameraError && !searchQuery.trim() && (
          <p className="absolute inset-x-0 bottom-3 text-center text-xs font-medium text-mist-50/80 drop-shadow">
            Placez le QR code du badge dans le cadre
          </p>
        )}
        {cameraError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/80 p-6 text-center">
            <p className="text-base font-semibold text-mist-50">Caméra indisponible</p>
            {!searchQuery.trim() && (
              <>
                <p className="text-sm text-mist-50/70">
                  Autorisez l&apos;accès à la caméra dans les réglages du navigateur, puis rechargez. En attendant,
                  utilisez la recherche ci-dessous.
                </p>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="mt-1 min-h-12 rounded-full bg-mist-50 px-6 text-base font-semibold text-leaf-950"
                >
                  Recharger
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <label htmlFor="participant-search" className="text-xs font-semibold uppercase tracking-wide text-mist-50/60">
          Secours manuel : nom ou téléphone
        </label>
        <input
          id="participant-search"
          type="search"
          inputMode="search"
          autoComplete="off"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Nom ou numéro de téléphone"
          className="min-h-14 min-w-0 rounded-2xl border border-mist-50/20 bg-mist-50/10 px-4 text-base text-mist-50 outline-none placeholder:text-mist-50/40 focus:border-leaf-300"
        />

        {showSearchPanel && (
          <div className="flex flex-col gap-2">
            {!outcomeForQuery && <p className="text-center text-sm text-mist-50/70">Recherche…</p>}
            {outcomeForQuery?.kind === "error" && (
              <p className="text-sm text-red-300">La recherche a échoué. Vérifiez la connexion et réessayez.</p>
            )}
            {outcomeForQuery?.kind === "results" && outcomeForQuery.matches.length === 0 && (
              <div className="rounded-2xl border border-amber-300/40 bg-amber-400/10 p-4 text-center">
                <p className="text-base font-semibold text-amber-100">Aucun résultat pour « {trimmedQuery} »</p>
                <button
                  type="button"
                  onClick={() => openWalkIn(trimmedQuery)}
                  className="mt-3 min-h-14 w-full rounded-full bg-amber-300 text-base font-bold text-amber-950 active:bg-amber-200"
                >
                  Inscrire sur place
                </button>
              </div>
            )}
            {outcomeForQuery?.kind === "results" &&
              outcomeForQuery.matches.map((match) => (
                <button
                  key={match.id}
                  type="button"
                  disabled={state.kind !== "idle"}
                  onClick={() => void submitParticipant(match)}
                  className="flex min-h-16 flex-col items-start justify-center gap-0.5 rounded-2xl border border-mist-50/15 bg-mist-50/10 px-4 py-3 text-left text-base text-mist-50 active:bg-mist-50/20 disabled:opacity-50"
                >
                  <span className="font-semibold">{match.fullName}</span>
                  <span className="text-sm text-mist-50/60">{match.phone}</span>
                  {match.attendedAt && (
                    <span className="mt-1 rounded-full bg-amber-500/25 px-2.5 py-0.5 text-xs text-amber-200">
                      Déjà enregistré(e) à {match.attendedAt.toLocaleTimeString("fr-FR")}
                    </span>
                  )}
                </button>
              ))}
          </div>
        )}
      </div>

      {!(outcomeForQuery?.kind === "results" && outcomeForQuery.matches.length === 0) && (
        <button
          type="button"
          onClick={() => openWalkIn(searchQuery)}
          disabled={state.kind !== "idle"}
          className="min-h-14 rounded-2xl border border-dashed border-mist-50/30 text-base font-semibold text-mist-50/90 active:bg-mist-50/10 disabled:opacity-50"
        >
          + Pas dans la liste ? Inscrire sur place
        </button>
      )}

      {/* Inscription sur place : seul le nom est obligatoire, téléphone et email
          sont facultatifs pour ne pas ralentir la file. */}
      {state.kind === "walkin" && (
        <div
          role="dialog"
          aria-label="Inscrire sur place"
          className="fixed inset-0 z-50 flex items-end bg-black/60 sm:items-center sm:justify-center"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void submitWalkIn();
            }}
            className="max-h-dvh w-full max-w-md overflow-y-auto rounded-t-3xl bg-mist-50 px-6 pt-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-leaf-950 sm:rounded-3xl"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl">Inscrire sur place</h2>
                <p className="mt-1 text-sm text-leaf-950/60">La personne sera marquée présente tout de suite.</p>
              </div>
              <button
                type="button"
                onClick={closeWalkIn}
                aria-label="Fermer"
                className="-mr-2 -mt-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-2xl text-leaf-950/60 active:bg-leaf-950/10"
              >
                ×
              </button>
            </div>

            <label className="mt-5 block text-xs font-semibold uppercase tracking-wide text-leaf-950/60" htmlFor="walkin-name">
              Nom complet
            </label>
            <input
              id="walkin-name"
              required
              autoFocus
              autoComplete="off"
              autoCapitalize="words"
              value={walkIn.fullName}
              onChange={(e) => setWalkIn((w) => ({ ...w, fullName: e.target.value }))}
              className="mt-1.5 min-h-14 w-full rounded-2xl border border-leaf-950/15 bg-white px-4 text-base outline-none focus:border-leaf-600"
            />

            <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-leaf-950/60" htmlFor="walkin-phone">
              Téléphone <span className="font-normal normal-case">(facultatif)</span>
            </label>
            <input
              id="walkin-phone"
              type="tel"
              inputMode="tel"
              autoComplete="off"
              value={walkIn.phone}
              onChange={(e) => setWalkIn((w) => ({ ...w, phone: e.target.value }))}
              className="mt-1.5 min-h-14 w-full rounded-2xl border border-leaf-950/15 bg-white px-4 text-base outline-none focus:border-leaf-600"
            />

            <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-leaf-950/60" htmlFor="walkin-email">
              Email <span className="font-normal normal-case">(facultatif)</span>
            </label>
            <input
              id="walkin-email"
              type="email"
              inputMode="email"
              autoComplete="off"
              autoCapitalize="none"
              value={walkIn.email}
              onChange={(e) => setWalkIn((w) => ({ ...w, email: e.target.value }))}
              className="mt-1.5 min-h-14 w-full rounded-2xl border border-leaf-950/15 bg-white px-4 text-base outline-none focus:border-leaf-600"
            />

            {walkInError && <p className="mt-3 text-sm font-medium text-red-700">{walkInError}</p>}

            <button
              type="submit"
              disabled={walkInSubmitting || walkIn.fullName.trim().length < 2}
              className="mt-5 min-h-14 w-full rounded-full bg-leaf-600 text-lg font-bold text-mist-50 active:bg-leaf-700 disabled:opacity-50"
            >
              {walkInSubmitting ? "Enregistrement…" : "Inscrire et marquer présent(e)"}
            </button>
          </form>
        </div>
      )}

      {/* Résultat : feuille fixée en bas de l'écran pour rester visible quelle
          que soit la hauteur du téléphone, marge basse = zone sûre iPhone. */}
      {(state.kind === "checking" || resultTone) && (
        <div
          role="status"
          aria-live="assertive"
          className={`fixed inset-x-0 bottom-0 z-50 rounded-t-3xl px-6 pt-6 text-center shadow-[0_-12px_40px_rgba(0,0,0,0.4)] pb-[max(1.5rem,env(safe-area-inset-bottom))] ${
            resultTone ? toneClass[resultTone] : "bg-mist-50 text-leaf-950"
          }`}
        >
          <div className="mx-auto max-w-md">
            {state.kind === "checking" && <p className="py-4 text-lg font-semibold">Vérification…</p>}

            {state.kind === "error" && <p className="text-lg font-semibold">{state.message}</p>}

            {state.kind === "result" && state.result.status === "not_found" && (
              <>
                <p className="text-4xl" aria-hidden>✕</p>
                <p className="mt-1 text-2xl font-bold">Billet invalide</p>
                <button
                  type="button"
                  onClick={() => {
                    resetForNextScan();
                    openWalkIn();
                  }}
                  className="mt-4 min-h-14 w-full rounded-full bg-white text-lg font-bold text-red-700"
                >
                  Inscrire sur place
                </button>
              </>
            )}
            {state.kind === "result" && state.result.status === "registered" && (
              <>
                <p className="text-4xl" aria-hidden>✓</p>
                <p className="mt-1 text-2xl font-bold">{state.result.fullName}</p>
                <p className="mt-1 text-base">Inscrit(e) et présent(e)</p>
              </>
            )}
            {state.kind === "result" && state.result.status === "already" && (
              <>
                <p className="text-4xl" aria-hidden>!</p>
                <p className="mt-1 text-2xl font-bold">{state.result.fullName}</p>
                <p className="mt-1 text-base">Déjà enregistré(e) à {state.result.attendedAt.toLocaleTimeString("fr-FR")}</p>
              </>
            )}
            {state.kind === "result" && state.result.status === "success" && (
              <>
                <p className="text-4xl" aria-hidden>✓</p>
                <p className="mt-1 text-2xl font-bold">{state.result.fullName}</p>
                <p className="mt-1 text-base">Enregistré(e) avec succès</p>
              </>
            )}

            {state.kind === "error" && (
              <button
                type="button"
                onClick={dismissError}
                className="mt-4 min-h-14 w-full rounded-full bg-black/20 text-lg font-bold"
              >
                Réessayer
              </button>
            )}
            {state.kind === "result" && (
              <button
                type="button"
                onClick={resetForNextScan}
                className="mt-4 min-h-14 w-full rounded-full bg-black/20 text-lg font-bold"
              >
                Scanner suivant
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
