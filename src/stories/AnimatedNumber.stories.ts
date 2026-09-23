import AnimatedNumber from '@/components/AnimatedNumber.vue';
import type { Meta, StoryObj } from '@storybook/vue3-vite';

const meta: Meta<typeof AnimatedNumber> = {
  title: 'Components/AnimatedNumber',
  component: AnimatedNumber,
  tags: ['autodocs'],
  args: {
    from: 0,
    to: 1234,
    duration: 1,
  },
};
export default meta;

type Story = StoryObj<typeof AnimatedNumber>;

export const Default: Story = {};
