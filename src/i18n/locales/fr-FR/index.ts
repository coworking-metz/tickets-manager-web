import { mergeJSONFiles } from '@/helpers/merge-json-files';

// dynamically import json and subdirectories
const jsonFiles = import.meta.glob('./*.json', { eager: true, import: 'default' });
const directories = import.meta.glob('./*/index.ts', { eager: true });

export default mergeJSONFiles(jsonFiles, directories);
