import AppNumericField from '@/components/form/AppNumericField.vue';
import type { Meta, StoryObj } from '@storybook/vue3-vite';

const meta: Meta<typeof AppNumericField> = {
  title: 'Fields/AppNumericField',
  component: AppNumericField,
  tags: ['autodocs'],
  args: {
    label: 'Quantité',
    modelValue: 42,
  },
  render: (args) => ({
    components: { AppNumericField },
    setup: () => ({ args }),
    template: '<AppNumericField class="max-w-sm" v-bind="args" />',
  }),
};
export default meta;

type Story = StoryObj<typeof AppNumericField>;

export const Default: Story = {};

export const Empty: Story = {
  args: { modelValue: null },
};

export const Disabled: Story = {
  args: { disabled: true },
};
