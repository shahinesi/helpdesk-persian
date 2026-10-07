import { dayjs } from "frappe-ui";
import { digitsEnToFa } from "@persian-tools/persian-tools";
import { jalaaliWeek, toGregorian, toJalaali } from "jalaali-js";
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

  const firstOfMonth = computed(() => {
    if (!currentYear.value || !currentMonth.value) return null;
    if (isPersianCalendar()) {
      const gregorian = toGregorian(currentYear.value, currentMonth.value, 1);
      return dayjs(new Date(gregorian.gy, gregorian.gm - 1, gregorian.gd));
    }
    return dayjs(new Date(currentYear.value, currentMonth.value - 1, 1));
  });

  const weekdays = computed(() => {
    if (!isPersianCalendar()) return ["s", "m", "t", "w", "t", "f", "s"];
    const { saturday } = jalaaliWeek(currentYear.value, currentMonth.value, 1);
    const gregorian = toGregorian(saturday.jy, saturday.jm, saturday.jd);
    const start = new Date(
      Date.UTC(gregorian.gy, gregorian.gm - 1, gregorian.gd, 12)
    );
    const formatter = new Intl.DateTimeFormat("fa-u-ca-persian-nu-arabext", {
      weekday: "narrow",
      timeZone: "UTC",
    });
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(start);
      date.setUTCDate(date.getUTCDate() + index);
      return formatter.format(date);
    });
  });

  // Always six weeks, so the grid height never jumps between months.
  const datesAsWeeks = computed<Date[][]>(() => {
    const first = firstOfMonth.value;
    if (!first) return [];
    let start = first.startOf("week");
    if (isPersianCalendar()) {
      const { saturday } = jalaaliWeek(
        currentYear.value,
        currentMonth.value,
        1
      );
      const gregorian = toGregorian(saturday.jy, saturday.jm, saturday.jd);
      start = dayjs(new Date(gregorian.gy, gregorian.gm - 1, gregorian.gd));
    }
    return Array.from({ length: 6 }, (_, week) =>
      Array.from({ length: 7 }, (_, day) =>
        start.add(week * 7 + day, "day").toDate()
      )
    );
  });

  const formattedMonth = computed(() => {
    if (!firstOfMonth.value) return "";
    if (!isPersianCalendar()) return firstOfMonth.value.format("MMMM, YYYY");
    const date = firstOfMonth.value.toDate();
    return digitsEnToFa(
      new Intl.DateTimeFormat("fa-u-ca-persian-nu-arabext", {
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      }).format(
        new Date(
          Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12)
        )
      )
    );
  });

  function isInCurrentMonth(date: Date): boolean {
    if (!isPersianCalendar()) {
      return (
        date.getFullYear() === currentYear.value &&
        date.getMonth() === currentMonth.value - 1
      );
    }
    const value = toJalaali(
      date.getFullYear(),
      date.getMonth() + 1,
      date.getDate()
    );
    return value.jy === currentYear.value && value.jm === currentMonth.value;
  }

  function dayLabel(date: Date): string {
    const day = isPersianCalendar()
      ? toJalaali(date.getFullYear(), date.getMonth() + 1, date.getDate()).jd
      : date.getDate();
    return isPersianCalendar() ? digitsEnToFa(String(day)) : String(day);
  }

  function yearLabel(year: number): string {
    return isPersianCalendar() ? digitsEnToFa(String(year)) : String(year);
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
