import React from "react";
import { BlogTheme, getThemeById } from "@/lib/blog-themes";
import DOMPurify from 'isomorphic-dompurify';

function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'b', 'i', 'u', 'a', 'code', 'pre',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'blockquote',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'img', 'hr', 'span', 'div', 'sup', 'sub', 'del',
    ],
    ALLOWED_ATTR: [
      'href', 'target', 'rel', 'src', 'alt', 'title', 'class',
      'width', 'height', 'id', 'colspan', 'rowspan',
    ],
    ALLOW_DATA_ATTR: false,
  });
}

export function renderInlineMarkdown(text: string): string {
  const html = text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code>$1</code>")
    .replace(/\[(.+?)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  return sanitizeHtml(html);
}

function getBlockVariantClasses(theme: BlogTheme) {
  switch (theme.blockVariant) {
    case "minimal":
      return {
        quote: "rounded-2xl border px-5 py-4",
        code: "rounded-2xl border px-4 py-4",
        tableWrap: "rounded-2xl border overflow-hidden",
        tableHead: "uppercase tracking-[0.18em] text-[11px]",
        paragraph: "my-3 leading-8",
      };
    case "editorial":
      return {
        quote: "border-l-[6px] px-5 py-4 italic rounded-r-2xl",
        code: "rounded-md border px-4 py-4 shadow-sm",
        tableWrap: "rounded-md border overflow-hidden shadow-sm",
        tableHead: "uppercase tracking-[0.2em] text-[11px] font-semibold",
        paragraph: "my-4 leading-9",
      };
    case "glow":
      return {
        quote: "rounded-2xl border px-5 py-4 shadow-[0_0_30px_rgba(0,0,0,0.15)]",
        code: "rounded-2xl border px-4 py-4 shadow-[0_0_24px_rgba(0,0,0,0.18)]",
        tableWrap: "rounded-2xl border overflow-hidden shadow-[0_0_24px_rgba(0,0,0,0.12)]",
        tableHead: "uppercase tracking-[0.22em] text-[11px]",
        paragraph: "my-3 leading-8",
      };
    case "terminal":
      return {
        quote: "border rounded-none px-4 py-3 font-mono",
        code: "border rounded-none px-4 py-4 font-mono",
        tableWrap: "border rounded-none overflow-hidden",
        tableHead: "uppercase tracking-[0.22em] text-[11px] font-mono",
        paragraph: "my-3 leading-8 font-mono",
      };
    case "soft":
    default:
      return {
        quote: "rounded-3xl border px-5 py-4",
        code: "rounded-3xl border px-4 py-4",
        tableWrap: "rounded-3xl border overflow-hidden",
        tableHead: "uppercase tracking-[0.18em] text-[11px]",
        paragraph: "my-3 leading-8",
      };
  }
}

function getInlineCodeHtml(text: string, theme: BlogTheme): string {
  return text.replace(/`(.+?)`/g, `<code style="background:${theme.palette.codeBackground};color:${theme.palette.codeText};padding:0.1rem 0.35rem;border-radius:0.45rem;border:1px solid ${theme.palette.border};font-size:0.92em;">$1</code>`);
}

function renderThemedInlineMarkdown(text: string, theme: BlogTheme): string {
  const linked = sanitizeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/\[(.+?)\]\((https?:\/\/[^\s)]+)\)/g, `<a href="$2" target="_blank" rel="noopener noreferrer" style="color:${theme.palette.accent};text-decoration:underline;text-underline-offset:3px;">$1</a>`);
  return getInlineCodeHtml(linked, theme);
}

export function renderMarkdownBlocks(content: string, themeInput?: BlogTheme): React.ReactNode[] {
  const theme = themeInput || getThemeById("default");
  const variant = getBlockVariantClasses(theme);
  const lines = content.split("\n");
  const blocks: React.ReactNode[] = [];
  let bulletBuffer: string[] = [];
  let numberedBuffer: string[] = [];
  let checklistBuffer: { checked: boolean; text: string }[] = [];
  let tableBuffer: string[] = [];
  let codeFenceBuffer: string[] | null = null;
  let codeFenceLanguage = "";

  const flushTableBuffer = (key: string) => {
    if (tableBuffer.length < 2) {
      tableBuffer = [];
      return;
    }

    const rows = tableBuffer.map((row) =>
      row
        .split("|")
        .map((cell) => cell.trim())
        .filter((cell) => cell.length > 0)
    );

    const header = rows[0] || [];
    const bodyRows = rows.slice(2);

    if (header.length === 0) {
      tableBuffer = [];
      return;
    }

    blocks.push(
      <div key={`${key}-table-wrap`} className={`my-6 overflow-x-auto ${variant.tableWrap}`} style={{ borderColor: theme.palette.border, backgroundColor: theme.palette.surface }}>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              {header.map((cell, idx) => (
                <th
                  key={`${key}-th-${idx}`}
                  className={`${variant.tableHead} border px-3 py-3 text-left`}
                  style={{ borderColor: theme.palette.border, backgroundColor: theme.palette.tableHeaderBackground, color: theme.palette.heading }}
                  dangerouslySetInnerHTML={{ __html: renderThemedInlineMarkdown(cell, theme) }}
                />
              ))}
            </tr>
          </thead>
          <tbody>
            {bodyRows.map((row, rowIdx) => (
              <tr key={`${key}-tr-${rowIdx}`}>
                {row.map((cell, cellIdx) => (
                  <td
                    key={`${key}-td-${rowIdx}-${cellIdx}`}
                    className="border px-3 py-3 align-top"
                    style={{ borderColor: theme.palette.border, color: theme.palette.text }}
                    dangerouslySetInnerHTML={{ __html: renderThemedInlineMarkdown(cell, theme) }}
                  />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );

    tableBuffer = [];
  };

  const flushBuffers = (key: string) => {
    flushTableBuffer(key);

    if (bulletBuffer.length > 0) {
      blocks.push(
        <ul key={`${key}-bullets`} className="list-disc pl-6 my-4 space-y-2" style={{ color: theme.palette.text }}>
          {bulletBuffer.map((item, idx) => (
            <li key={`${key}-b-${idx}`} dangerouslySetInnerHTML={{ __html: renderThemedInlineMarkdown(item, theme) }} />
          ))}
        </ul>
      );
      bulletBuffer = [];
    }

    if (numberedBuffer.length > 0) {
      blocks.push(
        <ol key={`${key}-numbers`} className="list-decimal pl-6 my-4 space-y-2" style={{ color: theme.palette.text }}>
          {numberedBuffer.map((item, idx) => (
            <li key={`${key}-n-${idx}`} dangerouslySetInnerHTML={{ __html: renderThemedInlineMarkdown(item, theme) }} />
          ))}
        </ol>
      );
      numberedBuffer = [];
    }

    if (checklistBuffer.length > 0) {
      blocks.push(
        <ul key={`${key}-checklist`} className="list-none pl-1 my-4 space-y-2">
          {checklistBuffer.map((item, idx) => (
            <li key={`${key}-c-${idx}`} className="flex items-start gap-2">
              <input type="checkbox" checked={item.checked} readOnly className="mt-1" />
              <span style={{ color: theme.palette.text }} dangerouslySetInnerHTML={{ __html: renderThemedInlineMarkdown(item.text, theme) }} />
            </li>
          ))}
        </ul>
      );
      checklistBuffer = [];
    }
  };

  let currentAlign: string | null = null;

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // Handle <div align='...'> opening tags
    const alignMatch = trimmed.match(/^<div\s+align=['"]?(left|center|right|justify)['"]?\s*>/i);
    if (alignMatch) {
      currentAlign = alignMatch[1].toLowerCase();
      return;
    }

    // Handle </div> closing tags for alignment
    if (trimmed === "</div>" && currentAlign) {
      currentAlign = null;
      return;
    }

    if (trimmed.startsWith("```")) {
      if (codeFenceBuffer) {
        const codeText = codeFenceBuffer.join("\n");
        blocks.push(
          <div key={`code-block-${index}`} className={`my-6 ${variant.code}`} style={{ backgroundColor: theme.palette.codeBackground, borderColor: theme.palette.border }}>
            {(codeFenceLanguage || codeText) && (
              <div className="mb-3 flex items-center justify-between text-[11px] uppercase tracking-[0.18em]" style={{ color: theme.palette.mutedText }}>
                <span>{codeFenceLanguage || "code"}</span>
                <span>{theme.blockVariant}</span>
              </div>
            )}
            <pre className="overflow-x-auto whitespace-pre-wrap wrap-break-word">
              <code className={theme.fontClass} style={{ color: theme.palette.codeText }}>{codeText}</code>
            </pre>
          </div>
        );
        codeFenceBuffer = null;
        codeFenceLanguage = "";
      } else {
        codeFenceBuffer = [];
        codeFenceLanguage = trimmed.replace(/```/g, "").trim();
      }
      return;
    }

    if (codeFenceBuffer) {
      codeFenceBuffer.push(line);
      return;
    }

    if (trimmed.startsWith("- ")) {
      bulletBuffer.push(trimmed.replace(/^-\s+/, ""));
      return;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      numberedBuffer.push(trimmed.replace(/^\d+\.\s+/, ""));
      return;
    }

    if (/^- \[( |x|X)\]\s+/.test(trimmed)) {
      checklistBuffer.push({
        checked: /^- \[(x|X)\]/.test(trimmed),
        text: trimmed.replace(/^- \[( |x|X)\]\s+/, ""),
      });
      return;
    }

    if (/^\|.*\|$/.test(trimmed)) {
      tableBuffer.push(trimmed);
      return;
    }

    flushBuffers(`line-${index}`);

    if (!trimmed) return;

    if (trimmed.startsWith("### ")) {
      blocks.push(
        <h3
          key={`h3-${index}`}
          className={`text-xl font-bold mt-8 mb-3 ${theme.fontClass}`}
          style={{ color: theme.palette.heading, textAlign: currentAlign as React.CSSProperties["textAlign"] || undefined }}
          dangerouslySetInnerHTML={{ __html: renderThemedInlineMarkdown(trimmed.replace(/^###\s+/, ""), theme) }}
        />
      );
      return;
    }

    if (trimmed.startsWith("## ")) {
      blocks.push(
        <h2
          key={`h2-${index}`}
          className={`text-2xl font-bold mt-10 mb-4 ${theme.fontClass}`}
          style={{ color: theme.palette.heading, textAlign: currentAlign as React.CSSProperties["textAlign"] || undefined }}
          dangerouslySetInnerHTML={{ __html: renderThemedInlineMarkdown(trimmed.replace(/^##\s+/, ""), theme) }}
        />
      );
      return;
    }

    if (trimmed.startsWith("# ")) {
      blocks.push(
        <h1
          key={`h1-${index}`}
          className={`text-3xl md:text-4xl font-bold mt-10 mb-5 ${theme.fontClass}`}
          style={{ color: theme.palette.heading, textAlign: currentAlign as React.CSSProperties["textAlign"] || undefined }}
          dangerouslySetInnerHTML={{ __html: renderThemedInlineMarkdown(trimmed.replace(/^#\s+/, ""), theme) }}
        />
      );
      return;
    }

    if (trimmed.startsWith("> ")) {
      const quoteContent = trimmed.replace(/^>\s+/, "").replace(/^\[!NOTE\]\s*/i, "");
      blocks.push(
        <blockquote
          key={`q-${index}`}
          className={`my-5 ${variant.quote}`}
          style={{ color: theme.palette.text, backgroundColor: theme.palette.blockquoteBackground, borderColor: theme.palette.accent, textAlign: currentAlign as React.CSSProperties["textAlign"] || undefined }}
          dangerouslySetInnerHTML={{ __html: renderThemedInlineMarkdown(quoteContent, theme) }}
        />
      );
      return;
    }

    if (/^---+$/.test(trimmed)) {
      blocks.push(<hr key={`hr-${index}`} className="my-8 border-t" style={{ borderColor: theme.palette.border }} />);
      return;
    }

    blocks.push(
      <p key={`p-${index}`} className={variant.paragraph} style={{ color: theme.palette.text, textAlign: currentAlign as React.CSSProperties["textAlign"] || undefined }} dangerouslySetInnerHTML={{ __html: renderThemedInlineMarkdown(trimmed, theme) }} />
    );
  });

  flushBuffers("end");

  const trailingCodeFence: string[] = codeFenceBuffer ?? [];
  if (trailingCodeFence.length > 0) {
    const codeText = trailingCodeFence.join("\n");
    blocks.push(
      <div key="code-block-end" className={`my-6 ${variant.code}`} style={{ backgroundColor: theme.palette.codeBackground, borderColor: theme.palette.border }}>
        <pre className="overflow-x-auto whitespace-pre-wrap wrap-break-word">
          <code className={theme.fontClass} style={{ color: theme.palette.codeText }}>{codeText}</code>
        </pre>
      </div>
    );
  }

  return blocks;
}
