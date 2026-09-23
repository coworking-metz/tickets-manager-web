import AppButtonPlain from '@/components/form/AppButtonPlain.vue';
import type { Meta, StoryObj } from '@storybook/vue3-vite';

const COLORS = ['indigo', 'red', 'amber', 'gray', 'emerald', 'blue', 'neutral'] as const;

const meta: Meta<typeof AppButtonPlain> = {
  title: 'Buttons/AppButtonPlain',
  component: AppButtonPlain,
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
    components: { AppButtonPlain },
    setup: () => ({ args }),
    template: '<AppButtonPlain v-bind="args">Confirmer</AppButtonPlain>',
  }),
};
export default meta;

type Story = StoryObj<typeof AppButtonPlain>;

export const Default: Story = {};

export const Loading: Story = {
  args: { loading: true },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const AllColors: Story = {
  render: () => ({
    components: { AppButtonPlain },
    setup: () => ({ colors: COLORS }),
    template: `
      <div class="flex flex-wrap gap-3">
        <AppButtonPlain v-for="color in colors" :key="color" :color="color">
          {{ color }}
        </AppButtonPlain>
      </div>
    `,
  }),
};
