<template>
  <AppTextField id="body" :errors="errors" :label="label" :required="required">
    <template #default="{ isInvalid }">
      <div
        :class="[
          `w-full rounded-md border border-gray-300 bg-white shadow-sm transition-colors
          focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500
          dark:border-stone-700 dark:bg-zinc-900`,
          isInvalid &&
            `border-red-500 text-red-900 focus-within:border-red-500 focus-within:ring-red-500
            dark:border-red-500/50 dark:text-red-300 dark:focus-within:border-red-600 dark:focus-within:ring-red-600`,
        ]">
        <div class="flex flex-wrap gap-1 border-b border-gray-200 p-2 dark:border-stone-700">
          <button
            :class="toolbarButtonClass(false)"
            type="button"
            @click="editor?.chain().focus().undo().run()">
            {{ toolbarLabels.undo }}
          </button>
          <button
            :class="toolbarButtonClass(false)"
            type="button"
            @click="editor?.chain().focus().redo().run()">
            {{ toolbarLabels.redo }}
          </button>

          <button
            :class="toolbarButtonClass(editor?.isActive('paragraph'))"
            type="button"
            @click="editor?.chain().focus().setParagraph().run()">
            {{ toolbarLabels.paragraph }}
          </button>
          <button
            :class="toolbarButtonClass(editor?.isActive('heading', { level: 1 }))"
            type="button"
            @click="editor?.chain().focus().toggleHeading({ level: 1 }).run()">
            {{ headingLevel1Label }}
          </button>
          <button
            :class="toolbarButtonClass(editor?.isActive('bold'))"
            type="button"
            @click="editor?.chain().focus().toggleBold().run()">
            {{ toolbarLabels.bold }}
          </button>
          <button
            :class="toolbarButtonClass(editor?.isActive('italic'))"
            type="button"
            @click="editor?.chain().focus().toggleItalic().run()">
            {{ toolbarLabels.italic }}
          </button>
          <button
            :class="toolbarButtonClass(editor?.isActive('underline'))"
            type="button"
            @click="editor?.chain().focus().toggleUnderline().run()">
            {{ toolbarLabels.underline }}
          </button>
          <button
            :class="toolbarButtonClass(editor?.isActive('strike'))"
            type="button"
            @click="editor?.chain().focus().toggleStrike().run()">
            {{ toolbarLabels.strike }}
          </button>
          <button
            :class="toolbarButtonClass(editor?.isActive('highlight'))"
            type="button"
            @click="editor?.chain().focus().toggleHighlight().run()">
            {{ toolbarLabels.highlight }}
          </button>
          <button
            :class="toolbarButtonClass(editor?.isActive('subscript'))"
            type="button"
            @click="editor?.chain().focus().toggleSubscript().run()">
            {{ toolbarLabels.subscript }}
          </button>
          <button
            :class="toolbarButtonClass(editor?.isActive('superscript'))"
            type="button"
            @click="editor?.chain().focus().toggleSuperscript().run()">
            {{ toolbarLabels.superscript }}
          </button>

          <button
            :class="toolbarButtonClass(editor?.isActive('heading', { level: 2 }))"
            type="button"
            @click="editor?.chain().focus().toggleHeading({ level: 2 }).run()">
            {{ headingLevel2Label }}
          </button>
          <button
            :class="toolbarButtonClass(editor?.isActive('heading', { level: 3 }))"
            type="button"
            @click="editor?.chain().focus().toggleHeading({ level: 3 }).run()">
            {{ headingLevel3Label }}
          </button>

          <button
            :class="toolbarButtonClass(editor?.isActive('blockquote'))"
            type="button"
            @click="editor?.chain().focus().toggleBlockquote().run()">
            {{ toolbarLabels.blockquote }}
          </button>
          <button
            :class="toolbarButtonClass(editor?.isActive('code'))"
            type="button"
            @click="editor?.chain().focus().toggleCode().run()">
            {{ toolbarLabels.code }}
          </button>
          <button
            :class="toolbarButtonClass(editor?.isActive('codeBlock'))"
            type="button"
            @click="editor?.chain().focus().toggleCodeBlock().run()">
            {{ toolbarLabels.codeBlock }}
          </button>

          <button
            :class="toolbarButtonClass(editor?.isActive('bulletList'))"
            type="button"
            @click="editor?.chain().focus().toggleBulletList().run()">
            {{ toolbarLabels.bulletedList }}
          </button>
          <button
            :class="toolbarButtonClass(editor?.isActive('orderedList'))"
            type="button"
            @click="editor?.chain().focus().toggleOrderedList().run()">
            {{ toolbarLabels.numberedList }}
          </button>
          <button
            :class="toolbarButtonClass(editor?.isActive('taskList'))"
            type="button"
            @click="editor?.chain().focus().toggleTaskList().run()">
            {{ toolbarLabels.taskList }}
          </button>

          <button
            :class="toolbarButtonClass(editor?.isActive({ textAlign: 'left' }))"
            type="button"
            @click="editor?.chain().focus().setTextAlign('left').run()">
            {{ toolbarLabels.alignLeft }}
          </button>
          <button
            :class="toolbarButtonClass(editor?.isActive({ textAlign: 'center' }))"
            type="button"
            @click="editor?.chain().focus().setTextAlign('center').run()">
            {{ toolbarLabels.alignCenter }}
          </button>
          <button
            :class="toolbarButtonClass(editor?.isActive({ textAlign: 'right' }))"
            type="button"
            @click="editor?.chain().focus().setTextAlign('right').run()">
            {{ toolbarLabels.alignRight }}
          </button>
          <button
            :class="toolbarButtonClass(editor?.isActive({ textAlign: 'justify' }))"
            type="button"
            @click="editor?.chain().focus().setTextAlign('justify').run()">
            {{ toolbarLabels.alignJustify }}
          </button>

          <button :class="toolbarButtonClass(false)" type="button" @click="insertOrEditLink">
            {{ toolbarLabels.link }}
          </button>
          <button
            :class="toolbarButtonClass(editor?.isActive('link'))"
            type="button"
            @click="editor?.chain().focus().unsetLink().run()">
            {{ toolbarLabels.unlink }}
          </button>
          <button :class="toolbarButtonClass(false)" type="button" @click="insertImage">
            {{ toolbarLabels.image }}
          </button>

          <button
            :class="toolbarButtonClass(false)"
            type="button"
            @click="editor?.chain().focus().setHorizontalRule().run()">
            {{ toolbarLabels.horizontalRule }}
          </button>
          <button
            :class="toolbarButtonClass(false)"
            type="button"
            @click="editor?.chain().focus().unsetAllMarks().clearNodes().run()">
            {{ toolbarLabels.clearFormatting }}
          </button>
        </div>

        <EditorContent class="min-h-56" :editor="editor" />
      </div>
    </template>
  </AppTextField>
</template>

<script lang="ts" setup>
import AppTextField from './AppTextField.vue';
import Highlight from '@tiptap/extension-highlight';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import TaskItem from '@tiptap/extension-task-item';
import TaskList from '@tiptap/extension-task-list';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { Markdown } from '@tiptap/markdown';
import StarterKit from '@tiptap/starter-kit';
import { EditorContent, useEditor } from '@tiptap/vue-3';
import { onBeforeUnmount, watch } from 'vue';

const markdown = defineModel<string | null>({
  default: null,
});

defineProps({
  label: {
    type: String,
    default: null,
  },
  required: {
    type: Boolean,
    default: false,
  },
  errors: {
    type: Array as () => string[],
    default: () => [],
  },
});

const toolbarLabels = {
  undo: 'Undo',
  redo: 'Redo',
  paragraph: 'P',
  bold: 'Bold',
  italic: 'Italic',
  underline: 'Underline',
  strike: 'Strike',
  highlight: 'Highlight',
  subscript: 'Sub',
  superscript: 'Sup',
  blockquote: 'Quote',
  code: 'Code',
  codeBlock: 'Code block',
  bulletedList: 'List',
  numberedList: 'Numbered',
  taskList: 'Task',
  alignLeft: 'Left',
  alignCenter: 'Center',
  alignRight: 'Right',
  alignJustify: 'Justify',
  link: 'Link',
  unlink: 'Unlink',
  image: 'Image',
  horizontalRule: 'Rule',
  clearFormatting: 'Clear',
};
const headingLevel1Label = 'H1';
const headingLevel2Label = 'H2';
const headingLevel3Label = 'H3';

const editor = useEditor({
  content: markdown.value ?? '',
  contentType: 'markdown',
  extensions: [
    Markdown,
    StarterKit,
    Underline,
    Link.configure({
      openOnClick: false,
      autolink: true,
      defaultProtocol: 'https',
    }),
    Image,
    TaskList,
    TaskItem.configure({ nested: true }),
    TextAlign.configure({
      types: ['heading', 'paragraph'],
      alignments: ['left', 'center', 'right', 'justify'],
      defaultAlignment: 'left',
    }),
    Subscript,
    Superscript,
    Highlight,
  ],
  editorProps: {
    attributes: {
      class:
        'min-h-56 p-3 text-sm text-gray-900 focus:outline-none dark:text-gray-100 sm:text-sm prose prose-sm max-w-none dark:prose-invert',
    },
  },
  onUpdate: () => {
    if (!editor.value) {
      return;
    }

    markdown.value = editor.value.getMarkdown();
  },
});

const insertOrEditLink = () => {
  if (!editor.value) {
    return;
  }

  const current = editor.value.getAttributes('link').href as string | undefined;
  const url = window.prompt('URL du lien', current ?? 'https://');

  if (!url) {
    return;
  }

  editor.value.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
};

const insertImage = () => {
  if (!editor.value) {
    return;
  }

  const src = window.prompt("URL de l'image", 'https://');

  if (!src) {
    return;
  }

  const alt = window.prompt('Texte alternatif', '');
  editor.value
    .chain()
    .focus()
    .setImage({ src, alt: alt ?? '' })
    .run();
};

const toolbarButtonClass = (isActive = false) => {
  return [
    'rounded px-2 py-1 text-xs font-medium transition-colors sm:text-sm',
    isActive
      ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300'
      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-neutral-800 dark:text-gray-200 dark:hover:bg-neutral-700',
  ];
};

watch(
  () => markdown.value,
  (freshBody) => {
    if (!editor.value) {
      return;
    }

    const currentMarkdown = editor.value.getMarkdown();
    if ((freshBody ?? '') !== currentMarkdown) {
      editor.value.commands.setContent(freshBody ?? '', { contentType: 'markdown' });
    }
  },
);

onBeforeUnmount(() => {
  editor.value?.destroy();
});
</script>

<style scoped>
:deep(.ProseMirror) {
  min-height: 14rem;
  white-space: pre-wrap;
}

:deep(.ProseMirror img) {
  display: block;
  height: auto;
  max-width: 100%;
}
</style>
