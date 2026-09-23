import AppSegmentedControl from '@/components/form/AppSegmentedControl.vue';
import type { Meta, StoryObj } from '@storybook/vue3-vite';

const OPTIONS = ['Jour', 'Semaine', 'Mois'];

const meta: Meta<typeof AppSegmentedControl> = {
  title: 'Fields/AppSegmentedControl',
  component: AppSegmentedControl,
  tags: ['autodocs'],
  args: {
    label: 'Période',
    options: OPTIONS,
  },
  render: (args) => ({
    components: { AppSegmentedControl },
    setup: () => ({ args }),
    template: '<AppSegmentedControl class="max-w-sm" v-bind="args" />',
  }),
};
export default meta;

type Story = StoryObj<typeof AppSegmentedControl>;

export const Default: Story = {};

export const Disabled: Story = {
  args: { disabled: true },
};
