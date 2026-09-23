import AppSelectField from '@/components/form/AppSelectField.vue';
import type { Meta, StoryObj } from '@storybook/vue3-vite';

const FRUITS = ['Pomme', 'Banane', 'Cerise', 'Datte', 'Fraise'];

const meta: Meta<typeof AppSelectField> = {
  title: 'Fields/AppSelectField',
  component: AppSelectField,
  tags: ['autodocs'],
  args: {
    label: 'Fruit préféré',
    options: FRUITS,
    modelValue: null,
  },
  render: (args) => ({
    components: { AppSelectField },
    setup: () => ({ args }),
    template: '<AppSelectField class="max-w-sm" v-bind="args" />',
  }),
};
export default meta;

type Story = StoryObj<typeof AppSelectField>;

export const Default: Story = {};

export const WithValue: Story = {
  args: { modelValue: 'Banane' },
};

export const Multiple: Story = {
  args: { multiple: true, modelValue: ['Banane', 'Cerise'] },
};

export const Disabled: Story = {
  args: { disabled: true, modelValue: 'Banane' },
};

export const Invalid: Story = {
  args: { invalid: true, errors: ['Ce champ est requis'] },
};
