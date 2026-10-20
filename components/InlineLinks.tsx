import type { ReactNode } from "react";
import Link from "next/link";

const INLINE_LINK = /\[([^\]]+)\]\(([^)\s]+)\)/g;

export const inlineLinkClass =
  "font-medium text-leaf-700 underline decoration-leaf-300 underline-offset-4 transition-colors hover:text-leaf-900 hover:decoration-leaf-600";

// `[libellé](href)` -> lien : interne (next/link) si le chemin commence par « / »,
// externe (nouvel onglet, sans nofollow : on veut transmettre l'autorité) sinon.
// Les éléments React sont construits ici, aucun HTML brut n'est injecté.
export function renderInline(text: string): ReactNode {
  const parts: ReactNode[] = [];
  let last = 0;
  for (const match of text.matchAll(INLINE_LINK)) {
    const [whole, label, href] = match;
    const index = match.index ?? 0;
    if (index > last) parts.push(text.slice(last, index));
    parts.push(
      href.startsWith("/") ? (
        <Link key={index} href={href} className={inlineLinkClass}>
          {label}
        </Link>
      ) : (
        <a key={index} href={href} target="_blank" rel="noopener noreferrer" className={inlineLinkClass}>
          {label}
        </a>
      )
    );
    last = index + whole.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}
