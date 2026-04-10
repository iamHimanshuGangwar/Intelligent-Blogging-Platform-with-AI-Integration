export type InsertFormatFn = (prefix: string, suffix?: string) => void;

export type WritingTemplate = {
  id: string;
  label: string;
  category: string;
  title: string;
  excerpt: string;
  topic: string;
  content: string;
};

export type EditorToolbarButton = {
  icon: string;
  label: string;
  action: () => void;
};

export const WRITING_TEMPLATES: WritingTemplate[] = [
  {
    id: "blog-post",
    label: "Blog Post",
    category: "Technology",
    title: "How to Solve [Problem] with [Approach]",
    excerpt: "A practical breakdown of the challenge, the strategy, and key outcomes.",
    topic: "Technical Writing",
    content: `## Introduction

Write one short paragraph framing the reader's pain point and why this topic matters now.

## The Core Problem

- Context and constraints
- Why common approaches fail
- What success looks like

## Solution Breakdown

### 1. Set Up

Explain the required setup and assumptions.

### 2. Implementation

Walk through the key implementation steps with concrete examples.

### 3. Validation

Show how you tested and validated results.

## Key Takeaways

- Takeaway 1
- Takeaway 2
- Takeaway 3

## Next Steps

Recommend what readers should do next.`,
  },
  {
    id: "meeting-notes",
    label: "Meeting Notes",
    category: "Business",
    title: "Meeting Notes: [Project / Team Name]",
    excerpt: "Decisions, action items, and owners from today's meeting.",
    topic: "Team Collaboration",
    content: `## Meeting Details

- Date:
- Time:
- Attendees:
- Facilitator:

## Agenda

1. Topic one
2. Topic two
3. Topic three

## Discussion Notes

### Topic 1

- Summary:
- Risks / blockers:

### Topic 2

- Summary:
- Risks / blockers:

## Decisions Made

- Decision 1
- Decision 2

## Action Items

- [ ] Owner - Task - Due date
- [ ] Owner - Task - Due date

## Parking Lot

- Items deferred for later discussion`,
  },
  {
    id: "code-snippet",
    label: "Code Snippet",
    category: "Technology",
    title: "Code Walkthrough: [Feature Name]",
    excerpt: "A focused explanation of a useful snippet and how to adapt it.",
    topic: "Developer Guide",
    content: `## What This Snippet Solves

Explain the use case in one or two sentences.

## Code

\`\`\`ts
export function example(input: string) {
  if (!input.trim()) {
    throw new Error("Input is required");
  }

  return input.toLowerCase();
}
\`\`\`

## How It Works

1. Validate input
2. Transform data
3. Return normalized output

## Integration Tips

- Add tests for edge cases
- Handle runtime errors where this is called
- Extend with domain-specific validation`,
  },
];

export const getSlashCommands = (insertFormat: InsertFormatFn) => [
  { label: "Heading 1", action: () => insertFormat("\n# ", "") },
  { label: "Heading 2", action: () => insertFormat("\n## ", "") },
  { label: "Bullet List", action: () => insertFormat("\n- ", "") },
  { label: "Numbered List", action: () => insertFormat("\n1. ", "") },
  { label: "Blockquote", action: () => insertFormat("\n> ", "") },
  { label: "Code Block", action: () => insertFormat("\n\`\`\`\n", "\n\`\`\`\n") },
  { label: "Image", action: () => insertFormat("![", "](url)") },
  { label: "Table", action: () => insertFormat("\n| Column 1 | Column 2 |\n| --- | --- |\n| Value 1 | Value 2 |\n", "") },
  { label: "Checklist", action: () => insertFormat("\n- [ ] Task 1\n- [ ] Task 2\n", "") },
  { label: "Callout", action: () => insertFormat("\n> [!NOTE] Add your key insight here\n", "") },
];

export const getPrimaryToolbarButtons = (insertFormat: InsertFormatFn, applyAlignment: (align: "left" | "center" | "right" | "justify") => void): EditorToolbarButton[] => [
  { icon: "format_bold", label: "Bold", action: () => insertFormat("**", "**") },
  { icon: "format_italic", label: "Italic", action: () => insertFormat("*", "*") },
  { icon: "format_strikethrough", label: "Strikethrough", action: () => insertFormat("~~", "~~") },
  { icon: "format_list_bulleted", label: "Bullet List", action: () => insertFormat("\n- ", "") },
  { icon: "format_list_numbered", label: "Numbered List", action: () => insertFormat("\n1. ", "") },
  { icon: "format_quote", label: "Blockquote", action: () => insertFormat("\n> ", "") },
  { icon: "format_align_left", label: "Align Left", action: () => applyAlignment("left") },
  { icon: "format_align_center", label: "Center", action: () => applyAlignment("center") },
  { icon: "format_align_right", label: "Align Right", action: () => applyAlignment("right") },
  { icon: "format_align_justify", label: "Justify", action: () => applyAlignment("justify") },
  { icon: "link", label: "Link", action: () => insertFormat("[", "](url)") },
  { icon: "table", label: "Table", action: () => insertFormat("\n| Column 1 | Column 2 |\n| --- | --- |\n| Value 1 | Value 2 |\n", "") },
  { icon: "checklist", label: "Checklist", action: () => insertFormat("\n- [ ] Task 1\n- [ ] Task 2\n", "") },
];

export const getSecondaryToolbarButtons = (insertFormat: InsertFormatFn): EditorToolbarButton[] => [
  { icon: "format_clear", label: "Clear Format", action: () => insertFormat("", "") },
  { icon: "horizontal_rule", label: "Divider", action: () => insertFormat("\n\n---\n\n", "") },
  { icon: "code", label: "Inline Code", action: () => insertFormat("`", "`") },
  { icon: "code_blocks", label: "Code Block", action: () => insertFormat("\n\`\`\`\n", "\n\`\`\`\n") },
  { icon: "undo", label: "Undo", action: () => document.execCommand("undo") },
  { icon: "redo", label: "Redo", action: () => document.execCommand("redo") },
  { icon: "help", label: "Markdown Help", action: () => window.open("https://www.markdownguide.org/basic-syntax/", "_blank") },
];
