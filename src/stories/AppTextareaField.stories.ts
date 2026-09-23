import AppTextareaField from '@/components/form/AppTextareaField.vue';
import type { Meta, StoryObj } from '@storybook/vue3-vite';

const meta: Meta<typeof AppTextareaField> = {
  title: 'Fields/AppTextareaField',
  component: AppTextareaField,
  tags: ['autodocs'],
  args: {
    placeholder: 'Écrivez votre message…',
    modelValue: '',
  },
  render: (args) => ({
    components: { AppTextareaField },
    setup: () => ({ args }),
    template: '<AppTextareaField class="max-w-sm" v-bind="args" />',
  }),
};
export default meta;

type Story = StoryObj<typeof AppTextareaField>;

export const Default: Story = {};

export const WithValue: Story = {
  args: {
    modelValue:
      "Merci de bien vouloir vérifier l'accès du membre avant la prochaine réunion d'équipe.",
  },
};

export const Disabled: Story = {
  args: { disabled: true, modelValue: 'Texte en lecture seule.' },
};
