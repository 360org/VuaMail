import { ipcMain, app, shell } from 'electron'
import { join } from 'node:path'
import { existsSync, writeFileSync, copyFileSync, mkdirSync } from 'node:fs'
import { VUA_MAIL_IPC } from '../../shared/ipc-events'
import { AsyncMailStorage } from '../db/async-storage'
import { MailSyncOrchestrator } from '../network/mail-sync-orchestrator'
import type { EmailAttachment } from '../../shared/types'

export function registerMailIpc(
  storage: AsyncMailStorage,
  syncOrchestrator: MailSyncOrchestrator,
  openDocRouter?: (filePath: string) => boolean
): void {
  ipcMain.handle(VUA_MAIL_IPC.GET_ACCOUNTS, async () => {
    return storage.getAccounts()
  })

  ipcMain.handle(VUA_MAIL_IPC.ADD_ACCOUNT, async (_evt, account) => {
    return storage.addAccount(account)
  })

  ipcMain.handle(VUA_MAIL_IPC.REMOVE_ACCOUNT, async (_evt, accountId: string) => {
    return storage.removeAccount(accountId)
  })

  ipcMain.handle(VUA_MAIL_IPC.SET_PRIMARY_ACCOUNT, async (_evt, accountId: string) => {
    return storage.setPrimaryAccount(accountId)
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

  ipcMain.handle(VUA_MAIL_IPC.OPEN_ATTACHMENT, async (_evt, attachment: EmailAttachment) => {
    try {
      const tempDir = join(app.getPath('temp'), 'VuaOffice-Attachments')
      if (!existsSync(tempDir)) {
        mkdirSync(tempDir, { recursive: true })
      }
      const targetPath = join(tempDir, attachment.filename)

      // If sample attachment matches demo fixtures, copy real office file
      if (attachment.filename.endsWith('.docx')) {
        const sampleDocx = join(__dirname, '../../../../fixtures/generated/kitchen-sink.docx')
        if (existsSync(sampleDocx)) {
          copyFileSync(sampleDocx, targetPath)
        } else if (!existsSync(targetPath)) {
          writeFileSync(targetPath, Buffer.from('PK\x03\x04Demo Word Document'))
        }
      } else if (attachment.filename.endsWith('.xlsx')) {
        const sampleXlsx = join(__dirname, '../../../../fixtures/generated/sample.xlsx')
        if (existsSync(sampleXlsx)) {
          copyFileSync(sampleXlsx, targetPath)
        } else if (!existsSync(targetPath)) {
          writeFileSync(targetPath, Buffer.from('PK\x03\x04Demo Excel Spreadsheet'))
        }
      } else if (attachment.filename.endsWith('.pptx')) {
        const samplePptx = join(__dirname, '../../../../fixtures/generated/sample.pptx')
        if (existsSync(samplePptx)) {
          copyFileSync(samplePptx, targetPath)
        } else if (!existsSync(targetPath)) {
          writeFileSync(targetPath, Buffer.from('PK\x03\x04Demo PowerPoint Presentation'))
        }
      } else if (attachment.filename.endsWith('.pdf')) {
        const samplePdf = join(__dirname, '../../../../fixtures/generated/sample.pdf')
        if (existsSync(samplePdf)) {
          copyFileSync(samplePdf, targetPath)
        } else if (!existsSync(targetPath)) {
          writeFileSync(targetPath, '%PDF-1.4\n%Demo PDF Document\n%%EOF')
        }
      } else if (!existsSync(targetPath)) {
        writeFileSync(targetPath, 'Sample Attachment Content')
      }

      // Route to VuaOffice Tab Router (Docs/Sheets/Slides/Pdf)
      if (openDocRouter && openDocRouter(targetPath)) {
        return true
      }

      // Fallback: open via system default viewer
      await shell.openPath(targetPath)
      return true
    } catch (err) {
      console.error('[mail-ipc] Failed to open attachment:', err)
      return false
    }
  })

  ipcMain.handle(VUA_MAIL_IPC.SYNC_NOW, async () => {
    return syncOrchestrator.syncAllAccounts()
  })

  ipcMain.handle(VUA_MAIL_IPC.GET_SYNC_STATUS, () => {
    return syncOrchestrator.getStatus()
  })
}

