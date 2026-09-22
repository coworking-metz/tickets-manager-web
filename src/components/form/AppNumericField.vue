<template>
  <!-- Sometimes the browser's autocomplete can interfere with the component's behavior, especially when it comes to formatting and parsing the input value. Setting `autocomplete` to `off` or `_off` can help prevent this issue. However, some browsers (like Safari) may ignore `autocomplete="off"`
   https://issues.chromium.org/issues/40910184
   https://gist.github.com/niksumeiko/360164708c3b326bd1c8?permalink_comment_id=4154792 -->
  <AppTextField
    ref="textField"
    autocomplete="_off"
    input="numeric"
    :input-class="['text-right', props.inputClass].join(' ')"
    :model-value="autoNumericElement?.getFormatted()"
    v-bind="$attrs"
    @blur="emit('blur')"
    @change="onChange"
    @focus="emit('focus')"
    @keydown="emit('keydown')"
    @update:model-value="onUpdate">
    <template v-for="(_, slot) of $slots" #[slot]="scope">
      <slot :name="slot" v-bind="scope" />
    </template>
  </AppTextField>
</template>

<script setup lang="ts">
import AppTextField from './AppTextField.vue';
import Autonumeric from 'autonumeric';
import { isEqual, isNil } from 'lodash';
import { PropType, onMounted, ref, watch } from 'vue';

const emit = defineEmits(['update:model-value', 'change', 'blur', 'focus', 'keydown']);
const props = defineProps({
  modelValue: {
    type: [String, Number] as PropType<string | number | null>,
    validator(val) {
      return typeof val === 'number' || typeof val === 'string' || val === '' || val === null;
    },
    default: null,
  },
  options: {
    type: Object as PropType<Autonumeric.Options>,
    default: () =>
      ({
        allowDecimalPadding: 'floats',
        emptyInputBehavior: 'null',
        modifyValueOnWheel: false,
        decimalCharacter: ',',
        decimalCharacterAlternative: '.',
        digitGroupSeparator: ' ',
      }) as Autonumeric.Options,
  },
  /**
   * If set to `true`, whenever the `options` prop changes, the AutoNumeric settings are first reset to the AutoNumeric defaults options.
   * This is set to `true` by default so that it allows for users to pass predefined option names and be sure that no previous settings would be kept, resulting in an unusual result (ie. when switching from 'integer' to 'euro', the decimalPlaces would still be `0`).
   */
  resetOnOptions: {
    type: Boolean,
    default: false,
  },
  inputClass: {
    type: String,
    default: '',
  },
});

const textField = ref();
const autoNumericElement = ref<Autonumeric>();

// AutoNumeric state lives in the DOM: not reactive, so this cannot be a `computed`.
// `getNumber()` alone would not do either, it returns `0` on an empty input.
const currentValue = () =>
  autoNumericElement.value?.getFormatted() === '' ? null : autoNumericElement.value?.getNumber();

/**
 * Update the v-model value and make the parent aware of that change.
 */
const onRawValueModified = () => {
  emit('update:model-value', currentValue());
};

const onChange = () => {
  emit('change', currentValue());
};

const onUpdate = () => {
  emit('update:model-value', currentValue());
};

watch(
  [() => props.modelValue, () => props.options, () => autoNumericElement.value],
  ([newNumericValue, newOptions], [oldNumericValue, oldOptions]) => {
    if (autoNumericElement.value) {
      // 1) First, check if the options have changed, if that's the case, update those first
      // Compare the new and old options, and only update if they are different
      if (oldOptions && !isEqual(oldOptions, newOptions)) {
        // Find a better way (without external libraries) to compare the two options objects. Also, the comparison is moot when comparing 'euro' with the actual euro object.
        if (props.resetOnOptions) {
          // This is needed when using predefined options that do not override previously used options
          autoNumericElement.value.options.reset();
        }

        // @ts-expect-error: Autonumeric._getOptionObject is a private method, but we need to use it here to get the actual options object
        const options = Autonumeric._getOptionObject(newOptions);

        autoNumericElement.value.update(options);
      }

      // 2) Then check if the value has changed.
      const inputValue = currentValue();
      if (isNil(newNumericValue)) {
        if (!isNil(oldNumericValue) && !isNil(inputValue)) {
          autoNumericElement.value.clear();
        }
      } else if (
        // Make sure this is only called when the value is set by an external script, and not from a user input
        inputValue !== newNumericValue &&
        // Compare the 'newNumericValue' with the current 'oldNumericValue' so we do not `set` it again if it's not needed
        newNumericValue !== oldNumericValue
      ) {
        // The modification comes from a script, so we need to reformat the new value `newNumericValue`
        autoNumericElement.value.set(`${newNumericValue}`);
      }
    }
  },
  { immediate: true },
);

onMounted(() => {
  // Initialize the autoNumeric element
  const inputRef = textField.value.$el.querySelector('input');
  autoNumericElement.value = new Autonumeric(inputRef, props.options);
  autoNumericElement.value.set(`${props.modelValue ?? ''}`);

  autoNumericElement.value
    .node()
    .addEventListener('autoNumeric:rawValueModified', onRawValueModified);

  // The `v-model` must be updated with that default value on startup
  // FIXME Send the `event.timeStamp` info here
  if (!isNil(props.modelValue)) {
    onRawValueModified();
  }
});
</script>
