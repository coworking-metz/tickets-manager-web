<!-- eslint-disable tailwindcss/no-custom-classname -->
<template>
  <RadioGroup
    :id="id"
    v-model="selectedOption"
    :aria-invalid="isInvalid"
    as="ul"
    class="flex flex-col"
    :name="name"
    v-bind="$attrs">
    <RadioGroupLabel class="font-medium text-gray-900 sm:text-sm dark:text-gray-100" :for="id">
      {{ label }}
    </RadioGroupLabel>
    <RadioGroupDescription class="text-sm text-slate-500 dark:text-slate-400">
      {{ description }}
    </RadioGroupDescription>
    <ul class="mt-1 flex flex-row bg-white dark:bg-neutral-800">
      <RadioGroupOption
        v-for="(option, index) in options"
        :key="`toggle-option-${option}`"
        as="li"
        class="min-w-16 shrink grow basis-0"
        :disabled="disabled"
        :value="option"
        v-slot="{ active, checked, disabled: optionDisabled }">
        <div
          :class="[
            'flex h-full cursor-pointer flex-row items-center justify-center border-y border-l border-gray-300 p-3 text-center font-medium transition-colors focus:outline-none disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-500 sm:text-sm dark:border-neutral-600',
            active && 'z-10 ring-2 ring-offset-0',
            active && (isInvalid ? 'ring-red-500 dark:focus:ring-red-600' : 'ring-indigo-500'),
            index === 0 && 'rounded-l-lg',
            index === options.length - 1 && !hasOther && 'rounded-r-lg border-r',
            checked
              ? 'bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600'
              : 'bg-neutral-100 text-gray-900 hover:bg-neutral-200 active:bg-neutral-300 dark:bg-neutral-700/40 dark:text-gray-100 dark:hover:bg-neutral-700/80 dark:active:bg-neutral-700',
            isInvalid &&
              'border-red-500 text-red-900 placeholder:text-red-300 focus:border-red-500 dark:border-red-500/50 dark:text-red-300 dark:placeholder:text-red-300/50 dark:focus:border-red-600',
          ]"
          :disabled="optionDisabled"
          role="option">
          <!-- trick to let autofill from browser work -->
          <input
            v-if="
              !hasOther &&
              name &&
              !disabled &&
              ((isValueEmpty && index === 0) || selectedOption === option)
            "
            class="autofill-input"
            :inputmode="otherInputmode"
            :name="name"
            tabindex="-1"
            type="radio"
            :value="selectedOption"
            @input="onFill" />
          <slot
            :active="active"
            :checked="checked"
            :disabled="optionDisabled"
            name="option"
            :option="option">
            {{ format(option) }}
          </slot>
        </div>
      </RadioGroupOption>
      <RadioGroupOption
        v-if="hasOther"
        as="li"
        class="min-w-16 shrink grow basis-0"
        :disabled="disabled"
        tabindex="-1"
        :value="state.inputText"
        @click="
          () => (!isNil(state.inputText) && state.inputText !== '' ? onChange(state.inputText) : '')
        "
        v-slot="{ active, checked, disabled: optionDisabled }">
        <div
          :class="[
            'flex h-full cursor-pointer flex-row items-center justify-center rounded-r-lg border border-gray-300 text-center font-medium transition-colors focus:outline-none disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-500 dark:border-neutral-600',
            active && 'z-10 ring-2 ring-offset-0',
            active && (isInvalid ? 'ring-red-500 dark:focus:ring-red-600' : 'ring-indigo-500'),
            checked
              ? 'bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600'
              : 'bg-white text-gray-900 hover:bg-gray-50  dark:bg-neutral-700/40 dark:text-gray-100 dark:hover:bg-neutral-700/80 dark:active:bg-neutral-700',
            isInvalid &&
              'border-red-500 text-red-900 placeholder:text-red-300 focus:border-red-500 dark:border-red-500/50 dark:text-red-300 dark:placeholder:text-red-300/50 dark:focus:border-red-600',
          ]"
          :disabled="optionDisabled"
          role="option">
          <slot name="other-input">
            <!-- <v-select
            v-if="others.length"
            v-model="state.inputText"
            color="inherit"
            :disabled="$attrs.disabled"
            flat
            hide-details
            hide-no-data
            :item-text="
              // @ts-expect-error
              ({ item }) => (itemText ? itemText(item) : item)
            "
            :item-value="
              // @ts-expect-error
              ({ item }) => item
            "
            :items="
              others.map((item) => ({
                item,
              }))
            "
            :menu-props="{ closeOnContentClick: true }"
            :name="$attrs.name"
            :placeholder="placeholder"
            shaped
            single-line
            solo
            tabindex="0"
            @blur="
              () => {
                state.isInputFocus = false;
                emit('blur');
              }
            "
            @focus="state.isInputFocus = true" /> -->
            <input
              v-model="state.inputText"
              :autocomplete="name"
              class="m-auto size-full border-none border-transparent bg-transparent p-0 text-center focus:border-transparent focus:ring-0 sm:text-sm"
              :disabled="!!disabled"
              :inputmode="otherInputmode"
              :name="name"
              :placeholder="otherPlaceholder"
              size="1"
              :type="otherType"
              @blur="
                () => {
                  state.isInputFocus = false;
                  emit('blur');
                }
              "
              @click="onInputClick"
              @focus="state.isInputFocus = true" />
          </slot>
        </div>
      </RadioGroupOption>
    </ul>
    <slot name="hint">
      <AppFieldHint v-if="!hideDetails" :errors="errors" :hint="hint" />
    </slot>
  </RadioGroup>
</template>

<script lang="ts" setup>
import AppFieldHint, { ErrorMessage } from './AppFieldHint.vue';
import {
  RadioGroup,
  RadioGroupDescription,
  RadioGroupLabel,
  RadioGroupOption,
} from '@headlessui/vue';
import { compact, includes, isNil } from 'lodash';
import { computed, PropType, reactive, watch } from 'vue';

const selectedOption = defineModel({
  type: [String, Number, Boolean, Object, Array] as PropType<any>,
  default: null,
});

const props = defineProps({
  options: {
    type: Array as PropType<any>,
    required: true,
  },
  label: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    default: '',
  },
  id: {
    type: String,
    default: null,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  format: {
    type: Function as PropType<(value: any) => string>,
    default: (value: any) => JSON.stringify(value),
  },
  hideDetails: {
    type: Boolean,
    default: false,
  },
  hint: {
    type: String,
    default: '',
  },
  errors: {
    type: Array as PropType<ErrorMessage[]>,
    default: () => [],
  },
  name: {
    type: String,
    default: '',
  },
  /**
   * Will allow any other value, not just those in options
   */
  acceptOther: {
    type: Boolean,
    default: false,
  },
  /**
   * List of other options that are available
   * through an additionnal click
   */
  others: {
    type: Array as PropType<unknown[]>,
    default: () => [],
  },
  otherPlaceholder: {
    type: String,
    default: '',
  },
  otherType: {
    type: String,
    default: 'text',
  },
  otherInputmode: {
    type: String as PropType<'text' | 'numeric' | 'decimal' | 'tel' | 'search' | 'email' | 'url'>,
    default: 'text',
  },
});

const isInvalid = computed(() => Boolean(compact(props.errors).length));
const hasOther = computed(() => props.acceptOther || props.others.length > 0);

const emit = defineEmits(['input', 'change', 'blur']);

const state = reactive({
  inputText: '' as string,
  isInputFocus: false as boolean,
});

const isValueEmpty = computed(() => {
  return isNil(selectedOption.value) || selectedOption.value === '';
});

const onChange = (newValue: unknown) => {
  emit('input', newValue);
  emit('change', newValue);
};

const parseFillInput = (input: string) => {
  const trimInput = input.trim().replace('"', '');
  if (['true', 'on', 'yes'].includes(trimInput)) {
    return true;
  }
  if (['false', 'off', 'no'].includes(trimInput)) {
    return false;
  }

  return input;
};

const onFill = (event: Event) => {
  const input = (event.target as HTMLInputElement).value;
  if (props.acceptOther && input !== '') {
    state.inputText = input;
  } else {
    const options = [...props.options, ...props.others];
    const selectedOption = options.find((item) => `${item}` === `${parseFillInput(input)}`);

    if (!isNil(selectedOption)) {
      onChange(selectedOption);
    }
  }
};

const onInputClick = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.value) {
    input.select();
  }
};

watch(
  () => state.inputText,
  (newInputText, oldInputText) => {
    if (newInputText !== oldInputText) {
      onChange(newInputText || null);
    }
  },
);

watch(
  [selectedOption, () => props.options],
  ([newSelectedOption, newOptions]) => {
    if (!isNil(newSelectedOption)) {
      if (!includes(newOptions, newSelectedOption)) {
        state.inputText = newSelectedOption as string;
      }
    } else {
      state.inputText = '';
    }
  },
  { immediate: true },
);
</script>

<style scoped>
.autofill-input {
  -webkit-appearance: none;
  appearance: none;

  /* it should not appear on screen but we never know */
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  opacity: 0.1;
  max-height: initial;
  z-index: 1;
  border-radius: inherit;
  overflow: hidden;
  outline: none;
  cursor: pointer;
}
</style>
