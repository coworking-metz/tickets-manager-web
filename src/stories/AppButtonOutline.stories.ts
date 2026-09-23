import AppButtonOutline from '@/components/form/AppButtonOutline.vue';
import type { Meta, StoryObj } from '@storybook/vue3-vite';

const COLORS = ['indigo', 'red', 'amber', 'gray'] as const;

const meta: Meta<typeof AppButtonOutline> = {
  title: 'Buttons/AppButtonOutline',
  component: AppButtonOutline,
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
    components: { AppButtonOutline },
    setup: () => ({ args }),
    template: '<AppButtonOutline v-bind="args">Confirmer</AppButtonOutline>',
  }),
};
export default meta;

type Story = StoryObj<typeof AppButtonOutline>;

export const Default: Story = {};

export const Loading: Story = {
  args: { loading: true },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const AllColors: Story = {
  render: () => ({
    components: { AppButtonOutline },
    setup: () => ({ colors: COLORS }),
    template: `
      <div class="flex flex-wrap gap-3">
        <AppButtonOutline v-for="color in colors" :key="color" :color="color">
          {{ color }}
        </AppButtonOutline>
      </div>
    `,
  }),
};
