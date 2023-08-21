/*
Copyright 2023 Bonitasoft S.A.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import { parse, resolve } from 'node:path';
import { defineConfig } from 'vite';


import { readdirSync, readFileSync as fsReadFileSync } from 'node:fs';
import { join } from 'node:path';

// =====================================================================================================================
// Taken from bpmn-visualization test/shared/file-helper.ts
/** Returns the files in the given directory. The function doesn't do any recursion in subdirectories. */
function findFiles(relPathToSourceDirectory: string): string[] {
  return readdirSync(join(__dirname, relPathToSourceDirectory));
}
// =====================================================================================================================

function generateInput() {
  const pages = findFiles('pages');
  const input: {[p: string]: string} = {
    index: resolve(__dirname, 'index.html'),
  };
  for (const page of pages) {
    input[parse(page).name] = resolve(__dirname, `pages/${page}`);
  }
  return input;
}

export default defineConfig(() => {
  return {
    build: {
      rollupOptions: {
        input: generateInput(),
        output: {
          manualChunks: {
            // put mxgraph code in a dedicated file.
            mxgraph: ['mxgraph'],
          },
        },
      },
      chunkSizeWarningLimit: 838, // mxgraph
    },
  };
});