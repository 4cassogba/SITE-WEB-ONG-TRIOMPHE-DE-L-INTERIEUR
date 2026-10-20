import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Rendu Markdown des notes (titres, listes, tableaux, citations). Pas de HTML
// brut : react-markdown l'ignore par défaut, un texte collé ne peut rien injecter.
export default function MarkdownView({ source }: { source: string }) {
  return (
    <div className="space-y-3 text-[15px] leading-relaxed text-ink/85">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: (p) => <h2 className="mt-8 border-b border-leaf-200 pb-1.5 font-display text-2xl text-leaf-900" {...p} />,
          h2: (p) => <h3 className="mt-6 font-display text-xl text-leaf-900" {...p} />,
          h3: (p) => <h4 className="mt-4 font-semibold text-leaf-900" {...p} />,
          p: (p) => <p {...p} />,
          ul: (p) => <ul className="list-disc space-y-1 pl-6" {...p} />,
          ol: (p) => <ol className="list-decimal space-y-1 pl-6" {...p} />,
          blockquote: (p) => <blockquote className="border-l-4 border-leaf-500 bg-leaf-50 px-4 py-2 italic text-ink/80" {...p} />,
          a: (p) => <a className="text-leaf-700 underline underline-offset-2" target="_blank" rel="noopener noreferrer" {...p} />,
          hr: () => <hr className="my-6 border-ink/10" />,
          table: (p) => (
            <div className="-mx-1 overflow-x-auto px-1">
              <table className="w-full min-w-[32rem] border-collapse text-sm" {...p} />
            </div>
          ),
          th: (p) => <th className="border border-ink/12 bg-leaf-800 px-3 py-2 text-left font-semibold text-mist-50" {...p} />,
          td: (p) => <td className="border border-ink/12 px-3 py-2 align-top" {...p} />,
          code: (p) => <code className="rounded bg-ink/6 px-1 py-0.5 text-[13px]" {...p} />,
        }}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}
