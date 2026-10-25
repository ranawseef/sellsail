// A small Markdown renderer for blog posts. It builds React elements (never
// raw HTML), so post text can't inject markup. Supports what the posts use:
// ## and ### headings (with ids for the table of contents), paragraphs, - and
// 1. lists, > callouts, | tables |, **bold**, *italic*, `code` and [links](/x).

import Link from "next/link";
import { Fragment } from "react";

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[*`[\]()]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/** The ## headings of a post, for its table of contents. */
export function headings(md: string): { id: string; text: string }[] {
  return md
    .split("\n")
    .filter((l) => l.startsWith("## "))
    .map((l) => {
      const text = l.slice(3).trim();
      return { id: slugify(text), text: text.replace(/\*\*/g, "") };
    });
}

/** Decides whether an internal link may be rendered (e.g. the target post is published). */
export type LinkCheck = (href: string) => boolean;
const allowAll: LinkCheck = () => true;

function inline(text: string, key = "i", canLink: LinkCheck = allowAll): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  const re = /(\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`|\[([^\]]+)\]\(([^)\s]+)\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let n = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const k = `${key}-${n++}`;
    if (m[2]) out.push(<strong key={k}>{inline(m[2], k, canLink)}</strong>);
    else if (m[3]) out.push(<em key={k}>{m[3]}</em>);
    else if (m[4]) out.push(<code key={k}>{m[4]}</code>);
    else if (m[5] && m[6]) {
      const href = m[6];
      if (href.startsWith("/") && !canLink(href)) {
        // Target not live yet: plain text now, a link once it is.
        out.push(<Fragment key={k}>{inline(m[5], k, canLink)}</Fragment>);
        last = m.index + m[0].length;
        continue;
      }
      out.push(
        href.startsWith("/") ? (
          <Link key={k} href={href}>
            {inline(m[5], k, canLink)}
          </Link>
        ) : (
          <a key={k} href={href} target="_blank" rel="noopener noreferrer">
            {inline(m[5], k, canLink)}
          </a>
        ),
      );
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

const cells = (row: string) =>
  row
    .trim()
    .replace(/^\||\|$/g, "")
    .split("|")
    .map((c) => c.trim());

export function Markdown({ source, linkCheck }: { source: string; linkCheck?: LinkCheck }) {
  const canLink = linkCheck ?? allowAll;
  const il = (text: string, key: string) => inline(text, key, canLink);
  const lines = source.replace(/\r/g, "").split("\n");
  const blocks: React.ReactNode[] = [];
  let i = 0;
  let b = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i++;
      continue;
    }
    const key = `b${b++}`;
    if (line.startsWith("## ")) {
      const t = line.slice(3).trim();
      blocks.push(<h2 key={key} id={slugify(t)}>{il(t, key)}</h2>);
      i++;
    } else if (line.startsWith("### ")) {
      const t = line.slice(4).trim();
      blocks.push(<h3 key={key} id={slugify(t)}>{il(t, key)}</h3>);
      i++;
    } else if (line.startsWith("> ")) {
      const parts: string[] = [];
      while (i < lines.length && lines[i].startsWith("> ")) parts.push(lines[i++].slice(2));
      blocks.push(
        <aside key={key} className="my-6 rounded-2xl border-l-4 border-sea bg-mint px-5 py-4 text-[16px] text-sea-dark">
          {il(parts.join(" "), key)}
        </aside>,
      );
    } else if (line.startsWith("|")) {
      const rows: string[] = [];
      while (i < lines.length && lines[i].startsWith("|")) rows.push(lines[i++]);
      const [head, , ...body] = rows;
      blocks.push(
        <div key={key} className="my-6 overflow-x-auto rounded-2xl border border-line">
          <table className="w-full min-w-[520px] text-left text-[15px]">
            <thead className="bg-mist">
              <tr>
                {cells(head).map((c, j) => (
                  <th key={j} scope="col" className="px-4 py-2.5 font-semibold">{il(c, `${key}h${j}`)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {body.map((r, ri) => (
                <tr key={ri} className="border-t border-line">
                  {cells(r).map((c, j) => (
                    <td key={j} className="px-4 py-2.5 align-top">{il(c, `${key}r${ri}c${j}`)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
    } else if (/^- /.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^- /.test(lines[i])) items.push(lines[i++].slice(2));
      blocks.push(
        <ul key={key}>
          {items.map((t, j) => (
            <li key={j}>{il(t, `${key}-${j}`)}</li>
          ))}
        </ul>,
      );
    } else if (/^\d+\. /.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) items.push(lines[i++].replace(/^\d+\. /, ""));
      blocks.push(
        <ol key={key}>
          {items.map((t, j) => (
            <li key={j}>{il(t, `${key}-${j}`)}</li>
          ))}
        </ol>,
      );
    } else {
      const parts: string[] = [];
      while (i < lines.length && lines[i].trim() && !/^(## |### |> |\||- |\d+\. )/.test(lines[i])) parts.push(lines[i++].trim());
      blocks.push(<p key={key}>{il(parts.join(" "), key)}</p>);
    }
  }
  return <Fragment>{blocks}</Fragment>;
}

/** Plain text of a Markdown string (for feeds and llms.txt). */
export function plainText(md: string): string {
  return md
    .replace(/^#+ /gm, "")
    .replace(/^> /gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
}
