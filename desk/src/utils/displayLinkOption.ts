import { __ } from "@/translation";

const standardLinkOptions: Record<string, string[]> = {
  "HD Ticket Status": ["Open", "Replied", "Resolved", "Closed"],
  "HD Ticket Priority": ["Low", "Medium", "High", "Urgent"],
  "HD Ticket Type": ["Unspecified", "Question", "Bug", "Incident"],
  "HD Team": ["Billing", "Product Experts"],
  "HD Service Level Agreement": ["Standard"],
  Tag: ["First Ticket"],
};

export function displayLinkOption(doctype: string, option: string) {
  return standardLinkOptions[doctype]?.includes(option) ? __(option) : option;
}
