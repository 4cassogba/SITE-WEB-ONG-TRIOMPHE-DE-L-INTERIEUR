"use client";

import type { CSSProperties } from "react";
import Image from "next/image";

const OPEN_OPTIN_EVENT = "optin:open";

function openOptIn() {
  window.dispatchEvent(new Event(OPEN_OPTIN_EVENT));
}

// Particules qui montent doucement : position, taille et rythme fixes (pas de
// Math.random au rendu, qui ferait diverger serveur et navigateur).
const PARTICLES = [
  { left: "6%", size: 5, dur: 14, delay: 0, color: "bg-leaf-300/70" },
  { left: "14%", size: 3, dur: 11, delay: 3, color: "bg-mist-50/60" },
  { left: "22%", size: 6, dur: 17, delay: 7, color: "bg-azure-300/60" },
  { left: "31%", size: 4, dur: 12, delay: 1.5, color: "bg-leaf-400/70" },
  { left: "40%", size: 3, dur: 15, delay: 9, color: "bg-[#e8c84a]/70" },
  { left: "48%", size: 5, dur: 13, delay: 4, color: "bg-mist-50/50" },
  { left: "57%", size: 4, dur: 18, delay: 11, color: "bg-leaf-300/60" },
  { left: "66%", size: 6, dur: 12, delay: 2, color: "bg-azure-300/70" },
  { left: "74%", size: 3, dur: 16, delay: 6, color: "bg-[#e8c84a]/60" },
  { left: "82%", size: 5, dur: 14, delay: 10, color: "bg-leaf-400/60" },
  { left: "90%", size: 4, dur: 11, delay: 5, color: "bg-mist-50/60" },
  { left: "95%", size: 3, dur: 19, delay: 8, color: "bg-leaf-300/70" },
];

function Particles() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {PARTICLES.map((p, i) => (
        <span
          key={i}
          className={`teaser-rise ${p.color}`}
          style={{ left: p.left, width: p.size, height: p.size, animationDuration: `${p.dur}s`, animationDelay: `${p.delay}s` }}
        />
      ))}
    </div>
  );
}

function Aurora() {
  return (
    <>
      <div aria-hidden className="teaser-aurora pointer-events-none absolute -left-24 top-0 h-[28rem] w-[28rem] rounded-full bg-leaf-500/25 blur-3xl" />
      <div aria-hidden className="teaser-aurora pointer-events-none absolute -right-24 bottom-0 h-[26rem] w-[26rem] rounded-full bg-azure-500/25 blur-3xl [animation-delay:-8s]" />
      <div aria-hidden className="teaser-aurora pointer-events-none absolute left-1/3 top-1/2 h-72 w-72 rounded-full bg-[#e8c84a]/10 blur-3xl [animation-delay:-4s]" />
    </>
  );
}

// Illustration centrale : anneaux qui pulsent, deux orbites, un « 5 » qui se
// dessine puis se remplit, le papillon de la marque qui flotte au-dessus, et
// deux brins de feuillage qui ondulent. Tout en SVG : net à toute taille.
function TeaserArt({ className = "" }: { className?: string }) {
  const rings = [95, 140, 185, 230, 275];
  return (
    <div className={`relative aspect-square w-full ${className}`}>
      <svg viewBox="0 0 600 600" className="absolute inset-0 h-full w-full" role="img" aria-label="Un grand 5 lumineux entouré d'anneaux : la 5ème édition du CIGIBM se prépare">
        <defs>
          <radialGradient id="tz-core" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#4ab051" stopOpacity="0.55" />
            <stop offset="0.55" stopColor="#245627" stopOpacity="0.22" />
            <stop offset="1" stopColor="#0e2118" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="tz-ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#93d297" />
            <stop offset="0.5" stopColor="#87b7de" />
            <stop offset="1" stopColor="#e8c84a" />
          </linearGradient>
          <linearGradient id="tz-five" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.55" stopColor="#c5ddc7" />
            <stop offset="1" stopColor="#68c06e" />
          </linearGradient>
          <filter id="tz-blur" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="14" />
          </filter>
        </defs>

        <circle cx="300" cy="300" r="250" fill="url(#tz-core)" className="teaser-glow" />

        {rings.map((r, i) => (
          <circle
            key={r}
            cx="300"
            cy="300"
            r={r}
            fill="none"
            stroke="url(#tz-ring)"
            strokeWidth={i === 0 ? 2 : 1.2}
            className="teaser-ring"
            style={{ animationDelay: `${i * 1.05}s` } as CSSProperties}
          />
        ))}

        <g className="teaser-orbit" opacity="0.9">
          <circle cx="300" cy="25" r="6" fill="#e8c84a" />
          <circle cx="300" cy="25" r="14" fill="#e8c84a" opacity="0.18" />
          <circle cx="575" cy="300" r="4" fill="#93d297" />
          <circle cx="105" cy="495" r="5" fill="#87b7de" />
        </g>
        <g className="teaser-orbit-rev" opacity="0.85">
          <circle cx="300" cy="115" r="4.5" fill="#ffffff" />
          <circle cx="300" cy="115" r="11" fill="#ffffff" opacity="0.14" />
          <circle cx="485" cy="300" r="5" fill="#68c06e" />
          <circle cx="200" cy="470" r="3.5" fill="#e8c84a" />
        </g>

        <g className="teaser-sway" style={{ transformOrigin: "120px 520px" }} opacity="0.7">
          <path d="M120 520 C 112 450, 128 390, 96 330" fill="none" stroke="#68c06e" strokeWidth="2.2" strokeLinecap="round" />
          {[
            "M112 468 C 84 460, 70 440, 72 420 C 98 424, 112 444, 112 468Z",
            "M118 430 C 146 424, 160 404, 158 384 C 132 388, 118 408, 118 430Z",
            "M106 392 C 80 384, 66 366, 68 346 C 94 350, 106 370, 106 392Z",
            "M104 356 C 128 348, 138 330, 134 312 C 112 318, 102 336, 104 356Z",
          ].map((d, i) => (
            <path key={i} d={d} fill="#4ab051" fillOpacity="0.55" />
          ))}
        </g>
        <g className="teaser-sway" style={{ transformOrigin: "480px 530px", animationDelay: "-2.5s" }} opacity="0.7">
          <path d="M480 530 C 490 460, 470 400, 506 338" fill="none" stroke="#87b7de" strokeWidth="2.2" strokeLinecap="round" />
          {[
            "M488 476 C 516 468, 530 448, 528 428 C 502 432, 488 452, 488 476Z",
            "M482 440 C 454 432, 440 412, 442 392 C 468 396, 482 416, 482 440Z",
            "M494 402 C 520 394, 534 376, 532 356 C 506 360, 494 380, 494 402Z",
          ].map((d, i) => (
            <path key={i} d={d} fill="#3684c4" fillOpacity="0.5" />
          ))}
        </g>

        <text
          x="300"
          y="408"
          textAnchor="middle"
          fontSize="330"
          fontWeight="700"
          fill="#68c06e"
          opacity="0.35"
          filter="url(#tz-blur)"
          style={{ fontFamily: "var(--font-display-serif), Georgia, serif" }}
        >
          5
        </text>
        <text
          x="300"
          y="408"
          textAnchor="middle"
          fontSize="330"
          fontWeight="700"
          fill="url(#tz-five)"
          stroke="#ffffff"
          strokeWidth="2.2"
          className="teaser-five"
          style={{ fontFamily: "var(--font-display-serif), Georgia, serif" }}
        >
          5
        </text>
      </svg>

      <div className="teaser-float absolute left-1/2 top-[7%] w-[16%] -translate-x-1/2">
        <Image src="/images/logo-mark.png" alt="" width={120} height={120} className="h-auto w-full drop-shadow-[0_0_22px_rgba(147,210,151,0.7)]" />
      </div>
    </div>
  );
}

function BlinkingDots() {
  return (
    <span aria-hidden className="ml-2 inline-flex gap-1 align-middle">
      {[0, 0.25, 0.5].map((d) => (
        <span key={d} className="teaser-dot inline-block h-1.5 w-1.5 rounded-full bg-[#e8c84a]" style={{ animationDelay: `${d}s` }} />
      ))}
    </span>
  );
}

const ctaPrimary =
  "inline-flex min-h-14 items-center justify-center rounded-full bg-azure-500 px-8 text-base font-bold text-mist-50 shadow-xl shadow-azure-950/40 ring-1 ring-mist-50/15 transition-colors hover:bg-azure-400 active:bg-azure-600";

// Bouton réutilisable depuis une page serveur : ouvre le pop-up d'opt-in.
export function OptInButton({ children, className = ctaPrimary }: { children: React.ReactNode; className?: string }) {
  return (
    <button type="button" onClick={openOptIn} className={className}>
      {children}
    </button>
  );
}

// Grande scène : haut de la page CIGIBM et page de partage dédiée.
export function Cigibm5Hero({ fullScreen = false }: { fullScreen?: boolean }) {
  return (
    <section className={`relative isolate overflow-hidden bg-leaf-950 ${fullScreen ? "min-h-dvh" : ""}`}>
      <Aurora />
      <Particles />
      <div className={`relative mx-auto grid max-w-6xl items-center gap-10 px-6 lg:grid-cols-2 lg:gap-16 ${fullScreen ? "min-h-dvh py-10" : "py-20 sm:py-28"}`}>
        <div className="order-2 text-center lg:order-1 lg:text-left">
          <p className="teaser-up text-xs font-bold uppercase tracking-[0.35em] text-leaf-300" style={{ animationDelay: "0.2s" }}>
            Chut… ça se prépare
          </p>
          <h1 className="teaser-up mt-5 font-display text-5xl leading-[1.05] text-mist-50 sm:text-6xl" style={{ animationDelay: "0.5s" }}>
            CIGIBM
            <span className="teaser-shimmer-text mt-1 block">5ème édition</span>
          </h1>
          <p className="teaser-up mx-auto mt-6 max-w-md text-lg leading-relaxed text-mist-100/85 lg:mx-0" style={{ animationDelay: "1s" }}>
            Elle arrive. Et elle vaudra le détour.
          </p>
          <div className="teaser-up mx-auto mt-6 max-w-md rounded-2xl border border-mist-50/12 bg-mist-50/5 p-5 text-left backdrop-blur lg:mx-0" style={{ animationDelay: "1.5s" }}>
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                ["Date", "Très bientôt"],
                ["Lieu", "Très bientôt"],
                ["Thème", "Surprise"],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-leaf-300">{label}</p>
                  <p className="mt-1 text-sm font-semibold text-mist-50">{value}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 border-t border-mist-50/10 pt-4 text-sm text-mist-100/70">
              Dévoilement officiel ici même, sur cette page
              <BlinkingDots />
            </p>
          </div>
          <div className="teaser-up mt-8 flex flex-col items-center gap-3 sm:flex-row lg:items-start" style={{ animationDelay: "2s" }}>
            <button type="button" onClick={openOptIn} className={ctaPrimary}>
              Être prévenu(e) en premier
            </button>
            {!fullScreen && (
              <a href="#retour-4e-edition" className="inline-flex min-h-14 items-center px-4 text-base font-semibold text-mist-100/80 underline decoration-mist-50/30 underline-offset-4 hover:text-mist-50">
                Revivre la 4ème édition
              </a>
            )}
          </div>
        </div>
        <div className="order-1 mx-auto w-full max-w-[480px] lg:order-2 lg:max-w-none">
          <TeaserArt />
        </div>
      </div>
    </section>
  );
}

// Bandeau compact pour l'accueil.
export function Cigibm5Strip() {
  return (
    <div className="relative isolate overflow-hidden border-b border-mist-50/10 bg-leaf-950">
      <div aria-hidden className="teaser-aurora pointer-events-none absolute -left-10 -top-16 h-52 w-52 rounded-full bg-leaf-500/25 blur-3xl" />
      <div aria-hidden className="teaser-aurora pointer-events-none absolute -bottom-20 right-10 h-52 w-52 rounded-full bg-azure-500/25 blur-3xl [animation-delay:-6s]" />
      <Particles />
      <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-5 px-6 py-6 sm:flex-row sm:justify-between">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div aria-hidden className="relative hidden h-16 w-16 shrink-0 sm:block">
            <svg viewBox="0 0 64 64" className="h-full w-full">
              <circle cx="32" cy="32" r="29" fill="none" stroke="#93d297" strokeWidth="1.5" className="teaser-ring" />
              <circle cx="32" cy="32" r="22" fill="none" stroke="#87b7de" strokeWidth="1.2" className="teaser-ring" style={{ animationDelay: "1.4s" }} />
              <text x="32" y="43" textAnchor="middle" fontSize="32" fontWeight="700" fill="#ffffff" style={{ fontFamily: "var(--font-display-serif), Georgia, serif" }}>5</text>
            </svg>
          </div>
          <p className="text-sm leading-relaxed text-mist-100/90 sm:text-base">
            <span className="teaser-shimmer-text font-display text-lg font-semibold">CIGIBM · 5ème édition</span>
            <span className="block sm:inline"> : date et lieu dévoilés très bientôt, sur la page du congrès.</span>
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-center gap-2 sm:flex-row">
          <button type="button" onClick={openOptIn} className={`${ctaPrimary} !min-h-12 !px-6 !text-sm`}>
            Être prévenu(e) en premier
          </button>
          <a href="/cigibm" className="px-3 text-sm font-semibold text-mist-100/80 underline decoration-mist-50/30 underline-offset-4 hover:text-mist-50">
            Voir le teaser
          </a>
        </div>
      </div>
    </div>
  );
}
