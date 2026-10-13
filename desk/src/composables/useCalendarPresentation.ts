import { useDocumentLocale } from "frappe-ui/localization";
import { computed } from "vue";

/** Resolve the shared date-picker calendar and a supported range format. */
export function useCalendarPresentation() {
  const { locale } = useDocumentLocale();
  const calendar = computed(() =>
    locale.value.toLowerCase().startsWith("fa") ? "persian" : "gregorian"
  );
  const rangeFormat = computed(() =>
    calendar.value === "persian" ? "YYYY/MM/DD" : "MMM D"
  );

  return { calendar, rangeFormat };
}
