<template>
  <div class="p-6.5 px-5 rounded-7 border border-outline-gray-2">
    <div class="mb-6.5 flex justify-between items-center">
      <div class="ms-1">
        <Popover v-if="startYear !== endYear">
          <template #trigger>
            <Button
              class="flex items-center gap-2 text-xl-semibold cursor-pointer select-none"
              variant="ghost"
              :label="yearLabel(currentYear)"
              icon-right="lucide-chevron-down"
            />
          </template>
          <template #default="{ close: closePopover }">
            <div class="w-24">
              <div ref="yearsContainer" class="max-h-60 overflow-y-auto py-1">
                <div
                  v-for="year in yearsList"
                  :key="year"
                  ref="yearItems"
                  class="cursor-pointer px-3 py-1.5 text-sm hover:bg-surface-gray-2 flex items-center justify-between"
                  @click="onYearChange(closePopover, year)"
                >
                  {{ yearLabel(year) }}
                  <LucideCheck class="size-4" v-if="year === currentYear" />
                </div>
              </div>
            </div>
          </template>
        </Popover>
        <div
          v-else
          class="flex items-center gap-2 px-2 text-xl-semibold select-none"
        >
          {{ yearLabel(startYear) }}
        </div>
      </div>
      <div class="flex gap-2 items-center">
        <Button
          variant="ghost"
          icon="lucide-chevron-left"
          class="rtl:[&_svg]:rotate-180"
          :disabled="visibleMonths === 'first-half'"
          @click="visibleMonths = 'first-half'"
        />
        <Button variant="ghost" :label="__(`Today`)" @click="goToToday()" />
        <Button
          variant="ghost"
          icon="lucide-chevron-right"
          class="rtl:[&_svg]:rotate-180"
          :disabled="visibleMonths === 'second-half'"
          @click="visibleMonths = 'second-half'"
        />
      </div>
    </div>
    <div
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
      v-if="visibleMonths === 'first-half'"
    >
      <HLCalender
        v-for="month in months.slice(0, 6)"
        :key="month"
        :year="currentYear"
        :month="month"
        :holidays="holidayData.holidays"
      />
    </div>
    <div
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 justify-between gap-5"
      v-else
    >
      <HLCalender
        v-for="month in months.slice(6, 12)"
        :key="month"
        :year="currentYear"
        :month="month"
        :holidays="holidayData.holidays"
      />
    </div>
    <div class="flex gap-2 items-center w-full justify-center mt-8">
      <div
        :class="[
          'size-1.5 rounded-full cursor-pointer',
          {
            'bg-surface-gray-10': visibleMonths === 'first-half',
            'bg-surface-gray-4': visibleMonths === 'second-half',
          },
        ]"
        @click="visibleMonths = 'first-half'"
      />
      <div
        :class="[
          'size-1.5 rounded-full cursor-pointer',
          {
            'bg-surface-gray-10': visibleMonths === 'second-half',
            'bg-surface-gray-4': visibleMonths === 'first-half',
          },
        ]"
        @click="visibleMonths = 'second-half'"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import LucideCheck from "~icons/lucide/check";
import { computed, ref, watch } from "vue";
import HLCalender from "./HLCalender.vue";
import { holidayData } from "@/stores/holidayList";
import { Button, dayjs, Popover } from "frappe-ui";
import { digitsEnToFa } from "@persian-tools/persian-tools";
import { toJalaali } from "jalaali-js";

const visibleMonths = ref<"first-half" | "second-half">("first-half");
const months = ref([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
const isPersianCalendar = () => dayjs.locale().split("-")[0] === "fa";
const calendarParts = (date) =>
  isPersianCalendar()
    ? toJalaali(date.year(), date.month() + 1, date.date())
    : { jy: date.year(), jm: date.month() + 1 };
const yearLabel = (year: number) =>
  isPersianCalendar() ? digitsEnToFa(String(year)) : String(year);
const currentDate = calendarParts(dayjs());
const currentYear = ref(currentDate.jy);

const startYear = ref(
  calendarParts(dayjs(holidayData.value.from_date || dayjs())).jy
);
const endYear = ref(
  calendarParts(dayjs(holidayData.value.to_date || dayjs())).jy
);

const yearsList = computed(() => {
  const yearList = [];
  for (let year = startYear.value; year <= endYear.value; year++) {
    yearList.push(year);
  }
  return yearList;
});

const onYearChange = (closePopover: () => void, year: number) => {
  currentYear.value = year;
  const from = calendarParts(dayjs(holidayData.value.from_date));
  const to = calendarParts(dayjs(holidayData.value.to_date));
  if (year === from.jy) {
    if (from.jm >= 7) {
      visibleMonths.value = "second-half";
    }
  } else if (year === to.jy) {
    if (to.jm >= 7) {
      visibleMonths.value = "first-half";
    }
  } else {
    visibleMonths.value = "first-half";
  }
  closePopover();
};

const goToToday = () => {
  const today = calendarParts(dayjs());
  currentYear.value = today.jy;
  visibleMonths.value = today.jm >= 7 ? "second-half" : "first-half";
};

watch(
  () => [holidayData.value.from_date, holidayData.value.to_date],
  ([fromDate, toDate]) => {
    fromDate = calendarParts(dayjs(fromDate || dayjs()));
    toDate = calendarParts(dayjs(toDate || dayjs()));
    startYear.value = fromDate.jy;
    endYear.value = toDate.jy;
    currentYear.value = fromDate.jy;
    visibleMonths.value = fromDate.jm >= 7 ? "second-half" : "first-half";
  },
  // The list is loaded before this view mounts, so a change-only watch never fires.
  { immediate: true }
);
</script>
