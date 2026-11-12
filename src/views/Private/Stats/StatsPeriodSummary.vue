<template>
  <dl class="flex flex-col gap-1 pb-6">
    <dt
      v-if="title"
      class="ml-auto truncate font-medium text-gray-500 sm:text-sm dark:text-gray-400">
      {{ title }}
    </dt>

    <template v-for="(row, index) in rows" :key="`row-${index}`">
      <!-- eslint-disable-next-line vuejs-accessibility/no-static-element-interactions -- role="button" is set when interactive -->
      <div
        :aria-pressed="isRowInteractive(row) ? Boolean(row.selected) : undefined"
        :class="getRowClass(row)"
        :role="isRowInteractive(row) ? 'button' : undefined"
        :tabindex="isRowInteractive(row) ? 0 : undefined"
        @click="() => onSelect(row)"
        @keydown.enter.prevent="() => onSelect(row)"
        @keydown.space.prevent="() => onSelect(row)">
        <dt class="flex flex-row items-start gap-1.5 text-left text-base font-normal">
          <span
            class="mt-1.5 block size-3 shrink-0 rounded-full"
            :style="{ background: row.color }" />
          <span>
            {{ row.label }}
            <template v-if="row.sublabel">
              <br />
              {{ row.sublabel }}
            </template>
          </span>
        </dt>
        <dd
          :class="[
            'ml-6 font-mono text-base font-medium',
            row.muted ? 'text-gray-400' : 'text-gray-900 dark:text-gray-100',
          ]">
          {{ row.amount }}
        </dd>
      </div>
      <!-- eslint-disable-next-line vuejs-accessibility/no-static-element-interactions -- role="button" is set when interactive -->
      <div
        v-for="(child, childIndex) in row.children"
        :key="`row-${index}-${childIndex}`"
        :aria-pressed="isRowInteractive(child) ? Boolean(child.selected) : undefined"
        :class="getRowClass(child, true)"
        :role="isRowInteractive(child) ? 'button' : undefined"
        :tabindex="isRowInteractive(child) ? 0 : undefined"
        @click="() => onSelect(child)"
        @keydown.enter.prevent="() => onSelect(child)"
        @keydown.space.prevent="() => onSelect(child)">
        <dt
          class="flex flex-row items-center gap-1.5 text-left text-sm text-gray-500 dark:text-gray-400">
          <span class="block size-2 shrink-0 rounded-full" :style="{ background: child.color }" />
          {{ child.label }}
        </dt>
        <dd class="ml-6 font-mono text-sm text-gray-500 dark:text-gray-400">
          {{ child.amount }}
        </dd>
      </div>
    </template>

    <dd class="ml-auto text-3xl font-semibold text-gray-900 dark:text-gray-100">
      {{ formatAmount(total) }}
    </dd>

    <div class="flex flex-row items-start justify-between">
      <dt class="flex flex-row items-start gap-1.5 text-left text-base font-normal">
        <span
          class="mt-1.5 block size-3 shrink-0 rounded-full"
          :style="{ backgroundColor: chargesColor }" />
        <span class="truncate max-sm:max-w-32">{{ chargesLabel }}</span>
      </dt>
      <dd class="ml-6 font-mono text-base font-medium text-gray-900 dark:text-gray-100">
        {{ formatAmount(-charges) }}
      </dd>
    </div>

    <div
      :class="[
        '-mr-2.5 inline-flex items-baseline self-end rounded-full px-2.5 py-0.5 font-mono text-base font-medium md:mt-2 lg:mt-0',
        total > charges ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800',
      ]">
      {{ `${total > charges ? '+' : ''}${formatAmount(total - charges)}` }}
    </div>
  </dl>
</template>

<script setup lang="ts">
import { StatsTooltipRow } from './statsTooltip';
import { formatAmount } from '@/helpers/currency';
import { PropType } from 'vue';

const props = defineProps({
  title: {
    type: String,
    default: null,
  },
  rows: {
    type: Array as PropType<StatsTooltipRow[]>,
    default: () => [],
  },
  total: {
    type: Number,
    required: true,
  },
  charges: {
    type: Number,
    required: true,
  },
  chargesLabel: {
    type: String,
    required: true,
  },
  chargesColor: {
    type: String,
    required: true,
  },
  /**
   * Whether rows with `data` can be clicked to emit `select`
   */
  interactive: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits<{
  select: [data: unknown];
}>();

const isRowInteractive = (row: StatsTooltipRow) => props.interactive && row.data !== undefined;

const getRowClass = (row: StatsTooltipRow, isChild = false) => [
  'flex flex-row items-start justify-between rounded-md transition',
  isRowInteractive(row)
    ? [
        isChild ? 'ml-2.5 -mr-2 py-0.5 pr-2 pl-2' : '-mx-2 px-2 py-0.5',
        'cursor-pointer hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:hover:bg-neutral-700/50',
      ]
    : isChild && 'pl-4.5',
  row.dimmed && 'opacity-40',
];

const onSelect = (row: StatsTooltipRow) => {
  if (isRowInteractive(row)) {
    emit('select', row.data);
  }
};
</script>
