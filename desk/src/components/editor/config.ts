import {
  CleanStyles,
  ComponentUtils,
  DismissSuggestionsOnOutsideClick,
  HandleExcelPaste,
} from "@/tiptap-extensions";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Blockquote,
  Bold,
  BulletList,
  FontColor,
  FontHighlight,
  HeadingGroup,
  HorizontalRule,
  InlineCode,
  InsertImage,
  InsertLink,
  InsertTable,
  InsertVideo,
  Italic,
  OrderedList,
  Paragraph,
  RichTextKit,
  Separator,
  Strike,
  commentToolbar as baseCommentToolbar,
  type CommandMenuItem,
  type MentionSuggestionItem,
  type MenuItem,
} from "frappe-ui/editor";
import { computed, type MaybeRefOrGetter } from "vue";
import { __ } from "@/translation";

/**
 * Build the extension list for a Helpdesk rich-text editor.
 *
 * Mentions are passed as a reactive getter so the `@` list stays in sync as
 * agents load (the v0 `:mentions` snapshot prop is what broke suggestions).
 */
export function buildEditorExtensions(
  options: {
    mentions?: MaybeRefOrGetter<MentionSuggestionItem[]>;
    extra?: unknown[];
  } = {}
) {
  const kit = RichTextKit.configure({
    heading: { levels: [2, 3, 4, 5, 6] },
    // rc.1 ships the table-of-contents node off; helpdesk editors had it.
    toc: {},
    ...(options.mentions ? { mention: { items: options.mentions } } : {}),
  });
  return [
    kit,
    ComponentUtils,
    HandleExcelPaste,
    CleanStyles,
    DismissSuggestionsOnOutsideClick,
    ...(options.extra ?? []),
  ];
}

/** Clear-formatting toolbar button (ports the v0 `ClearFormattingUtility`). */
export const ClearFormatting: CommandMenuItem = {
  label: "Clear formatting",
  icon: "lucide-brush-cleaning",
  action: (editor) =>
    editor.chain().focus().unsetAllMarks().clearNodes().cleanStyles().run(),
};

/** Code block button; frappe-ui ships the node but no toolbar item for it. */
export const InsertCodeBlock: CommandMenuItem = {
  label: "Code block",
  icon: "lucide-square-code",
  isActive: (editor) => editor.isActive("codeBlock"),
  action: (editor) => editor.chain().focus().toggleCodeBlock().run(),
};

/** Full toolbar mirroring the v0 `textEditorMenuButtons`. */
const fullToolbarItems: MenuItem[] = [
  HeadingGroup,
  Separator,
  Bold,
  Italic,
  Strike,
  FontColor,
  FontHighlight,
  Separator,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Separator,
  BulletList,
  OrderedList,
  Blockquote,
  InlineCode,
  InsertCodeBlock,
  Separator,
  InsertLink,
  InsertImage,
  InsertVideo,
  InsertTable,
  HorizontalRule,
  Separator,
  ClearFormatting,
];

/**
 * Curated toolbar for the new-ticket / base editor (ports the v0 `fixedMenu`).
 * Kept compact so the toolbar + Discard/Submit fit on one row.
 */
const ticketToolbarItems: MenuItem[] = [
  Paragraph,
  HeadingGroup,
  Separator,
  Bold,
  Italic,
  Separator,
  BulletList,
  OrderedList,
  Separator,
  InsertImage,
  InsertVideo,
  InsertLink,
  Blockquote,
  InlineCode,
  ClearFormatting,
];

const editorLabel = (label: string) => {
  switch (label) {
    case "Heading":
      return __("Heading");
    case "Heading 2":
      return __("Heading 2");
    case "Heading 3":
      return __("Heading 3");
    case "Heading 4":
      return __("Heading 4");
    case "Heading 5":
      return __("Heading 5");
    case "Heading 6":
      return __("Heading 6");
    case "Paragraph":
      return __("Paragraph");
    case "Bold":
      return __("Bold");
    case "Italic":
      return __("Italic");
    case "Strike":
      return __("Strike");
    case "Code":
      return __("Code");
    case "Bullet List":
      return __("Bullet List");
    case "Ordered List":
      return __("Ordered List");
    case "Blockquote":
      return __("Blockquote");
    case "Align Left":
      return __("Align Left");
    case "Align Center":
      return __("Align Center");
    case "Align Right":
      return __("Align Right");
    case "Font Color":
      return __("Font Color");
    case "Highlight":
      return __("Highlight");
    case "Image / Gallery":
      return __("Image / Gallery");
    case "Video":
      return __("Video");
    case "Link":
      return __("Link");
    case "Table":
      return __("Table");
    case "Horizontal rule":
      return __("Horizontal rule");
    case "Clear formatting":
      return __("Clear formatting");
    case "Code block":
      return __("Code block");
    default:
      return __(label);
  }
};

function localizeMenu(items: MenuItem[]): MenuItem[] {
  return items.map((item) => {
    if ("type" in item && item.type === "separator") return item;
    const localized: any = { ...item, label: editorLabel(item.label) };
    if ("items" in item) localized.items = localizeMenu(item.items);
    if ("getLabel" in item && item.getLabel) {
      localized.getLabel = (editor) => editorLabel(item.getLabel!(editor));
    }
    return localized;
  });
}

export const fullToolbar = computed(() => localizeMenu(fullToolbarItems));
export const ticketToolbar = computed(() => localizeMenu(ticketToolbarItems));

/** Compact bubble/inline toolbar for comment display + inline editing. */
export const commentToolbar = computed(() => localizeMenu(baseCommentToolbar));
