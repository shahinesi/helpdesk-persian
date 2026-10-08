<template>
  <Badge
    theme="gray"
    variant="outline"
    size="lg"
    class="min-w-0 max-w-40 gap-1.5 transition-colors duration-150 hover:bg-surface-gray-2"
  >
    <span class="size-2 shrink-0 rounded-full" :class="color" />
    <span :title="displayTag" class="min-w-0 truncate text-ink-gray-7">{{
      displayTag
    }}</span>
  </Badge>
</template>

<script setup lang="ts">
import { Badge } from "frappe-ui";
import { computed } from "vue";
import { displayLinkOption } from "@/utils/displayLinkOption";

const props = defineProps<{ tag: string; color: string }>();
const displayTag = computed(() => displayLinkOption("Tag", props.tag));
</script>
