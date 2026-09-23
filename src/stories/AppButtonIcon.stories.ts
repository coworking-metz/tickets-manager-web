import AppButtonIcon from '@/components/form/AppButtonIcon.vue';
import { mdiClose, mdiPencil, mdiTrashCan } from '@mdi/js';
import type { Meta, StoryObj } from '@storybook/vue3-vite';

const meta: Meta<typeof AppButtonIcon> = {
  title: 'Buttons/AppButtonIcon',
  component: AppButtonIcon,
  tags: ['autodocs'],
  args: {
    icon: mdiPencil,
    loading: false,
  },
  render: (args) => ({
    components: { AppButtonIcon },
    setup: () => ({ args }),
    template: '<AppButtonIcon class="size-8" v-bind="args" />',
  }),
};
export default meta;

type Story = StoryObj<typeof AppButtonIcon>;

export const Default: Story = {};

export const Loading: Story = {
  args: { loading: true },
};

export const Examples: Story = {
  render: () => ({
    components: { AppButtonIcon },
    setup: () => ({ mdiPencil, mdiTrashCan, mdiClose }),
    template: `
      <div class="flex flex-wrap gap-3">
        <AppButtonIcon class="size-8" :icon="mdiPencil" title="Modifier" />
        <AppButtonIcon class="size-8" :icon="mdiTrashCan" title="Supprimer" />
        <AppButtonIcon class="size-8" :icon="mdiClose" title="Fermer" />
      </div>
    `,
  }),
};
