import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { getEditionHub, listEditions, pickDefaultEdition } from "@/lib/admin/cigibm";
import {
  COMMS_STEPS,
  TASK_CATEGORIES,
  TASK_CATEGORY_LABELS,
  addDays,
  daysUntil,
  phaseLabel,
  type Insight,
} from "@/lib/cigibm-hub";
import { NOTE_TEMPLATES } from "@/lib/note-templates";
import { fileKindLabel } from "@/lib/resources-meta";
import CopyButton from "./CopyButton";
import TaskForm from "./TaskForm";
import { GenerateChecklistButton, TaskStatusButton } from "./TaskControls";
import { createTaskAction } from "./actions";

const TZ = "Africa/Porto-Novo";
const TABS = [
  { key: "apercu", label: "Vue d'ensemble" },
  { key: "preparation", label: "Préparation" },
  { key: "public", label: "Public" },
  { key: "communication", label: "Communication" },
  { key: "documents", label: "Documents" },
] as const;
type TabKey = (typeof TABS)[number]["key"];

const fmt = (d: Date, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" }) => d.toLocaleDateString("fr-FR", { timeZone: TZ, ...opts });
const ordinal = (n: number) => (n === 1 ? "1ère" : `${n}ème`);
const card = "rounded-2xl border border-ink/8 bg-mist-50 p-4 sm:p-5";
const h2 = "text-xs font-semibold uppercase tracking-wide text-ink/55";

// Phrase commune du CIGIBM, issue de la note de repositionnement (à valider).
const PITCH = "Le CIGIBM est le rendez-vous annuel de la guérison intérieure et du bien-être mental, organisé par l'ONG Triomphe de l'Intérieur.";
const SIGNATURE = "Guérir de l'intérieur pour triompher à l'extérieur.";

function relativeDue(due: Date, now: Date, done: boolean) {
  const d = daysUntil(due, now);
  if (done) return { text: fmt(due), tone: "text-ink/45" };
  if (d < 0) return { text: `${fmt(due)} · en retard de ${-d} j`, tone: "font-semibold text-red-700" };
  if (d === 0) return { text: "Aujourd'hui", tone: "font-semibold text-amber-800" };
  if (d === 1) return { text: "Demain", tone: "font-semibold text-amber-800" };
  return { text: `${fmt(due)} · dans ${d} j`, tone: d <= 7 ? "text-amber-800" : "text-ink/55" };
}

function InsightCard({ insight }: { insight: Insight }) {
  const tone = {
    alert: "border-amber-400 bg-amber-50/70",
    info: "border-ink/10 bg-mist-50",
    good: "border-leaf-300 bg-leaf-50",
  }[insight.level];
  const dot = { alert: "bg-amber-500", info: "bg-ink/30", good: "bg-leaf-500" }[insight.level];
  return (
    <li className={`flex items-start gap-3 rounded-2xl border p-4 ${tone}`}>
      <span aria-hidden className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${dot}`} />
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-leaf-900">{insight.title}</p>
        <p className="mt-0.5 text-sm text-ink/65">{insight.detail}</p>
        {insight.href && (
          <Link href={insight.href} className="mt-2 inline-flex min-h-9 items-center text-sm font-semibold text-leaf-700 underline underline-offset-4">
            {insight.cta ?? "Ouvrir"} →
          </Link>
        )}
      </div>
    </li>
  );
}

function Bar({ value, max, label, sub }: { value: number; max: number; label: string; sub?: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="min-w-0 truncate text-ink/80">{label}</span>
        <span className="shrink-0 font-semibold text-leaf-900">{value}{sub ? <span className="font-normal text-ink/45"> {sub}</span> : null}</span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-ink/8">
        <div className="h-full rounded-full bg-leaf-600" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default async function CigibmHubPage({ searchParams }: { searchParams: Promise<{ edition?: string; tab?: string }> }) {
  await requireAdmin();
  const { edition, tab } = await searchParams;
  const now = new Date();
  const editions = await listEditions();
  const requested = Number(edition);
  const current = editions.some((e) => e.number === requested) ? requested : pickDefaultEdition(editions, now);
  const activeTab: TabKey = TABS.some((t) => t.key === tab) ? (tab as TabKey) : "apercu";

  if (current === null) {
    return (
      <div className="mx-auto max-w-3xl">
        <h1 className="font-display text-2xl text-leaf-900 sm:text-3xl">Hub CIGIBM</h1>
        <p className="mt-4 text-sm text-ink/60">Aucune édition pour l&apos;instant.</p>
        <Link href="/admin/cigibm/editions/new" className="mt-4 inline-flex min-h-12 items-center rounded-full bg-leaf-600 px-5 text-sm font-bold text-mist-50">Créer une édition</Link>
      </div>
    );
  }

  const hub = (await getEditionHub(current, now))!;
  const { edition: ed, stats, phase } = hub;
  const href = (t: TabKey) => `/admin/cigibm?edition=${current}&tab=${t}`;
  const prepPct = hub.tasks.length ? Math.round((hub.tasksDone / hub.tasks.length) * 100) : 0;
  const alerts = hub.insights.filter((i) => i.level === "alert").length;

  return (
    <div className="mx-auto max-w-5xl">
      {/* ---------- Sélecteur d'édition ---------- */}
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-display text-2xl text-leaf-900 sm:text-3xl">Hub CIGIBM</h1>
        <Link href="/admin/cigibm/editions/new" className="inline-flex min-h-10 shrink-0 items-center rounded-full border border-leaf-600 px-4 text-sm font-bold text-leaf-700">+ Édition</Link>
      </div>
      <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        {editions.map((e) => (
          <Link
            key={e.number}
            href={`/admin/cigibm?edition=${e.number}${activeTab !== "apercu" ? `&tab=${activeTab}` : ""}`}
            className={`inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-full border px-4 text-sm ${e.number === current ? "border-leaf-700 bg-leaf-700 font-semibold text-mist-50" : "border-ink/12 bg-mist-50 text-ink/70"}`}
          >
            Éd. {e.number}
            {e._count.participants > 0 && <span className={e.number === current ? "text-mist-50/70" : "text-ink/40"}>· {e._count.participants}</span>}
          </Link>
        ))}
      </div>

      {/* ---------- Carte d'identité de l'édition ---------- */}
      <section className="mt-4 overflow-hidden rounded-3xl bg-leaf-900 p-5 text-mist-50 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-leaf-300">{ordinal(ed.number)} édition</p>
            <p className="mt-1.5 font-display text-2xl leading-tight sm:text-3xl">{ed.theme}</p>
            <p className="mt-2 text-sm text-mist-50/75">{ed.dates} · {ed.venue}</p>
          </div>
          <div className="shrink-0 rounded-2xl bg-mist-50/10 px-4 py-3 text-center">
            <p className="font-display text-2xl leading-none">{phaseLabel(phase)}</p>
            {ed.eventDate && <p className="mt-1 text-xs text-mist-50/60">{fmt(ed.eventDate, { day: "numeric", month: "long", year: "numeric" })}</p>}
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link href={`/admin/cigibm/editions/${ed.number}/edit`} className="inline-flex min-h-10 items-center rounded-full bg-mist-50 px-4 text-sm font-bold text-leaf-900">Modifier l&apos;édition</Link>
          <a href="/cigibm" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center rounded-full border border-mist-50/30 px-4 text-sm font-semibold text-mist-50">Page publique ↗</a>
        </div>
      </section>

      {/* ---------- Indicateurs ---------- */}
      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Link href={href("public")} className={card}>
          <p className="text-[11px] uppercase tracking-wide text-ink/50">Inscrits</p>
          <p className="mt-1 font-display text-3xl text-leaf-900">{stats.participants}</p>
          <p className="text-xs text-ink/50">{stats.withEmail} avec email</p>
        </Link>
        <Link href={href("public")} className={card}>
          <p className="text-[11px] uppercase tracking-wide text-ink/50">Présents</p>
          <p className="mt-1 font-display text-3xl text-leaf-900">{stats.attended}</p>
          <p className="text-xs text-ink/50">{stats.participants ? `${stats.attendanceRate} % des inscrits` : "—"}</p>
        </Link>
        <Link href={href("public")} className={card}>
          <p className="text-[11px] uppercase tracking-wide text-ink/50">Via ambassadeurs</p>
          <p className="mt-1 font-display text-3xl text-leaf-900">{stats.viaAmbassadors}</p>
          <p className="text-xs text-ink/50">{stats.participants ? `${Math.round((stats.viaAmbassadors / stats.participants) * 100)} % des inscrits` : "—"}</p>
        </Link>
        <Link href={href("preparation")} className={card}>
          <p className="text-[11px] uppercase tracking-wide text-ink/50">Préparation</p>
          <p className="mt-1 font-display text-3xl text-leaf-900">{hub.tasks.length ? `${prepPct} %` : "—"}</p>
          <p className="text-xs text-ink/50">{hub.tasks.length ? `${hub.tasksDone}/${hub.tasks.length} étapes${hub.overdueIds.size ? ` · ${hub.overdueIds.size} en retard` : ""}` : "Pas de checklist"}</p>
        </Link>
      </div>

      {/* ---------- Onglets ---------- */}
      <nav aria-label="Rubriques du hub" className="sticky top-[calc(env(safe-area-inset-top)+3.4rem)] z-20 -mx-4 mt-6 flex gap-1 overflow-x-auto border-b border-ink/10 bg-mist-100/95 px-4 backdrop-blur sm:mx-0 sm:px-0 lg:top-0">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={href(t.key)}
            scroll={false}
            className={`relative inline-flex min-h-12 shrink-0 items-center px-3 text-sm ${activeTab === t.key ? "font-semibold text-leaf-900 after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:rounded-full after:bg-leaf-600" : "text-ink/55"}`}
          >
            {t.label}
            {t.key === "apercu" && alerts > 0 && <span className="ml-1.5 rounded-full bg-amber-500 px-1.5 text-[10px] font-bold text-mist-50">{alerts}</span>}
          </Link>
        ))}
      </nav>

      <div className="mt-6">
        {/* ===== Vue d'ensemble ===== */}
        {activeTab === "apercu" && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
            <section>
              <h2 className={h2}>À traiter</h2>
              <ul className="mt-3 space-y-3">{hub.insights.map((i) => <InsightCard key={i.title} insight={i} />)}</ul>
            </section>
            <div className="space-y-6">
              <section>
                <h2 className={h2}>Actions rapides</h2>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {[
                    { label: "Scanner l'entrée", href: "/admin/scan" },
                    { label: "Participants", href: "/admin/participants" },
                    { label: "Écrire aux inscrits", href: "/admin/messages/new" },
                    { label: "Ambassadeurs", href: "/admin/ambassadors" },
                    { label: "Nouvelle note", href: `/admin/resources/new?edition=${current}` },
                    { label: "Ajouter un document", href: `/admin/resources/upload?edition=${current}` },
                  ].map((a) => (
                    <Link key={a.label} href={a.href} className="flex min-h-14 items-center rounded-2xl border border-ink/8 bg-mist-50 px-4 text-sm font-semibold text-leaf-900 active:bg-leaf-50 sm:hover:border-leaf-300">
                      {a.label}
                    </Link>
                  ))}
                </div>
              </section>
              {hub.tasks.length > 0 && (
                <section className={card}>
                  <h2 className={h2}>Préparation par domaine</h2>
                  <div className="mt-4 space-y-3.5">
                    {TASK_CATEGORIES.map((c) => {
                      const list = hub.tasks.filter((t) => t.category === c);
                      if (!list.length) return null;
                      return <Bar key={c} label={TASK_CATEGORY_LABELS[c]} value={list.filter((t) => t.status === "done").length} max={list.length} sub={`/ ${list.length}`} />;
                    })}
                  </div>
                </section>
              )}
            </div>
          </div>
        )}

        {/* ===== Préparation ===== */}
        {activeTab === "preparation" && (
          <div className="space-y-6">
            {hub.tasks.length === 0 ? (
              <section className={`${card} text-center`}>
                <p className="font-display text-xl text-leaf-900">Pas encore de checklist pour cette édition</p>
                <p className="mx-auto mt-2 max-w-lg text-sm text-ink/65">
                  La checklist type compte une trentaine d&apos;étapes réparties en six domaines (programme, logistique, communication, partenaires, finances, bilan), avec des échéances calculées à partir du jour principal. Tout est modifiable ensuite.
                </p>
                <div className="mt-5"><GenerateChecklistButton editionNumber={current} hasDate={Boolean(ed.eventDate)} /></div>
              </section>
            ) : (
              <>
                <div className={card}>
                  <div className="flex items-baseline justify-between">
                    <p className="font-semibold text-leaf-900">{hub.tasksDone} étapes faites sur {hub.tasks.length}</p>
                    <p className="font-display text-2xl text-leaf-900">{prepPct} %</p>
                  </div>
                  <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-ink/8"><div className="h-full rounded-full bg-leaf-600" style={{ width: `${prepPct}%` }} /></div>
                  <p className="mt-2 text-xs text-ink/50">Appuyez sur le statut d&apos;une tâche pour la faire avancer : À faire, En cours, Fait.</p>
                </div>
                {TASK_CATEGORIES.map((c) => {
                  const list = hub.tasks.filter((t) => t.category === c);
                  if (!list.length) return null;
                  return (
                    <section key={c}>
                      <div className="flex items-baseline justify-between">
                        <h2 className="font-display text-lg text-leaf-900">{TASK_CATEGORY_LABELS[c]}</h2>
                        <span className="text-xs text-ink/50">{list.filter((t) => t.status === "done").length}/{list.length}</span>
                      </div>
                      <ul className="mt-2 divide-y divide-ink/6 overflow-hidden rounded-2xl border border-ink/8 bg-mist-50">
                        {list.map((t) => {
                          const due = t.dueDate ? relativeDue(t.dueDate, now, t.status === "done") : null;
                          return (
                            <li key={t.id} className={`flex items-center gap-3 px-3 py-3 sm:px-4 ${hub.overdueIds.has(t.id) ? "bg-red-50/60" : ""}`}>
                              <TaskStatusButton id={t.id} status={t.status} />
                              <Link href={`/admin/cigibm/tasks/${t.id}/edit`} className="flex min-w-0 flex-1 items-center justify-between gap-2">
                                <span className="min-w-0">
                                  <span className={`block text-sm ${t.status === "done" ? "text-ink/45 line-through" : "text-ink"}`}>{t.title}</span>
                                  <span className="mt-0.5 block text-xs">
                                    {due && <span className={due.tone}>{due.text}</span>}
                                    {t.owner && <span className="text-ink/50">{due ? " · " : ""}{t.owner}</span>}
                                    {t.notes && <span className="text-ink/40"> · note</span>}
                                  </span>
                                </span>
                                <span aria-hidden className="shrink-0 text-lg text-ink/30">›</span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </section>
                  );
                })}
              </>
            )}
            <details className={card}>
              <summary className="cursor-pointer list-none font-semibold text-leaf-800">+ Ajouter une tâche</summary>
              <div className="mt-4"><TaskForm action={createTaskAction.bind(null, current)} submitLabel="Ajouter" compact /></div>
            </details>
          </div>
        )}

        {/* ===== Public ===== */}
        {activeTab === "public" && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <section className={card}>
              <h2 className={h2}>Inscrits et présence</h2>
              <div className="mt-4 space-y-3.5">
                <Bar label="Présents" value={stats.attended} max={stats.participants} sub={`/ ${stats.participants}`} />
                <Bar label="Non présents" value={stats.noShows} max={stats.participants} sub={`dont ${stats.noShowsWithEmail} avec email`} />
                <Bar label="Venus par un ambassadeur" value={stats.viaAmbassadors} max={stats.participants} />
              </div>
              <h3 className="mt-6 text-xs font-semibold uppercase tracking-wide text-ink/45">Origine des inscriptions</h3>
              <div className="mt-3 space-y-3.5">
                <Bar label="Formulaire en ligne" value={stats.bySource.form} max={stats.participants} />
                <Bar label="Inscription sur place (QR)" value={stats.bySource.qr_walkin} max={stats.participants} />
                <Bar label="Ajout par l'équipe" value={stats.bySource.admin_manual} max={stats.participants} />
              </div>
              {hub.attendanceByDay.some((d) => d.count > 0) && (
                <>
                  <h3 className="mt-6 text-xs font-semibold uppercase tracking-wide text-ink/45">Entrées scannées par jour</h3>
                  <ul className="mt-2 space-y-1.5 text-sm">
                    {hub.attendanceByDay.filter((d) => d.count > 0).map((d) => (
                      <li key={d.day} className="flex justify-between"><span className="text-ink/70">{d.label}</span><span className="font-semibold text-leaf-900">{d.count}</span></li>
                    ))}
                  </ul>
                </>
              )}
              <div className="mt-6 flex flex-wrap gap-2">
                <Link href={`/admin/participants?edition=${current}`} className="inline-flex min-h-11 items-center rounded-full bg-leaf-600 px-5 text-sm font-bold text-mist-50">Liste des participants</Link>
                <Link href="/admin/messages/new" className="inline-flex min-h-11 items-center rounded-full border border-leaf-600 px-5 text-sm font-bold text-leaf-700">Écrire aux inscrits</Link>
              </div>
            </section>

            <div className="space-y-6">
              {hub.registrationsByDay.length > 0 && (() => {
                const days = hub.registrationsByDay.slice(-60);
                const max = Math.max(...days.map((d) => d.count));
                const peak = days.find((d) => d.count === max)!;
                return (
                  <section className={card}>
                    <h2 className={h2}>Inscriptions par jour</h2>
                    <p className="mt-1 text-xs text-ink/50">{hub.registrationsByDay.length > 60 ? "60 derniers jours · " : ""}pic le {peak.label} ({max})</p>
                    <div className="mt-4 flex h-28 items-end gap-[2px]" role="img" aria-label="Courbe des inscriptions par jour">
                      {days.map((d) => (
                        <div key={d.day} title={`${d.label} : ${d.count}`} className="flex-1 rounded-t bg-leaf-500" style={{ height: `${Math.max(d.count ? 4 : 1, (d.count / max) * 100)}%`, opacity: d.count ? 1 : 0.25 }} />
                      ))}
                    </div>
                    <div className="mt-1 flex justify-between text-[10px] text-ink/40"><span>{days[0].label}</span><span>{days[days.length - 1].label}</span></div>
                  </section>
                );
              })()}

              <section className={card}>
                <div className="flex items-baseline justify-between">
                  <h2 className={h2}>Ambassadeurs</h2>
                  <Link href="/admin/ambassadors" className="text-xs font-semibold text-leaf-700 underline underline-offset-4">Tous</Link>
                </div>
                {hub.ambassadorRanking.filter((a) => a.referred > 0).length === 0 ? (
                  <p className="mt-3 text-sm text-ink/55">Aucun inscrit venu par un ambassadeur pour cette édition.</p>
                ) : (
                  <ol className="mt-3 space-y-2">
                    {hub.ambassadorRanking.filter((a) => a.referred > 0).slice(0, 10).map((a, i) => (
                      <li key={a.id} className="flex items-center gap-3 text-sm">
                        <span className="w-5 shrink-0 text-right font-semibold text-ink/40">{i + 1}</span>
                        <span className="min-w-0 flex-1 truncate text-ink">{a.fullName}</span>
                        <span className="shrink-0 text-ink/60"><strong className="text-leaf-900">{a.referred}</strong> inscrits · {a.attended} présents</span>
                      </li>
                    ))}
                  </ol>
                )}
                {hub.ambassadorRanking.some((a) => a.referred === 0) && (
                  <p className="mt-3 text-xs text-ink/50">{hub.ambassadorRanking.filter((a) => a.referred === 0).length} ambassadeurs actifs sans inscrit pour cette édition.</p>
                )}
              </section>
            </div>
          </div>
        )}

        {/* ===== Communication ===== */}
        {activeTab === "communication" && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
            <section className={card}>
              <h2 className={h2}>Calendrier de communication recommandé</h2>
              {!ed.eventDate && <p className="mt-2 text-xs text-amber-800">Définissez le jour principal de l&apos;édition pour dater ces étapes.</p>}
              <ol className="mt-4 space-y-0">
                {COMMS_STEPS.map((s, i) => {
                  const date = ed.eventDate ? addDays(ed.eventDate, s.offsetDays) : null;
                  const d = date ? daysUntil(date, now) : null;
                  const state = d === null ? "neutral" : d < 0 ? "past" : d <= 7 ? "soon" : "later";
                  const dot = { past: "bg-ink/25", soon: "bg-amber-500", later: "bg-leaf-500", neutral: "bg-leaf-500" }[state];
                  return (
                    <li key={s.label} className="relative flex gap-3 pb-5 last:pb-0">
                      {i < COMMS_STEPS.length - 1 && <span aria-hidden className="absolute left-[5px] top-4 h-full w-px bg-ink/12" />}
                      <span aria-hidden className={`relative mt-1.5 h-[11px] w-[11px] shrink-0 rounded-full ${dot}`} />
                      <div className={`min-w-0 ${state === "past" ? "opacity-55" : ""}`}>
                        <p className="text-sm font-semibold text-leaf-900">
                          {s.offsetDays === 0 ? "Jour J" : s.offsetDays < 0 ? `J${s.offsetDays}` : `J+${s.offsetDays}`} · {s.label}
                        </p>
                        <p className="text-xs text-ink/60">{s.detail}</p>
                        {date && <p className="mt-0.5 text-xs text-ink/45">{fmt(date, { weekday: "short", day: "numeric", month: "short" })}{d !== null && d >= 0 ? (d === 0 ? " · aujourd'hui" : ` · dans ${d} j`) : ""}</p>}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>

            <div className="space-y-6">
              <section className={card}>
                <h2 className={h2}>Le discours de l&apos;édition</h2>
                <p className="mt-1 text-xs text-ink/50">Proposition de la note de repositionnement, à valider avant usage public.</p>
                {[PITCH, SIGNATURE, `${ordinal(ed.number)} édition du CIGIBM · ${ed.theme} · ${ed.dates} · ${ed.venue}`].map((t) => (
                  <div key={t} className="mt-3 flex items-start justify-between gap-3 rounded-xl bg-leaf-50 px-3 py-2.5">
                    <p className="text-sm text-ink/85">{t}</p>
                    <CopyButton text={t} />
                  </div>
                ))}
                <Link href="/admin/resources?cat=ong" className="mt-3 inline-flex min-h-9 items-center text-xs font-semibold text-leaf-700 underline underline-offset-4">Voir la note de repositionnement →</Link>
              </section>

              <section className={card}>
                <div className="flex items-baseline justify-between">
                  <h2 className={h2}>Envois de l&apos;édition</h2>
                  <Link href="/admin/messages/new" className="text-xs font-semibold text-leaf-700 underline underline-offset-4">Nouveau message</Link>
                </div>
                {hub.batches.length === 0 ? (
                  <p className="mt-3 text-sm text-ink/55">Aucun envoi groupé enregistré pour les inscrits de cette édition.</p>
                ) : (
                  <ul className="mt-3 space-y-2.5">
                    {hub.batches.map((b) => (
                      <li key={b.id} className="flex items-start justify-between gap-3 text-sm">
                        <span className="min-w-0">
                          <span className="block truncate text-ink">{b.label}</span>
                          <span className="text-xs text-ink/50">{b.channel === "email" ? "Email" : b.channel === "sms" ? "SMS" : "WhatsApp"} · {fmt(b.sentAt, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                        </span>
                        <span className="shrink-0 text-xs"><strong className="text-leaf-900">{b.sent}</strong> envoyés{b.failed ? <span className="text-red-700"> · {b.failed} échecs</span> : null}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
          </div>
        )}

        {/* ===== Documents ===== */}
        {activeTab === "documents" && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
            <section>
              <div className="flex flex-wrap gap-2">
                <Link href={`/admin/resources/new?edition=${current}`} className="inline-flex min-h-11 items-center rounded-full bg-leaf-600 px-5 text-sm font-bold text-mist-50">+ Note</Link>
                <Link href={`/admin/resources/upload?edition=${current}`} className="inline-flex min-h-11 items-center rounded-full border border-leaf-600 px-5 text-sm font-bold text-leaf-700">+ Fichier</Link>
              </div>
              <ul className="mt-4 space-y-2.5">
                {hub.resources.map((r) => (
                  <li key={r.id}>
                    <Link href={`/admin/resources/${r.id}`} className="flex items-center justify-between gap-3 rounded-2xl border border-ink/8 bg-mist-50 p-4 active:bg-leaf-50 sm:hover:border-leaf-300">
                      <span className="min-w-0">
                        <span className="block break-words font-medium text-ink">{r.title}</span>
                        <span className="text-xs text-ink/50">{r.kind === "note" ? "Note" : fileKindLabel(r.fileName ?? "")} · {fmt(r.updatedAt)}</span>
                      </span>
                      <span aria-hidden className="text-xl text-leaf-700">›</span>
                    </Link>
                  </li>
                ))}
                {hub.resources.length === 0 && (
                  <li className="rounded-2xl border border-dashed border-ink/15 p-6 text-center text-sm text-ink/55">
                    Aucun document rattaché à l&apos;édition {current}. Les documents créés ici sont rangés automatiquement dans le dossier ressources, catégorie CIGIBM.
                  </li>
                )}
              </ul>
            </section>
            <section className={card}>
              <h2 className={h2}>Démarrer à partir d&apos;un modèle</h2>
              <p className="mt-1 text-xs text-ink/50">Une structure prête à remplir, sans aucun chiffre pré-rempli.</p>
              <div className="mt-3 space-y-2">
                {NOTE_TEMPLATES.map((t) => (
                  <Link key={t.key} href={`/admin/resources/new?edition=${current}&template=${t.key}`} className="flex min-h-12 items-center justify-between rounded-xl border border-ink/8 bg-mist-100 px-4 text-sm font-semibold text-leaf-900 active:bg-leaf-50">
                    {t.label}
                    <span aria-hidden className="text-ink/30">+</span>
                  </Link>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
