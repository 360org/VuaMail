import { WebContentsView, app } from 'electron'
import { join } from 'node:path'
import { AsyncMailStorage } from './db/async-storage'
import { SQLiteMailStorage } from './db/sqlite-storage'
import { registerMailIpc } from './ipc/mail-ipc'
import { MailSyncOrchestrator } from './network/mail-sync-orchestrator'

let asyncMailStorage: AsyncMailStorage | null = null
let syncOrchestrator: MailSyncOrchestrator | null = null

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

  const preloadPath = app.isPackaged
    ? join(process.resourcesPath, 'modules', 'mail', 'preload', 'index.js')
    : join(__dirname, '../../mail/out/preload/index.js')

  const view = new WebContentsView({
    webPreferences: {
      preload: preloadPath,
      sandbox: false,
    },
  })

  if (process.env.MAIL_RENDERER_URL) {
    view.webContents.loadURL(process.env.MAIL_RENDERER_URL)
  } else if (!app.isPackaged) {
    view.webContents.loadURL('http://localhost:5178')
  } else {
    view.webContents.loadFile(join(process.resourcesPath, 'modules', 'mail', 'renderer', 'index.html'))
  }

  return view
}
