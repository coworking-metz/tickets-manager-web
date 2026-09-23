import AppAmountField from '@/components/form/AppAmountField.vue';
import type { Meta, StoryObj } from '@storybook/vue3-vite';

const meta: Meta<typeof AppAmountField> = {
  title: 'Fields/AppAmountField',
  component: AppAmountField,
  tags: ['autodocs'],
  args: {
    label: 'Montant',
    modelValue: 25.5,
  },
  render: (args) => ({
    components: { AppAmountField },
    setup: () => ({ args }),
    template: '<AppAmountField class="max-w-sm" v-bind="args" />',
  }),
};
export default meta;

type Story = StoryObj<typeof AppAmountField>;

export const Default: Story = {};

export const Empty: Story = {
  args: { modelValue: null },
};

export const Required: Story = {
  args: { required: true, modelValue: null },
};
