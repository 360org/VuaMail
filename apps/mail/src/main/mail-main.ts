import { WebContentsView, app } from 'electron'
import { join } from 'node:path'
import { AsyncMailStorage } from './db/async-storage'
import { SQLiteMailStorage } from './db/sqlite-storage'
import { registerMailIpc } from './ipc/mail-ipc'
import { MailSyncOrchestrator } from './network/mail-sync-orchestrator'

let asyncMailStorage: AsyncMailStorage | null = null
let syncOrchestrator: MailSyncOrchestrator | null = null

export interface MailRuntimeConfig {
  preloadPath: string
  rendererUrl?: string | undefined
  rendererFile: string
}

let runtime: MailRuntimeConfig = {
  preloadPath: join(__dirname, '../preload/index.js'),
  rendererUrl: process.env.MAIL_RENDERER_URL,
  rendererFile: join(__dirname, '../renderer/index.html'),
}

export function configureMailRuntime(config: MailRuntimeConfig): void {
  runtime = config
}

export function initMailBackend(): AsyncMailStorage {
  if (!asyncMailStorage) {
    asyncMailStorage = new AsyncMailStorage()
    const syncStorage = new SQLiteMailStorage()
    syncOrchestrator = new MailSyncOrchestrator(syncStorage)
    syncOrchestrator.startSyncLoop(60000)
    registerMailIpc(asyncMailStorage, syncOrchestrator)
  }
  return asyncMailStorage
}

export function createMailView(): WebContentsView {
  initMailBackend()

  const view = new WebContentsView({
    webPreferences: {
      preload: runtime.preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  })

  view.webContents.setWindowOpenHandler(() => ({ action: 'deny' }))
  view.webContents.on('will-navigate', (event) => event.preventDefault())

  if (runtime.rendererUrl) {
    void view.webContents.loadURL(runtime.rendererUrl)
  } else if (runtime.rendererFile) {
    void view.webContents.loadFile(runtime.rendererFile)
  }

  return view
}
