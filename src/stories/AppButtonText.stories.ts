import AppButtonText from '@/components/form/AppButtonText.vue';
import type { Meta, StoryObj } from '@storybook/vue3-vite';

const COLORS = ['indigo', 'amber', 'gray', 'none'] as const;

const meta: Meta<typeof AppButtonText> = {
  title: 'Buttons/AppButtonText',
  component: AppButtonText,
  tags: ['autodocs'],
  argTypes: {
    color: { control: 'select', options: COLORS },
  },
  args: {
    color: 'indigo',
  },
  render: (args) => ({
    components: { AppButtonText },
    setup: () => ({ args }),
    template: '<AppButtonText v-bind="args">Confirmer</AppButtonText>',
  }),
};
export default meta;

type Story = StoryObj<typeof AppButtonText>;

export const Default: Story = {};

export const AllColors: Story = {
  render: () => ({
    components: { AppButtonText },
    setup: () => ({ colors: COLORS }),
    template: `
      <div class="flex flex-wrap gap-3">
        <AppButtonText v-for="color in colors" :key="color" :color="color">
          {{ color }}
        </AppButtonText>
      </div>
    `,
  }),
};
