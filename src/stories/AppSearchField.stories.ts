import AppSearchField from '@/components/form/AppSearchField.vue';
import type { Meta, StoryObj } from '@storybook/vue3-vite';

const meta: Meta<typeof AppSearchField> = {
  title: 'Fields/AppSearchField',
  component: AppSearchField,
  tags: ['autodocs'],
  args: {
    placeholder: 'Rechercher un membre…',
    modelValue: '',
  },
  render: (args) => ({
    components: { AppSearchField },
    setup: () => ({ args }),
    template: '<AppSearchField class="max-w-sm" v-bind="args" />',
  }),
};
export default meta;

type Story = StoryObj<typeof AppSearchField>;

export const Default: Story = {};

export const WithValue: Story = {
  args: { modelValue: 'Jane' },
};

export const Loading: Story = {
  args: { loading: true, modelValue: 'Jane' },
};
