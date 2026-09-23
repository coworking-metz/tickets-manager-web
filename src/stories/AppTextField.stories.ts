import AppTextField from '@/components/form/AppTextField.vue';
import { mdiEmail } from '@mdi/js';
import type { Meta, StoryObj } from '@storybook/vue3-vite';

const meta: Meta<typeof AppTextField> = {
  title: 'Fields/AppTextField',
  component: AppTextField,
  tags: ['autodocs'],
  args: {
    label: 'Adresse e-mail',
    placeholder: 'jane.doe@example.com',
    modelValue: '',
  },
  render: (args) => ({
    components: { AppTextField },
    setup: () => ({ args }),
    template: '<AppTextField class="max-w-sm" v-bind="args" />',
  }),
};
export default meta;

type Story = StoryObj<typeof AppTextField>;

export const Default: Story = {};

export const WithValue: Story = {
  args: { modelValue: 'jane.doe@example.com' },
};

export const WithIcon: Story = {
  args: { prependIcon: mdiEmail },
};

export const WithHint: Story = {
  args: { hint: 'Utilisée pour les notifications importantes' },
};

export const Invalid: Story = {
  args: {
    modelValue: 'not-an-email',
    errors: ["L'adresse e-mail n'est pas valide"],
  },
};

export const Disabled: Story = {
  args: { disabled: true, modelValue: 'jane.doe@example.com' },
};

export const Loading: Story = {
  args: { loading: true },
};

export const Clearable: Story = {
  args: { clearable: true, modelValue: 'jane.doe@example.com' },
};
