import AppIcon from '@/components/AppIcon.vue';
import { mdiAccount, mdiAlertCircle, mdiHome } from '@mdi/js';
import type { Meta, StoryObj } from '@storybook/vue3-vite';

const meta: Meta<typeof AppIcon> = {
  title: 'Components/AppIcon',
  component: AppIcon,
  tags: ['autodocs'],
  render: (args) => ({
    components: { AppIcon },
    setup: () => ({ args }),
    template: '<AppIcon class="size-8" v-bind="args" />',
  }),
};
export default meta;

type Story = StoryObj<typeof AppIcon>;

export const Home: Story = {
  args: { icon: mdiHome },
};

export const Account: Story = {
  args: { icon: mdiAccount },
};

export const Alert: Story = {
  args: { icon: mdiAlertCircle },
};
