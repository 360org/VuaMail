import { Worker } from 'node:worker_threads'
import { app } from 'electron'
import * as path from 'node:path'
import type { EmailAccount, EmailBody, EmailMessage, MailFolder } from '../../shared/types'
import { SQLiteMailStorage } from './sqlite-storage'

export class AsyncMailStorage {
  private fallbackStorage: SQLiteMailStorage
  private worker: Worker | null = null
  private requestMap = new Map<string, { resolve: (val: any) => void; reject: (err: any) => void }>()
  private reqIdCounter = 0

  constructor() {
    this.fallbackStorage = new SQLiteMailStorage()
    try {
      const dbDir = app ? app.getPath('userData') : '/tmp'
      const workerPath = path.join(__dirname, 'db-worker.js')
      this.worker = new Worker(workerPath, {
        workerData: { dbDir },
      })
      this.worker.on('message', (msg: { id: string; success: boolean; result?: any; error?: string }) => {
        const handler = this.requestMap.get(msg.id)
        if (handler) {
          this.requestMap.delete(msg.id)
          if (msg.success) handler.resolve(msg.result)
          else handler.reject(new Error(msg.error))
        }
      })
      this.worker.on('error', (err) => {
        console.warn('[AsyncMailStorage] DB Worker error, using fallback storage:', err)
        this.worker = null
      })
    } catch {
      this.worker = null
    }
  }

  private async callWorker<T>(action: string, payload?: any): Promise<T> {
    if (!this.worker) {
      // Fallback synchronous operations
      switch (action) {
        case 'listAccounts':
          return this.fallbackStorage.getAccounts() as any
        case 'listFolders':
          return this.fallbackStorage.getFolders(payload?.accountId) as any
        case 'listEmails':
          return this.fallbackStorage.getEmails(payload?.folderId, payload?.category) as any
        case 'getEmailBody':
          return this.fallbackStorage.getEmailBody(payload?.id) as any
        case 'markAsRead':
          this.fallbackStorage.markRead(payload.id, !payload.isUnread)
          return { success: true } as any
        case 'toggleStarred':
          return { isStarred: this.fallbackStorage.toggleStarred(payload.id) } as any
        case 'deleteEmail':
          this.fallbackStorage.deleteEmail(payload.id)
          return { success: true } as any
        default:
          throw new Error(`Unknown fallback action: ${action}`)
      }
    }

    const id = `req_${++this.reqIdCounter}_${Date.now()}`
    return new Promise((resolve, reject) => {
      this.requestMap.set(id, { resolve, reject })
      this.worker!.postMessage({ id, action, payload })
    })
  }

  async getAccounts(): Promise<EmailAccount[]> {
    return this.callWorker<EmailAccount[]>('listAccounts')
  }

  async getFolders(accountId?: string): Promise<MailFolder[]> {
    return this.callWorker<MailFolder[]>('listFolders', { accountId })
  }

  async getEmails(folderId: string, category?: 'focused' | 'other'): Promise<EmailMessage[]> {
    return this.callWorker<EmailMessage[]>('listEmails', { folderId, category })
  }

  async getEmailBody(emailId: string): Promise<EmailBody | null> {
    return this.callWorker<EmailBody | null>('getEmailBody', { id: emailId })
  }

  async markRead(emailId: string, isRead: boolean): Promise<void> {
    await this.callWorker('markAsRead', { id: emailId, isUnread: !isRead })
  }

  async toggleStarred(emailId: string): Promise<boolean> {
    const res = await this.callWorker<{ isStarred: boolean }>('toggleStarred', { id: emailId })
    return res.isStarred
  }

  async deleteEmail(emailId: string): Promise<void> {
    await this.callWorker('deleteEmail', { id: emailId })
  }

  async archiveEmail(emailId: string): Promise<void> {
    this.fallbackStorage.archiveEmail(emailId)
  }

  async sendEmail(draft: {
    accountId: string
    to: string[]
    subject: string
    bodyHtml: string
  }): Promise<{ success: boolean; emailId?: string }> {
    return this.fallbackStorage.sendEmail(draft)
  }
}
