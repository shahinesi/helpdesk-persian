import { __ } from "@/translation";

export function translateViewLabel(view) {
  const label = view.label ?? "";
  if (!view.is_standard) return label;

  switch (label) {
    case "My Feedback":
      return __("My Feedback");
    case "Pending Tickets":
      return __("Pending Tickets");
    case "Recently Assigned Tickets":
      return __("Recently Assigned Tickets");
    case "SLA Alerts":
      return __("SLA Alerts");
    default:
      return __(label);
  }
}

export function editorLabel(label) {
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
}
