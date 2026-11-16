import js from '@eslint/js'
import vue from 'eslint-plugin-vue'
import globals from 'globals'

export default [
  { ignores: ['dist/'] },
  js.configs.recommended,
  ...vue.configs['flat/recommended'],
  {
    languageOptions: { globals: { ...globals.browser } },
    rules: {
      // v-html es la vía más directa hacia un XSS: aquí está prohibido.
      'vue/no-v-html': 'error',
      'no-eval': 'error',
      // El formato lo decide prettier.
      'vue/max-attributes-per-line': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      'vue/html-self-closing': 'off',
      'vue/html-indent': 'off',
      'vue/html-closing-bracket-newline': 'off',
    },
  },
]
