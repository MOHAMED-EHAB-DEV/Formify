import React from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

/**
 * Lightweight, zero-dependency Markdown renderer.
 * Safely parses bold (**text**), italic (*text*), inline code (`code`),
 * and unordered bullet lists (- item).
 */
export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  if (!content) return null;

  // Split lines to detect list items vs standard paragraphs
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let currentList: string[] = [];

  const flushList = (keyPrefix: number) => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={`list-${keyPrefix}`} className="list-disc ps-5 my-1.5 space-y-0.5">
          {currentList.map((item, idx) => (
            <li key={idx} className="text-inherit">
              {renderFormattedInline(item)}
            </li>
          ))}
        </ul>
      );
      currentList = [];
    }
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    // Bullet list detection: starts with '- ' or '* '
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      currentList.push(trimmed.slice(2));
    } else {
      flushList(index);
      if (trimmed.length > 0) {
        elements.push(
          <p key={`p-${index}`} className="my-0.5 leading-relaxed">
            {renderFormattedInline(line)}
          </p>
        );
      }
    }
  });

  flushList(lines.length);

  return <div className={`markdown-body inline-block ${className}`}>{elements}</div>;
}

function renderFormattedInline(text: string): React.ReactNode[] {
  // Tokenize bold, italic, code, and plain text
  // Pattern matches:
  // 1. `code`
  // 2. **bold** or __bold__
  // 3. *italic* or _italic_
  const parts: React.ReactNode[] = [];
  const regex = /(`[^`]+`|\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*|_[^_]+_)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    // Push preceding plain text
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    const token = match[0];
    const key = `fmt-${match.index}`;

    if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(
        <code
          key={key}
          className="rounded bg-muted px-1.5 py-0.5 text-[0.9em] font-mono text-foreground border border-border-subtle"
        >
          {token.slice(1, -1)}
        </code>
      );
    } else if (
      (token.startsWith('**') && token.endsWith('**')) ||
      (token.startsWith('__') && token.endsWith('__'))
    ) {
      parts.push(
        <strong key={key} className="font-semibold text-foreground">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (
      (token.startsWith('*') && token.endsWith('*')) ||
      (token.startsWith('_') && token.endsWith('_'))
    ) {
      parts.push(
        <em key={key} className="italic">
          {token.slice(1, -1)}
        </em>
      );
    }

    lastIndex = regex.lastIndex;
  }

  // Push remaining plain text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}
