import AppToggleField from '@/components/form/AppToggleField.vue';
import type { Meta, StoryObj } from '@storybook/vue3-vite';

const OPTIONS = ['Mensuel', 'Annuel'];

const meta: Meta<typeof AppToggleField> = {
  title: 'Fields/AppToggleField',
  component: AppToggleField,
  tags: ['autodocs'],
  args: {
    label: 'Type de forfait',
    options: OPTIONS,
    modelValue: OPTIONS[0],
  },
  render: (args) => ({
    components: { AppToggleField },
    setup: () => ({ args }),
    template: '<AppToggleField class="max-w-sm" v-bind="args" />',
  }),
};
export default meta;

type Story = StoryObj<typeof AppToggleField>;

export const Default: Story = {};

export const Disabled: Story = {
  args: { disabled: true },
};

export const Invalid: Story = {
  args: { errors: ['Veuillez choisir une option'] },
};
