import { createResource } from "frappe-ui";
import { __ } from "@/translation";

export const filterableFields = createResource({
  url: "helpdesk.api.doc.get_filterable_fields",
  params: {
    doctype: "HD Ticket",
    ignore_team_restrictions: true,
  },
  transform: (data) => {
    data = data
      .filter((field) => !field.fieldname.startsWith("_"))
      .map((field) => {
        return {
          ...field,
          label: __(field.label),
          value: field.fieldname,
        };
      });
    return data;
  },
});
