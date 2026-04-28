import { defineConfig } from '@soybeanjs/eslint-config';

export default defineConfig(
  { vue: true, unocss: true },
  {
    rules: {
      'max-params': ['error', 5],
      'vue/multi-word-component-names': [
        'warn',
        {
          ignores: ['index', 'App', 'Register', '[id]', '[url]']
        }
      ],
      'vue/component-name-in-template-casing': [
        'warn',
        'PascalCase',
        {
          registeredComponentsOnly: false,
          ignores: ['/^icon-/']
        }
      ],
      'unocss/order-attributify': 'off',
      // 允许 vue 模板中 _ 前缀的未使用变量
      'vue/no-unused-vars': [
        'error',
        {
          ignorePattern: '^_'
        }
      ],
      // 允许 _ 前缀的变量名
      'no-underscore-dangle': 'off',
      // 允许 Promise executor 返回值（常见于 setTimeout 等场景）
      'no-promise-executor-return': 'off',
      // 禁用嵌套三元表达式检查（在 computed 中很常见）
      'no-nested-ternary': 'off',
      // 允许直接修改 props（部分场景需要，如 v-model 绑定）
      'vue/no-mutating-props': 'warn',
      // 不强制要求 default case
      'default-case': 'warn',
      // 允许自定义组件上的 v-slot
      'vue/valid-v-slot': [
        'warn',
        {
          allowModifiers: true
        }
      ]
    }
  }
);
