import AppSwitchField from '@/components/form/AppSwitchField.vue';
import type { Meta, StoryObj } from '@storybook/vue3-vite';

const meta: Meta<typeof AppSwitchField> = {
  title: 'Fields/AppSwitchField',
  component: AppSwitchField,
  tags: ['autodocs'],
  args: {
    label: 'Notifications par e-mail',
    description: 'Recevoir un e-mail à chaque nouvelle réservation',
    modelValue: false,
  },
  render: (args) => ({
    components: { AppSwitchField },
    setup: () => ({ args }),
    template: '<AppSwitchField class="max-w-sm" v-bind="args" />',
  }),
};
export default meta;

type Story = StoryObj<typeof AppSwitchField>;

export const Off: Story = {};

export const On: Story = {
  args: { modelValue: true },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const Loading: Story = {
  args: { loading: true },
};
