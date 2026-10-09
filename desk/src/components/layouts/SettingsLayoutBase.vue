<template>
  <div class="flex h-full w-full flex-col pb-8">
    <div class="relative z-10 px-4 py-5 pb-4 sm:px-8 sm:py-8 sm:pb-6 lg:px-10">
      <div class="flex items-start justify-between">
        <div class="flex flex-col gap-1 text-start">
          <slot name="title">
            <div v-if="backLabel" class="flex items-center gap-2">
              <Button
                variant="ghost"
                :icon-left="isRtl ? 'lucide-chevron-right' : 'lucide-chevron-left'"
                :label="backLabel"
                size="md"
                @click="onBack"
                class="cursor-pointer -ms-4 hover:bg-transparent focus:bg-transparent focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:none active:bg-transparent active:outline-none active:ring-0 active:ring-offset-0 active:text-ink-gray-5 text-ink-gray-7 text-md-semibold hover:opacity-70 !pe-0 !max-w-96 !justify-start rtl:ps-4"
              />
              <UnsavedBadge :show="Boolean(dirty)" />
            </div>
            <h1 v-else class="text-md-semibold text-ink-gray-8">
              {{ __(title) }}
            </h1>
          </slot>
          <slot
            name="description"
            v-if="Boolean($slots['description']) || Boolean(description)"
          >
            <p class="text-p-sm max-w-md text-ink-gray-6">
              {{ __(description) }}
            </p>
          </slot>
        </div>
        <slot name="header-actions" v-if="Boolean($slots['header-actions'])" />
      </div>
      <div class="mt-6" v-if="Boolean($slots['header-bottom'])">
        <slot name="header-bottom" />
      </div>
    </div>
    <div
      class="flex h-full flex-col overflow-y-auto px-4 pb-8 text-start sm:px-8 lg:px-10"
    >
      <slot name="content" />
    </div>
  </div>
</template>

<script setup lang="ts">
import UnsavedBadge from "@/components/UnsavedBadge.vue";

const isRtl = document.documentElement.dir === "rtl";

defineProps<{
  title?: string;
  description?: string;
  backLabel?: string;
  onBack?: () => void;
  dirty?: boolean;
}>();
</script>
