<template>
  <Combobox
    v-model="selectedOptions"
    as="div"
    class="flex flex-col"
    :disabled="disabled"
    :multiple="multiple"
    :nullable="nullable"
    @update:model-value="query = ''">
    <template #default="{ open }">
      <slot :for-id="id" :label="label" name="label" :optional="optional">
        <ComboboxLabel
          v-if="label"
          class="block font-medium text-gray-900 sm:text-sm dark:text-gray-100"
          :for="id">
          {{
            [label, optional && `(${$t('common.optional').toLocaleLowerCase()})`]
              .filter(Boolean)
              .join(' ')
          }}
        </ComboboxLabel>
      </slot>
      <slot :description="description" name="description">
        <span class="text-sm text-slate-500 dark:text-slate-400">{{ description }}</span>
      </slot>
      <slot name="above" />
      <div :class="['group relative flex flex-row gap-3', (label || description) && 'mt-1']">
        <slot name="before" />
        <ComboboxInput
          :id="id"
          :aria-invalid="isInvalid"
          :as="as"
          :class="[
            `min-h-10 w-full rounded-md border bg-white py-2 pl-3 pr-8 shadow-sm transition-colors
            focus:outline-none focus:ring-1 disabled:cursor-not-allowed disabled:border-gray-200
            disabled:bg-gray-50 disabled:text-gray-500 sm:text-sm dark:bg-slate-800
            dark:disabled:border-gray-700 dark:disabled:bg-slate-700 dark:disabled:text-gray-400`,
            isInvalid
              ? `border-red-300 text-red-900 placeholder:text-red-300 focus:border-red-500
                focus:ring-red-500 dark:border-red-500/50 dark:text-red-300
                dark:placeholder:text-red-300/50 dark:focus:border-red-600`
              : `border-gray-300 focus:border-sky-500 focus:ring-sky-500 dark:border-gray-600
                dark:text-gray-100`,
            inputClass,
          ]"
          :display-value="
            multiple
              ? (elements) => formatConjonction((elements as any[]).map(format), $i18n.locale)
              : (element) => (element ? format(element) : '')
          "
          :name="name"
          :placeholder="placeholder"
          :readonly="readonly"
          :required="required"
          :rows="rows"
          :tabindex="tabindex"
          :type="nullable ? 'search' : 'text'"
          @change="query = $event.target.value"
          @click="() => onInputClick(open)" />
        <ComboboxButton
          ref="buttonRef"
          class="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
          <AppIcon
            class="size-5 text-gray-400"
            :icon="open ? mdiUnfoldLessHorizontal : mdiUnfoldMoreHorizontal" />
        </ComboboxButton>
        <AppButtonIcon
          v-if="
            !(disabled || readonly) &&
            (isArray(selectedOptions) ? selectedOptions.length > 0 : !isNil(selectedOptions))
          "
          class="absolute right-8 top-1/2 size-7 -translate-y-1/2 bg-white/10 opacity-0 backdrop-blur-md transition-opacity focus:opacity-100 group-hover:opacity-100 dark:bg-slate-900/10"
          :icon="mdiClose"
          :title="$t('action.clear')"
          @click.stop.prevent="onClear" />
        <LoadingProgressBar v-if="loading" class="absolute inset-x-1 bottom-0 h-px" />

        <slot name="after" />

        <transition
          enter-active-class="transition duration-100 ease-out"
          enter-from-class="transform scale-95 opacity-0"
          enter-to-class="transform scale-100 opacity-100"
          leave-active-class="transition duration-75 ease-out"
          leave-from-class="transform scale-100 opacity-100"
          leave-to-class="transform scale-95 opacity-0">
          <ComboboxOptions
            v-if="filteredOptions.length > 0"
            class="absolute z-30 mt-1 max-h-60 w-full overflow-y-auto overflow-x-hidden overscroll-contain rounded-md border border-gray-200 bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-[5%] focus:outline-none max-sm:bottom-full sm:top-full sm:text-sm dark:border-gray-700 dark:bg-slate-900">
            <ComboboxOption
              v-for="option in filteredOptions"
              :key="option"
              as="template"
              :value="option"
              v-slot="{ active, selected }">
              <slot :active="active" name="option" :option="option" :selected="selected">
                <li
                  :class="[
                    'relative cursor-default select-none py-2 pl-3 pr-9',
                    active
                      ? 'bg-sky-600 text-white dark:bg-sky-700'
                      : 'text-gray-900 dark:text-gray-100',
                  ]">
                  <div class="flex">
                    <span :class="[selected && 'font-semibold']">
                      {{ format(option) }}
                    </span>
                  </div>

                  <span
                    v-if="selected"
                    :class="[
                      `absolute right-2 top-1/2 flex size-6 -translate-y-1/2 items-center
                      rounded-full bg-opacity-[75%] p-0.5 backdrop-blur-md transition-colors`,
                      active ? 'text-white' : 'text-sky-600 dark:text-sky-500 ',
                    ]">
                    <SvgIcon aria-hidden="true" class="size-5" :path="mdiCheck" type="mdi" />
                  </span>
                </li>
              </slot>
            </ComboboxOption>
          </ComboboxOptions>
        </transition>
      </div>
      <slot name="hint">
        <AppFieldHint v-if="!hideDetails" :errors="errors" :hint="hint" />
      </slot>
    </template>
  </Combobox>
</template>

<script setup lang="ts">
import AppFieldHint from './AppFieldHint.vue';
import AppIcon from '@/components/AppIcon.vue';
import LoadingProgressBar from '@/components/LoadingProgressBar.vue';
import AppButtonIcon from '@/components/form/AppButtonIcon.vue';
import { formatConjonction, searchIn } from '@/helpers/text';
import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxLabel,
  ComboboxOption,
  ComboboxOptions,
} from '@headlessui/vue';
import { mdiCheck, mdiClose, mdiUnfoldLessHorizontal, mdiUnfoldMoreHorizontal } from '@mdi/js';
import { isArray, isNil } from 'lodash';
import { PropType, Ref, computed, ref } from 'vue';

const selectedOptions = defineModel('modelValue', {
  type: [String, Number, Object, Array] as PropType<any | any[] | null>,
  default: null,
});

const query = defineModel('query', {
  type: String as PropType<string | null>,
  default: '',
});

const props = defineProps({
  id: {
    type: String,
    default: null,
  },
  label: {
    type: String,
    default: null,
  },
  description: {
    type: String,
    default: '',
  },
  options: {
    type: Array as PropType<any[]>,
    default: () => [],
  },
  format: {
    type: Function as PropType<(option: any) => string>,
    default: (option: any) => (typeof option === 'string' ? option : JSON.stringify(option)),
  },
  filter: {
    type: Function as PropType<(query: string, option: any) => boolean>,
    default: null,
  },
  /**
   * How a custom value should be parsed and result in an option.
   */
  parseCustom: {
    type: Function as PropType<(query: string) => any>,
    default: null,
  },
  multiple: {
    type: Boolean,
    default: false,
  },
  name: {
    type: String,
    default: null,
  },
  placeholder: {
    type: String,
    default: null,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
  required: {
    type: Boolean,
    default: false,
  },
  optional: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  invalid: {
    type: Boolean,
    default: false,
  },
  errors: {
    type: Array as PropType<(string | Ref<string> | boolean | undefined | null)[]>,
    default: () => [],
  },
  hideDetails: {
    type: Boolean,
    default: false,
  },
  hint: {
    type: String,
    default: '',
  },
  tabindex: {
    type: String,
    default: null,
  },
  inputClass: {
    type: String,
    default: '',
  },
  nullable: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  as: {
    type: String as PropType<'input' | 'textarea'>,
    default: 'input',
  },
  rows: {
    // in case of textarea
    type: [String, Number],
    default: 3,
  },
});

const isInvalid = computed(
  () => props.invalid || (props.errors && props.errors.filter(Boolean).length > 0),
);

const filteredOptions = computed(() => {
  let options = props.options;

  if (query.value) {
    if (props.filter) {
      options = options.filter(props.filter);
    } else {
      options = options.filter((option) => searchIn(query.value, props.format(option)));
    }
  }

  if (props.parseCustom && query.value) {
    const custom = props.parseCustom(query.value);
    if (custom && !options.some((option) => custom === option)) options.push(custom);
  }

  return options;
});

/**
 * Until `immediate` props is available in the Combobox component
 * @see https://github.com/tailwindlabs/headlessui/discussions/1236#discussioncomment-8260316
 */
const buttonRef = ref();
const onInputClick = (isOpen: boolean) => {
  if (!isOpen && (props.as === 'input' || !selectedOptions.value)) buttonRef.value?.$el?.click();
};

const onClear = () => {
  selectedOptions.value = props.multiple ? [] : null;
};
</script>

<style scoped>
/* clears the 'X' from Internet Explorer */
input[type='search']::-ms-clear {
  display: none;
  width: 0;
  height: 0;
}
input[type='search']::-ms-reveal {
  display: none;
  width: 0;
  height: 0;
}
/* clears the 'X' from Chrome */
input[type='search']::-webkit-search-decoration,
input[type='search']::-webkit-search-cancel-button,
input[type='search']::-webkit-search-results-button,
input[type='search']::-webkit-search-results-decoration {
  display: none;
}
</style>
