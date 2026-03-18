---
description: "前端插件集成流程：安装、配置、使用第三方插件"
triggers:
  - "插件集成"
  - "第三方库"
  - "插件配置"
  - "组件库"
---

# 插件集成流程

## 概述

EMSS Web 使用 Vite 构建工具，支持多种类型的插件集成。

---

## 插件类型

| 类型 | 安装方式 | 配置位置 | 示例 |
|------|----------|----------|------|
| Vite 插件 | `npm install` | `vite.config.ts` | `@vitejs/plugin-vue` |
| Vue 插件 | `npm install` | `main.ts` | `VueRouter`, `Pinia` |
| UI 组件库 | `npm install` | `main.ts` | `Element Plus` |
| 工具库 | `npm install` | 直接使用 | `lodash`, `dayjs` |

---

## 集成步骤

### Step 1: 安装依赖

```bash
# Vite 插件
npm install -D @vitejs/plugin-legacy

# Vue 插件
npm install vue-router@4 pinia

# UI 组件库
npm install element-plus

# 工具库
npm install dayjs lodash-es
```

---

### Step 2: Vite 插件配置

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import legacy from '@vitejs/plugin-legacy'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    vue(),
    legacy({
      targets: ['defaults', 'not IE 11']
    })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
})
```

---

### Step 3: Vue 插件配置

```typescript
// src/main.ts
import { createApp } from 'vue'
import App from './App.vue'

// 插件
import { setupRouter } from './router'
import { setupStore } from './store'
import { setupElementPlus } from './plugins/element-plus'
import { setupUnoCSS } from './plugins/unocss'

async function bootstrap() {
  const app = createApp(App)

  // 安装插件
  setupStore(app)
  setupRouter(app)
  setupElementPlus(app)
  setupUnoCSS()

  app.mount('#app')
}

bootstrap()
```

---

### Step 4: 插件封装

```typescript
// src/plugins/element-plus.ts
import type { App } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'

export function setupElementPlus(app: App) {
  app.use(ElementPlus, {
    locale: zhCn,
    zIndex: 3000
  })
}
```

```typescript
// src/plugins/unocss.ts
import 'virtual:uno.css'

export function setupUnoCSS() {
  // UnoCSS 通过 Vite 插件自动配置
}
```

---

## 常用插件集成

### Element Plus

```typescript
// 完整引入
import { setupElementPlus } from './plugins/element-plus'

// 按需引入（推荐）
// vite.config.ts
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig({
  plugins: [
    AutoImport({
      resolvers: [ElementPlusResolver()]
    }),
    Components({
      resolvers: [ElementPlusResolver()]
    })
  ]
})
```

### Vue Router

```typescript
// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import type { App } from 'vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // 路由配置
  ]
})

export function setupRouter(app: App) {
  app.use(router)
}

export { router }
```

### Pinia

```typescript
// src/store/index.ts
import { createPinia } from 'pinia'
import type { App } from 'vue'

const store = createPinia()

export function setupStore(app: App) {
  app.use(store)
}

export { store }
```

### UnoCSS

```typescript
// vite.config.ts
import UnoCSS from 'unocss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    UnoCSS({
      // 配置
    })
  ]
})
```

```typescript
// uno.config.ts
import { defineConfig, presetUno, presetIcons } from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetIcons({
      prefix: 'i-',
      extraProperties: {
        display: 'inline-block'
      }
    })
  ],
  shortcuts: {
    'flex-center': 'flex items-center justify-center'
  }
})
```

---

## 检查清单

集成插件时检查：

- [ ] 使用 npm/yarn 安装依赖
- [ ] Vite 插件在 `vite.config.ts` 配置
- [ ] Vue 插件在 `main.ts` 或单独文件配置
- [ ] 按需引入组件库（推荐）
- [ ] 添加必要的类型声明
- [ ] 测试插件功能正常

---

**最后更新**: 2026-03-18
