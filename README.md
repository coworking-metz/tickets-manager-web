# Tickets Manager Web

Manage members, services and collect stats from [Le Poulailler - Coworking Metz](https://www.coworking-metz.fr).

## Getting Started

These instructions will give you a copy of the project up and running on
your local machine for development and testing purposes.

### Prerequisites

Requirements for the software and other tools to build, test and push

- [Git](https://git-scm.com/) - Version control system
- [Node](https://nodejs.org/en) - Cross-platform JavaScript runtime environment

### Install

A step by step series of examples that tell you how to get a development environment running:

```bash
git clone git@github.com:coworking-metz/tickets-manager-web.git
cd tickets-manager-web
yarn
```

### Start the project

```bash
yarn dev
```

### Build locally

```bash
yarn build
yarn serve
```

Then go to http://localhost:9090

## Deploy

Everything is done through [GitHub actions](https://github.com/coworking-metz/tickets-manager-web/actions).

## Troubleshoot

### echarts

```bash
[vite]: Rollup failed to resolve import "echarts/core"
```
If you are having problem during build, use [`patch-package`](https://github.com/ds300/patch-package) to patch the necessary lines ([source](https://github.com/ecomfe/vue-echarts/issues/627)) :

- Change the following files accordingly

`/node_modules/vue-echarts/dist/index.esm.js`
```diff
@@ -1,5 +1,5 @@
 import { watch, unref, inject, computed, watchEffect, Vue2, defineComponent, shallowRef, toRefs, getCurrentInstance, onMounted, onBeforeUnmount, h, nextTick } from 'vue-demi';
-import { throttle, init } from 'echarts/core';
+import { throttle, init } from 'echarts/core.js';
```

`/node_modules/vue-echarts/package.json`
```diff
@@ -1,6 +1,14 @@
 {
   "name": "vue-echarts",
   "version": "6.6.8",
+  "type": "module",
+  "exports": {
+    ".": {
+      "require": "./dist/index.cjs.js",
+      "import": "./dist/index.esm.js",
+      "types": "./dist/index.d.ts"
+    }
+  },
```

- Then run
```bash
npx patch-package vue-echarts --exclude 'nothing' --use-yarn
```

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

- [README-Template](https://github.com/PurpleBooth/a-good-readme-template) for what you're reading

