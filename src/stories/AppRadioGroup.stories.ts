import AppRadioGroup from '@/components/form/AppRadioGroup.vue';
import type { Meta, StoryObj } from '@storybook/vue3-vite';

const OPTIONS = ['Oui', 'Non', 'Peut-être'];

const meta: Meta<typeof AppRadioGroup> = {
  title: 'Fields/AppRadioGroup',
  component: AppRadioGroup,
  tags: ['autodocs'],
  args: {
    label: 'Confirmez-vous votre présence ?',
    options: OPTIONS,
    modelValue: OPTIONS[0],
  },
  render: (args) => ({
    components: { AppRadioGroup },
    setup: () => ({ args }),
    template: '<AppRadioGroup class="max-w-sm" v-bind="args" />',
  }),
};
export default meta;

type Story = StoryObj<typeof AppRadioGroup>;

export const Default: Story = {};

export const Disabled: Story = {
  args: { disabled: true },
};

export const WithOther: Story = {
  args: { acceptOther: true, otherPlaceholder: 'Précisez…' },
};

export const Invalid: Story = {
  args: { modelValue: null, errors: ['Ce champ est requis'] },
};
