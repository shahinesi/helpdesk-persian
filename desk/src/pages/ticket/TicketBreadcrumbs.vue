<template>
  <PageTitle>
    <template #title>
      <Breadcrumbs :items="breadcrumbs" />
    </template>
    <template #right>
      <slot name="right" />
    </template>
  </PageTitle>
</template>

<script setup lang="ts">
import { __ } from "@/translation";
import { localizeWelcomeTicketSubject } from "@/utils/ticketSubject";
import { computed, inject } from "vue";
import { Breadcrumbs } from "frappe-ui";
import { PageTitle } from "@/components";
import { ITicket } from "./symbols";

interface P {
  parent: string;
  current: string;
  title?: string;
}

const props = withDefaults(defineProps<P>(), {
  title: "",
});
const ticket = inject(ITicket);
const breadcrumbs = computed(() => [
  { label: __("Tickets"), route: { name: props.parent } },
  {
    label:
      localizeWelcomeTicketSubject(
        ticket?.data?.subject,
        __("Welcome to Helpdesk")
      ) || props.title,
    route: { name: props.current },
  },
]);
</script>
