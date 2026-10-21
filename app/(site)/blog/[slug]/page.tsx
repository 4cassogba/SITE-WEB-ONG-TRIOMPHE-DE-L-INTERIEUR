import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Container from "@/components/Container";
import Reveal from "@/components/Reveal";
import { inlineLinkClass, renderInline } from "@/components/InlineLinks";
import Button from "@/components/Button";
import { getPostBySlug, getSortedPosts, type BlogBlock, type BlogPost } from "@/lib/blog";
import { siteConfig } from "@/lib/content";
import { frenchSpacing } from "@/lib/typography";
import { pageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return getSortedPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  return pageMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
    image: { url: post.featuredImage.src, alt: post.featuredImage.alt },
    article: { publishedTime: post.isoDate, author: post.author },
  });
}

function Block({ block }: { block: BlogBlock }) {
  switch (block.type) {
    case "heading":
      return (
        <Reveal>
          <h2 className="mt-10 font-display text-2xl leading-snug text-leaf-900 sm:text-3xl">
            {block.text}
          </h2>
        </Reveal>
      );
    case "paragraph":
      return (
        <Reveal>
          <p className="mt-5 text-base leading-relaxed text-ink/80 sm:text-lg">
            {renderInline(block.text)}
          </p>
        </Reveal>
      );
    case "references":
      return (
        <Reveal>
          <section className="mt-12 border-t border-ink/10 pt-6">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-ink/50">
              {block.heading ?? "Sources"}
            </h2>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-ink/70 marker:text-ink/40">
              {block.items.map((item) => (
                <li key={item.label}>
                  {item.href ? (
                    item.href.startsWith("/") ? (
                      <Link href={item.href} className={inlineLinkClass}>
                        {item.label}
                      </Link>
                    ) : (
                      <a href={item.href} target="_blank" rel="noopener noreferrer" className={inlineLinkClass}>
                        {item.label}
                      </a>
                    )
                  ) : (
                    renderInline(item.label)
                  )}
                </li>
              ))}
            </ol>
          </section>
        </Reveal>
      );
    case "list":
      return (
        <Reveal>
          <ul className="mt-5 space-y-3">
            {block.items.map((item) => (
              <li key={item} className="flex items-start gap-3 text-base leading-relaxed text-ink/80">
                <span aria-hidden className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-leaf-100 text-xs font-bold text-leaf-700">
                  ✓
                </span>
                <span>{renderInline(item)}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      );
    case "quote":
      return (
        <Reveal>
          <figure className="mt-8 border-l-2 border-leaf-400 py-2 pl-6">
            <blockquote className="font-display text-xl leading-snug text-leaf-900 sm:text-2xl">« {block.text} »</blockquote>
            {block.cite && <figcaption className="mt-3 text-sm text-ink/55">— {renderInline(block.cite)}</figcaption>}
          </figure>
        </Reveal>
      );
    case "imageText": {
      const portrait = block.imageAspect === "portrait";
      return (
        <Reveal>
          <div className="mt-10 grid items-center gap-8 sm:grid-cols-2">
            <figure className={block.imagePosition === "right" ? "sm:order-2" : "sm:order-1"}>
              <div
                className={`relative overflow-hidden ${
                  portrait
                    ? "mx-auto aspect-[5/7] max-w-sm rounded-xl shadow-xl shadow-ink/20 ring-1 ring-ink/10"
                    : "aspect-[4/3] rounded-[2rem]"
                }`}
              >
                <Image
                  src={block.image.src}
                  alt={block.image.alt}
                  fill
                  sizes="(min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
              {block.caption && (
                <figcaption className="mt-3 text-center text-xs leading-relaxed text-ink/55">{block.caption}</figcaption>
              )}
            </figure>
            <div className={block.imagePosition === "right" ? "sm:order-1" : "sm:order-2"}>
              {block.heading && (
                <h3 className="font-display text-xl leading-snug text-leaf-900 sm:text-2xl">
                  {block.heading}
                </h3>
              )}
              <div className="mt-3 space-y-4">
                {block.paragraphs.map((p) => (
                  <p key={p} className="text-base leading-relaxed text-ink/80">
                    {renderInline(p)}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      );
    }
    case "video":
      // youtube-nocookie : pas de cookie de suivi tant que le lecteur n'est
      // pas lancé. loading="lazy" : rien n'est chargé avant le défilement.
      return (
        <Reveal>
          <figure className="mt-10">
            <div className="relative aspect-video w-full overflow-hidden rounded-[2rem] bg-black">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${block.youtubeId}?rel=0`}
                title={block.title}
                loading="lazy"
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
              />
            </div>
            {block.caption && (
              <figcaption className="mt-3 text-center text-sm text-ink/55">{block.caption}</figcaption>
            )}
          </figure>
        </Reveal>
      );
    case "links":
      return (
        <Reveal>
          <div className="mt-8 rounded-2xl bg-leaf-50 p-6">
            {block.heading && (
              <p className="text-xs font-semibold uppercase tracking-wide text-leaf-700">
                {block.heading}
              </p>
            )}
            <ul className="mt-3 space-y-2">
              {block.items.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-leaf-800 underline decoration-leaf-400 underline-offset-4 hover:text-leaf-900"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      );
  }
}

// Encart « L'essentiel » : ce qu'un lecteur pressé doit retenir (l'événement, l'ONG,
// la personne qui le porte). Le seul moment animé de l'en-tête : les lignes
// apparaissent l'une après l'autre.
function Essentials({ essentials }: { essentials: NonNullable<BlogPost["essentials"]> }) {
  const { person } = essentials;
  return (
    <aside aria-labelledby="essentiel" className="overflow-hidden rounded-[1.75rem] bg-mist-50 shadow-xl shadow-leaf-950/10 ring-1 ring-leaf-200">
      <div className="grid sm:grid-cols-[15rem_1fr]">
        <div className="flex items-center gap-4 bg-leaf-900 p-5 text-mist-50 sm:flex-col sm:items-start sm:gap-5 sm:p-7">
          {person && (
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full ring-2 ring-leaf-300/60 sm:h-28 sm:w-28">
              <Image src={person.image} alt={person.name} fill sizes="112px" className="object-cover" style={{ objectPosition: person.imagePosition ?? "50% 25%" }} />
            </div>
          )}
          <div className="min-w-0">
            <h2 id="essentiel" className="font-display text-2xl leading-tight">L&apos;essentiel</h2>
            <p className="mt-1 text-sm leading-snug text-mist-100/70">{essentials.intro}</p>
            {person && (
              <p className="mt-4 hidden text-sm leading-snug sm:block">
                <span className="block font-semibold text-mist-50">{person.name}</span>
                <span className="text-leaf-200/80">{person.role}</span>
              </p>
            )}
          </div>
        </div>
        <dl className="divide-y divide-ink/8 px-5 py-2 sm:px-7 sm:py-3">
          {person && (
            <div className="py-3.5 sm:hidden">
              <dt className="text-sm font-semibold text-leaf-700">Promotrice</dt>
              <dd className="mt-0.5 text-[15px] leading-snug text-ink">{person.name}, {person.role.charAt(0).toLowerCase() + person.role.slice(1)}</dd>
            </div>
          )}
          {essentials.items.map((item, i) => (
            <Reveal key={item.label} delay={0.15 + i * 0.07} y={10}>
              <div className="grid gap-0.5 py-3.5 sm:grid-cols-[8.5rem_1fr] sm:gap-4">
                <dt className="text-sm font-semibold text-leaf-700">{item.label}</dt>
                <dd className="text-[15px] leading-snug text-ink">{renderInline(item.value)}</dd>
              </div>
            </Reveal>
          ))}
        </dl>
      </div>
    </aside>
  );
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: `https://ongtriomphedelinterieur.com${post.featuredImage.src}`,
    datePublished: post.isoDate,
    author: { "@type": "Organization", name: post.author },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      logo: {
        "@type": "ImageObject",
        url: "https://ongtriomphedelinterieur.com/images/logo-mark.png",
      },
    },
    mainEntityOfPage: `https://ongtriomphedelinterieur.com/blog/${post.slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* En-tête éditorial : le texte d'abord, sur fond vert profond ; la couverture
          vient ensuite, entière (une de journal, photo de groupe), à cheval sur le corps. */}
      <section className="relative overflow-hidden bg-leaf-950 text-mist-50">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_85%_0%,rgba(147,210,151,0.16),transparent_55%)]" />
        <Container className="relative max-w-5xl pb-36 pt-10 sm:pb-52 sm:pt-16">
          <nav aria-label="Fil d'Ariane" className="flex flex-wrap items-center gap-x-2 text-sm text-mist-100/60">
            <Link href="/blog" className="rounded underline-offset-4 hover:text-mist-50 hover:underline focus-visible:outline-2 focus-visible:outline-leaf-300">
              Blog
            </Link>
            <span aria-hidden>/</span>
            <span className="text-leaf-300">{post.kicker ?? (post.type === "activite" ? "Activité" : "Article")}</span>
          </nav>
          <h1 className="mt-5 max-w-4xl text-balance font-display text-[2.15rem] leading-[1.08] sm:text-5xl md:text-[3.6rem]">
            {frenchSpacing(post.title)}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-mist-100/75 sm:text-lg">{frenchSpacing(post.excerpt)}</p>
          <div className="mt-8 flex items-center gap-3 border-t border-mist-50/10 pt-6">
            <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-mist-50">
              <Image src={post.authorAvatar} alt="" fill sizes="44px" className="object-contain p-1" />
            </div>
            <div className="text-sm">
              <p>
                <span className="font-semibold">{post.author}</span>
                <span className="text-mist-100/60">, {post.authorRole.charAt(0).toLowerCase() + post.authorRole.slice(1)}</span>
              </p>
              <p className="mt-0.5 flex flex-wrap gap-x-4 text-xs text-mist-100/55">
                <time dateTime={post.isoDate}>{post.date}</time>
                <span>{post.readTime} de lecture</span>
              </p>
            </div>
          </div>
        </Container>
      </section>

      <Container className="relative max-w-5xl -mt-28 sm:-mt-44">
        <Reveal y={28}>
          <figure>
            <div className="relative aspect-[16/9] overflow-hidden rounded-[1.75rem] bg-leaf-900 shadow-2xl shadow-leaf-950/30 ring-1 ring-ink/10">
              <Image
                src={post.featuredImage.src}
                alt={post.featuredImage.alt}
                fill
                priority
                quality={90}
                sizes="(min-width: 1024px) 1024px, 100vw"
                className={`object-cover ${post.featuredImage.position === "top" ? "object-top" : ""}`}
              />
            </div>
            {post.featuredImage.credit && (
              <figcaption className="mt-2 text-right text-xs text-ink/50">{post.featuredImage.credit}</figcaption>
            )}
          </figure>
        </Reveal>
      </Container>

      {/* Body */}
      <Container className="max-w-3xl pb-16 pt-10 sm:pb-20 sm:pt-14">
        {post.essentials && <Essentials essentials={post.essentials} />}
        {post.body.map((block, i) => (
          <Block key={i} block={block} />
        ))}

        <Reveal delay={0.1}>
          <div className="mt-14 rounded-2xl bg-leaf-950 p-8 text-center sm:p-10">
            <h2 className="font-display text-2xl text-mist-50 sm:text-3xl">
              Envie d&apos;aller plus loin ?
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm text-mist-100/75 sm:text-base">
              Découvrez le CIGIBM et la Méthode R.A.C.I.N.E.S., ou écrivez-nous
              directement si vous préférez en parler.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-4">
              <Button href="/cigibm" variant="primary">
                Découvrir le CIGIBM
              </Button>
              <Button href="/contact" variant="ghost" className="!border-mist-50/30 !text-mist-50 hover:!bg-mist-50/10">
                Nous contacter
              </Button>
            </div>
          </div>
        </Reveal>
      </Container>
    </>
  );
}
