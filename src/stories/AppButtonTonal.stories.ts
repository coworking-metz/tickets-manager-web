import AppButtonTonal from '@/components/form/AppButtonTonal.vue';
import type { Meta, StoryObj } from '@storybook/vue3-vite';

const COLORS = ['indigo', 'red', 'amber', 'gray'] as const;

const meta: Meta<typeof AppButtonTonal> = {
  title: 'Buttons/AppButtonTonal',
  component: AppButtonTonal,
  tags: ['autodocs'],
  argTypes: {
    color: { control: 'select', options: COLORS },
  },
  args: {
    color: 'indigo',
    loading: false,
    disabled: false,
  },
  render: (args) => ({
    components: { AppButtonTonal },
    setup: () => ({ args }),
    template: '<AppButtonTonal v-bind="args">Confirmer</AppButtonTonal>',
  }),
};
export default meta;

type Story = StoryObj<typeof AppButtonTonal>;

export const Default: Story = {};

export const Loading: Story = {
  args: { loading: true },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const AllColors: Story = {
  render: () => ({
    components: { AppButtonTonal },
    setup: () => ({ colors: COLORS }),
    template: `
      <div class="flex flex-wrap gap-3">
        <AppButtonTonal v-for="color in colors" :key="color" :color="color">
          {{ color }}
        </AppButtonTonal>
      </div>
    `,
  }),
};
