"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type IconProps = { className?: string };

function HomeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M3 11.5 12 4l9 7.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.5 10v9a1 1 0 0 0 1 1H9.5a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PeopleIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 19.5c0-3 2.5-5 5.5-5s5.5 2 5.5 5" strokeLinecap="round" />
      <circle cx="17" cy="9" r="2.3" />
      <path d="M15.2 12.2c2.3.4 3.8 2 3.8 4.3" strokeLinecap="round" />
    </svg>
  );
}

function StarIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M12 3.5 14.4 9l6 .8-4.4 4.1 1.2 5.9L12 17l-5.2 2.8 1.2-5.9L3.6 9.8l6-.8Z" strokeLinejoin="round" />
    </svg>
  );
}

function MailIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <rect x="3" y="5.5" width="18" height="13" rx="2" />
      <path d="m4 7 8 6 8-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ScanIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="9" y="9" width="6" height="6" rx="1" />
    </svg>
  );
}

function PhoneIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M6.5 4h3l1.5 4-2 1.3a11 11 0 0 0 5.7 5.7l1.3-2 4 1.5v3a2 2 0 0 1-2 2A15 15 0 0 1 4.5 6a2 2 0 0 1 2-2Z" strokeLinejoin="round" />
    </svg>
  );
}

function ListIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M9 6h11M9 12h11M9 18h11" strokeLinecap="round" />
      <circle cx="4.5" cy="6" r="1.2" />
      <circle cx="4.5" cy="12" r="1.2" />
      <circle cx="4.5" cy="18" r="1.2" />
    </svg>
  );
}

function KeyIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <circle cx="8" cy="15" r="3.5" />
      <path d="m10.5 12.5 8-8M15.5 7.5l2 2M13 10l2 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FolderIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M3.5 7.5A1.5 1.5 0 0 1 5 6h4l2 2.5h8A1.5 1.5 0 0 1 20.5 10v8a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 18Z" strokeLinejoin="round" />
    </svg>
  );
}

function CongressIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M4 20V9l8-5 8 5v11" strokeLinejoin="round" />
      <path d="M9 20v-5h6v5M3 20h18" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MoreIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <circle cx="5.5" cy="12" r="1.7" />
      <circle cx="12" cy="12" r="1.7" />
      <circle cx="18.5" cy="12" r="1.7" />
    </svg>
  );
}

type NavItem = {
  href: string;
  label: string;
  shortLabel: string;
  Icon: (p: IconProps) => React.ReactElement;
  exact?: boolean;
  inBar?: boolean;
  description: string;
};
type NavGroup = { title: string; items: NavItem[] };

// Navigation regroupée par métier. inBar : présent dans la barre du bas mobile
// (4 accès directs + « Plus », qui ouvre le menu complet). Le Scanner y reste :
// c'est l'usage au téléphone, à une main, le jour du congrès.
const groups: NavGroup[] = [
  {
    title: "Pilotage",
    items: [{ href: "/admin", label: "Tableau de bord", shortLabel: "Accueil", Icon: HomeIcon, exact: true, inBar: true, description: "Les chiffres du jour et ce qui attend une action" }],
  },
  {
    title: "CIGIBM",
    items: [
      { href: "/admin/cigibm", label: "Hub CIGIBM", shortLabel: "CIGIBM", Icon: CongressIcon, inBar: true, description: "Tout sur une édition : préparation, public, communication, documents" },
      { href: "/admin/participants", label: "Participants", shortLabel: "Participants", Icon: PeopleIcon, inBar: true, description: "Inscrits, présence, ajout sur place" },
      { href: "/admin/ambassadors", label: "Ambassadeurs", shortLabel: "Ambassad.", Icon: StarIcon, description: "Les relais et leurs parrainages" },
      { href: "/admin/messages", label: "Messages", shortLabel: "Messages", Icon: MailIcon, description: "Emails, SMS et WhatsApp aux participants" },
      { href: "/admin/scan", label: "Scanner", shortLabel: "Scanner", Icon: ScanIcon, inBar: true, description: "Contrôle d'entrée par QR code" },
    ],
  },
  {
    title: "L'ONG",
    items: [
      { href: "/admin/activities", label: "Activités", shortLabel: "Activités", Icon: ListIcon, description: "Ce que l'ONG fait, par axe, publié sur le site" },
      { href: "/admin/leads", label: "Contacts à rappeler", shortLabel: "Contacts", Icon: PhoneIcon, description: "Personnes qui ont laissé leurs coordonnées" },
      { href: "/admin/resources", label: "Dossier ressources", shortLabel: "Ressources", Icon: FolderIcon, description: "Notes et documents internes" },
    ],
  },
  {
    title: "Administration",
    items: [{ href: "/admin/team", label: "Équipe", shortLabel: "Équipe", Icon: KeyIcon, description: "Comptes, rôles et accès" }],
  },
];

const allItems = groups.flatMap((g) => g.items);
const barItems = allItems.filter((i) => i.inBar);

function isActive(pathname: string, href: string, exact?: boolean) {
  return exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

// Barre latérale desktop : reste montée en permanence (lg: et plus).
export function AdminSidebarNav() {
  const pathname = usePathname();
  return (
    <nav className="mt-6 space-y-5">
      {groups.map((group) => (
        <div key={group.title}>
          <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink/40">{group.title}</p>
          <div className="mt-1.5 space-y-0.5">
            {group.items.map((item) => {
              const active = isActive(pathname, item.href, item.exact);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                    active ? "bg-leaf-50 font-medium text-leaf-900" : "text-ink/75 hover:bg-leaf-50 hover:text-leaf-900"
                  }`}
                >
                  <item.Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

// Barre du bas mobile : 4 accès directs + « Plus » (menu complet par métier).
export function AdminBottomNav() {
  const pathname = usePathname();
  const onMorePage = pathname === "/admin/plus";
  const inBar = barItems.some((i) => isActive(pathname, i.href, i.exact));
  const cell = (active: boolean) =>
    `flex min-w-0 flex-1 flex-col items-center gap-1 px-0.5 py-2.5 text-[10px] transition-colors active:bg-leaf-50 ${active ? "font-semibold text-leaf-700" : "text-ink/55"}`;
  return (
    <nav
      aria-label="Navigation principale"
      className="fixed inset-x-0 bottom-0 z-40 flex border-t border-ink/10 bg-mist-50/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
    >
      {barItems.map((item) => (
        <Link key={item.href} href={item.href} className={cell(!onMorePage && isActive(pathname, item.href, item.exact))}>
          <item.Icon className="h-5 w-5" />
          <span className="max-w-full truncate">{item.shortLabel}</span>
        </Link>
      ))}
      <Link href="/admin/plus" className={cell(onMorePage || !inBar)}>
        <MoreIcon className="h-5 w-5" />
        <span>Plus</span>
      </Link>
    </nav>
  );
}

// Page « Plus » (mobile) : tout l'admin, rangé par métier.
export function AdminMoreMenu() {
  return (
    <div className="space-y-7">
      {groups.map((group) => (
        <section key={group.title}>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-ink/55">{group.title}</h2>
          <ul className="mt-2 space-y-2">
            {group.items.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="flex items-center gap-4 rounded-2xl border border-ink/8 bg-mist-50 px-4 py-3.5 active:bg-leaf-50">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-leaf-100 text-leaf-800">
                    <item.Icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-leaf-900">{item.label}</span>
                    <span className="block text-xs text-ink/55">{item.description}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
