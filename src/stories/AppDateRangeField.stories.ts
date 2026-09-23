import AppDateRangeField from '@/components/form/AppDateRangeField.vue';
import type { Meta, StoryObj } from '@storybook/vue3-vite';

const meta: Meta<typeof AppDateRangeField> = {
  title: 'Fields/AppDateRangeField',
  component: AppDateRangeField,
  tags: ['autodocs'],
  args: {
    label: 'Période',
    modelValue: { start: '', end: '' },
  },
  render: (args) => ({
    components: { AppDateRangeField },
    setup: () => ({ args }),
    template: '<AppDateRangeField class="max-w-sm" v-bind="args" />',
  }),
};
export default meta;

type Story = StoryObj<typeof AppDateRangeField>;

export const Default: Story = {};

export const WithValue: Story = {
  args: { modelValue: { start: '2024-06-01', end: '2024-06-30' } },
};

export const Clearable: Story = {
  args: { clearable: true, modelValue: { start: '2024-06-01', end: '2024-06-30' } },
};

export const Disabled: Story = {
  args: { disabled: true, modelValue: { start: '2024-06-01', end: '2024-06-30' } },
};
