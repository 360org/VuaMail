import { ipcMain } from 'electron'
import { VUA_MAIL_IPC } from '../../shared/ipc-events'
import { AsyncMailStorage } from '../db/async-storage'
import { MailSyncOrchestrator } from '../network/mail-sync-orchestrator'

export function registerMailIpc(storage: AsyncMailStorage, syncOrchestrator: MailSyncOrchestrator): void {
  ipcMain.handle(VUA_MAIL_IPC.GET_ACCOUNTS, async () => {
    return storage.getAccounts()
  })

  ipcMain.handle(VUA_MAIL_IPC.GET_FOLDERS, async (_evt, accountId: string) => {
    return storage.getFolders(accountId)
  })

  ipcMain.handle(VUA_MAIL_IPC.GET_EMAILS, async (_evt, folderId: string, category?: 'focused' | 'other') => {
    return storage.getEmails(folderId, category)
  })

  ipcMain.handle(VUA_MAIL_IPC.GET_EMAIL_BODY, async (_evt, emailId: string) => {
    return storage.getEmailBody(emailId)
  })

  ipcMain.handle(VUA_MAIL_IPC.MARK_READ, async (_evt, emailId: string, isRead: boolean) => {
    await storage.markRead(emailId, isRead)
  })

  ipcMain.handle(VUA_MAIL_IPC.TOGGLE_STARRED, async (_evt, emailId: string) => {
    return storage.toggleStarred(emailId)
  })

  ipcMain.handle(VUA_MAIL_IPC.DELETE_EMAIL, async (_evt, emailId: string) => {
    await storage.deleteEmail(emailId)
  })

  ipcMain.handle(VUA_MAIL_IPC.ARCHIVE_EMAIL, async (_evt, emailId: string) => {
    await storage.archiveEmail(emailId)
  })

  ipcMain.handle(VUA_MAIL_IPC.SEND_EMAIL, async (_evt, draft) => {
    return storage.sendEmail(draft)
  })

  ipcMain.handle(VUA_MAIL_IPC.SYNC_NOW, async () => {
    return syncOrchestrator.syncAllAccounts()
  })

  ipcMain.handle(VUA_MAIL_IPC.GET_SYNC_STATUS, () => {
    return syncOrchestrator.getStatus()
  })
}

