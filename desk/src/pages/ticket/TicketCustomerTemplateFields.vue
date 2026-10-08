<template>
  <div class="space-y-2 px-6 py-3.5 border-b">
    <div class="flex items-center gap-4">
      <span class="w-[150px] shrink-0 text-p-sm text-ink-gray-5">{{
        __("Status")
      }}</span>
      <span
        class="flex-1 truncate rounded-4 border border-outline-gray-2 bg-surface-base px-2 py-1 text-p-sm text-ink-gray-9"
      >
        {{ displayLinkOption("HD Ticket Status", ticket.data.status) }}
      </span>
    </div>

    <div v-if="ticket.data.priority" class="flex items-center gap-4">
      <span class="w-[150px] shrink-0 text-p-sm text-ink-gray-5">{{
        __("Priority")
      }}</span>
      <span
        class="flex-1 truncate rounded-4 border border-outline-gray-2 bg-surface-base px-2 py-1 text-p-sm text-ink-gray-9"
      >
        {{ displayLinkOption("HD Ticket Priority", ticket.data.priority) }}
      </span>
    </div>

    <div
      v-for="data in slaData"
      :key="data.title"
      class="flex items-center gap-4"
    >
      <Tooltip
        :text="
          formatLocalizedDate(dayjs(data.value), 'dddd, MMM D, YYYY h:mm A')
        "
      >
        <span class="w-[150px] shrink-0 text-p-sm text-ink-gray-5">{{
          data.title
        }}</span>
      </Tooltip>
      <span class="flex-1 truncate text-p-sm" :class="data.textColor">
        {{ __(data.label) }}
      </span>
    </div>

    <div
      v-for="field in customFields"
      :key="field.fieldname"
      class="flex items-center gap-4"
    >
      <span class="w-[150px] shrink-0 text-p-sm text-ink-gray-5">{{
        field.label
      }}</span>
      <span
        class="flex-1 truncate rounded-4 border border-outline-gray-2 bg-surface-base px-2 py-1 text-p-sm text-ink-gray-9"
      >
        {{ ticket.data[field.fieldname] }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatLocalizedDate } from "@/utils";
import { displayLinkOption } from "@/utils/displayLinkOption";
import { dayjs } from "frappe-ui";
import {
  slaLabel,
  slaTextColor,
  useSLA,
  type SLAMetric,
} from "@/composables/useSLA";
import { Field } from "@/types";
import { computed, inject } from "vue";
import { ITicket } from "./symbols";

const ticket = inject(ITicket);

const { firstResponse, resolution } = useSLA(
  computed(() => ({ doc: ticket.data }))
);

const slaData = computed(() =>
  [
    { title: __("Expected First Response"), metric: firstResponse.value },
    { title: __("Expected Resolution"), metric: resolution.value },
  ]
    .filter((row): row is { title: string; metric: SLAMetric } =>
      Boolean(row.metric)
    )
    .map((row) => ({
      title: row.title,
      value: row.metric.dueBy,
      label: slaLabel(row.metric),
      textColor: slaTextColor(row.metric),
    }))
);

const customFields = computed(() =>
  ticket.data.template.fields.filter(
    (f: Field) =>
      f.fieldname !== "priority" &&
      ticket.data[f.fieldname] != null &&
      ticket.data[f.fieldname] !== ""
  )
);
</script>
