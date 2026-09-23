import AppButton from '@/components/form/AppButton.vue';
import { mdiCheck } from '@mdi/js';
import type { Meta, StoryObj } from '@storybook/vue3-vite';

const meta: Meta<typeof AppButton> = {
  title: 'Buttons/AppButton',
  component: AppButton,
  tags: ['autodocs'],
  args: {
    loading: false,
    disabled: false,
    icon: null,
  },
  render: (args) => ({
    components: { AppButton },
    setup: () => ({ args }),
    template: '<AppButton v-bind="args">Confirmer</AppButton>',
  }),
};
export default meta;

type Story = StoryObj<typeof AppButton>;

export const Default: Story = {};

export const WithIcon: Story = {
  args: { icon: mdiCheck },
};

export const Loading: Story = {
  args: { loading: true },
};

export const Disabled: Story = {
  args: { disabled: true },
};
