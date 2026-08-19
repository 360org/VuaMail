import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'

const localAlias = {
  '@genoffice/mail-engine': resolve(__dirname, '../../packages/mail-engine/src/index.ts'),
}

export default defineConfig({
  main: {
    plugins: [
      externalizeDepsPlugin({
        exclude: ['@genoffice/i18n', '@genoffice/electron-utils', '@genoffice/ai-provider'],
      }),
    ],
    resolve: { alias: localAlias },
  },
  preload: {
    plugins: [externalizeDepsPlugin({ exclude: ['@genoffice/i18n'] })],
    resolve: { alias: localAlias },
  },
  renderer: {
    plugins: [react()],
    resolve: { alias: localAlias },
    server: {
      port: Number(process.env.MAIL_DEV_PORT) || 5178,
      strictPort: Boolean(process.env.MAIL_DEV_PORT),
    },
  },
})
