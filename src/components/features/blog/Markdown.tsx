import { Marked } from "marked";

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Raw HTML inside the markdown is shown as text (articles are written in the admin).
const markdown = new Marked({ gfm: true, renderer: { html: ({ text }) => escapeHtml(text) } });

export function Markdown({ source }: { source: string }) {
  return (
    <div
      className="prose-article"
      dangerouslySetInnerHTML={{ __html: markdown.parse(source, { async: false }) }}
    />
  );
}
