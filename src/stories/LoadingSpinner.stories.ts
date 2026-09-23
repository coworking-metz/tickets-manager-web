import LoadingSpinner from '@/components/LoadingSpinner.vue';
import type { Meta, StoryObj } from '@storybook/vue3-vite';

const meta: Meta<typeof LoadingSpinner> = {
  title: 'Components/LoadingSpinner',
  component: LoadingSpinner,
  tags: ['autodocs'],
  render: () => ({
    components: { LoadingSpinner },
    template: '<LoadingSpinner class="size-8" />',
  }),
};
export default meta;

type Story = StoryObj<typeof LoadingSpinner>;

export const Default: Story = {};
