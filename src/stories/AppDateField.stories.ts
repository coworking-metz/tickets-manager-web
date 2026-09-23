import AppDateField from '@/components/form/AppDateField.vue';
import type { Meta, StoryObj } from '@storybook/vue3-vite';

const meta: Meta<typeof AppDateField> = {
  title: 'Fields/AppDateField',
  component: AppDateField,
  tags: ['autodocs'],
  args: {
    label: 'Date de naissance',
    modelValue: null,
  },
  render: (args) => ({
    components: { AppDateField },
    setup: () => ({ args }),
    template: '<AppDateField class="max-w-sm" v-bind="args" />',
  }),
};
export default meta;

type Story = StoryObj<typeof AppDateField>;

export const Default: Story = {};

export const WithValue: Story = {
  args: { modelValue: new Date('2024-06-15') },
};

export const WithTime: Story = {
  args: { withTime: true, modelValue: new Date('2024-06-15T14:30:00') },
};

export const Range: Story = {
  args: { range: true },
};
