import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Container from "@/components/Container";
import Reveal from "@/components/Reveal";
import { inlineLinkClass, renderInline } from "@/components/InlineLinks";
import Button from "@/components/Button";
import { getPostBySlug, getSortedPosts, type BlogBlock } from "@/lib/blog";
import { siteConfig } from "@/lib/content";
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

      {/* Hero */}
      <section className="relative overflow-hidden bg-leaf-950">
        <div className="relative aspect-[16/9] w-full sm:aspect-[21/9]">
          <Image
            src={post.featuredImage.src}
            alt={post.featuredImage.alt}
            fill
            priority
            quality={90}
            sizes="100vw"
            className={`object-cover ${post.featuredImage.position === "top" ? "object-top" : ""}`}
          />
          {/* Assombrit seulement la moitié basse, derrière le titre : la photo
              (visages compris) reste nette et lumineuse au-dessus. */}
          <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-leaf-950 via-leaf-950/60 to-transparent" />
        </div>
        <Container className="relative -mt-24 pb-12 sm:-mt-28">
          <div>
            <h1 className="font-display text-3xl leading-tight text-mist-50 sm:text-4xl md:text-5xl">
              {post.title}
            </h1>
            <div className="mt-6 flex items-center gap-3">
              <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full">
                <Image
                  src={post.authorAvatar}
                  alt={post.author}
                  fill
                  sizes="44px"
                  className="object-cover"
                />
              </div>
              <div>
                <p className="text-sm text-mist-50">
                  <span className="font-semibold">{post.author}</span>{" "}
                  <span className="text-mist-100/60">{post.authorRole}</span>
                </p>
                <p className="text-xs text-mist-100/50">
                  {post.date} · {post.readTime} de lecture
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Body */}
      <Container className="max-w-3xl py-16 sm:py-20">
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
