import { dayjs } from "frappe-ui";
import {
  formatLocaleNumber,
  getISODateFromPersianDate,
  getPersianCalendarMonth,
  getPersianDateFromISO,
} from "frappe-ui/localization";
import { computed, ref } from "vue";

/**
 * Calendar grid for a given month, as six weeks of seven days.
 *
 * Replaces frappe-ui's `useDatePicker`, dropped in 1.0.0-beta.63. Only the
 * month grid survives here — the pickers themselves are frappe-ui components.
 */
export function useDatePicker() {
  const currentYear = ref<number>(0);
  const currentMonth = ref<number>(0);
  const isPersianCalendar = () => dayjs.locale().split("-")[0] === "fa";

  const today = computed(() => dayjs().toDate());
  const persianMonth = computed(() => {
    if (!isPersianCalendar() || !currentYear.value || !currentMonth.value) {
      return null;
    }
    return getPersianCalendarMonth(
      currentYear.value,
      currentMonth.value,
      dayjs.locale()
    );
  });

  const firstOfMonth = computed(() => {
    if (!currentYear.value || !currentMonth.value) return null;
    if (isPersianCalendar()) {
      const isoDate = getISODateFromPersianDate({
        year: currentYear.value,
        month: currentMonth.value,
        day: 1,
      });
      return dayjs(localDateFromISO(isoDate));
    }
    return dayjs(new Date(currentYear.value, currentMonth.value - 1, 1));
  });

  const weekdays = computed(() => {
    if (!isPersianCalendar()) return ["s", "m", "t", "w", "t", "f", "s"];
    return persianMonth.value?.weekdayLabels ?? [];
  });

  // Always six weeks, so the grid height never jumps between months.
  const datesAsWeeks = computed<Date[][]>(() => {
    const first = firstOfMonth.value;
    if (!first) return [];
    if (isPersianCalendar()) {
      return (
        persianMonth.value?.weeks.map((week) =>
          week.map((cell) => localDateFromISO(cell.isoDate))
        ) ?? []
      );
    }
    const start = first.startOf("week");
    return Array.from({ length: 6 }, (_, week) =>
      Array.from({ length: 7 }, (_, day) =>
        start.add(week * 7 + day, "day").toDate()
      )
    );
  });

  const formattedMonth = computed(() => {
    if (!firstOfMonth.value) return "";
    if (!isPersianCalendar()) return firstOfMonth.value.format("MMMM, YYYY");
    const month = persianMonth.value;
    return month ? `${month.monthName} ${month.yearLabel}` : "";
  });

  function isInCurrentMonth(date: Date): boolean {
    if (!isPersianCalendar()) {
      return (
        date.getFullYear() === currentYear.value &&
        date.getMonth() === currentMonth.value - 1
      );
    }
    const value = getPersianDateFromISO(localISODate(date));
    return (
      value.year === currentYear.value && value.month === currentMonth.value
    );
  }

  function dayLabel(date: Date): string {
    if (!isPersianCalendar()) return String(date.getDate());
    return formatLocaleNumber(getPersianDateFromISO(localISODate(date)).day, {
      useGrouping: false,
    });
  }

  function yearLabel(year: number): string {
    return isPersianCalendar()
      ? formatLocaleNumber(year, { useGrouping: false })
      : String(year);
  }

  return {
    currentYear,
    currentMonth,
    today,
    datesAsWeeks,
    formattedMonth,
    weekdays,
    isInCurrentMonth,
    dayLabel,
    yearLabel,
  };
}

function localISODate(date: Date): string {
  const year = String(date.getFullYear()).padStart(4, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function localDateFromISO(isoDate: string): Date {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day);
}
