import type { SQLiteMailStorage } from '../db/sqlite-storage'
import { NativeImapClient, NativeSmtpClient } from './mail-protocol-client'

export interface SyncStatus {
  isSyncing: boolean
  lastSyncTimeIso: string | null
  syncedCount: number
  pendingOpsCount: number
  error: string | null
}

/**
 * Outlook-style Sync Orchestrator
 * - Manages scheduled folder sync
 * - Flushes pending OpQueue operations (marks, deletes, sends)
 * - Auto-detects network online/offline state
 */
export class MailSyncOrchestrator {
  private isSyncing = false
  private lastSyncTime: number | null = null
  private syncTimer: NodeJS.Timeout | null = null

  constructor(private storage: SQLiteMailStorage) {}

  startSyncLoop(intervalMs = 60000): void {
    if (this.syncTimer) clearInterval(this.syncTimer)
    // Run initial sync
    this.syncAllAccounts().catch(() => {})
    this.syncTimer = setInterval(() => {
      this.syncAllAccounts().catch(() => {})
    }, intervalMs)
  }

  stopSyncLoop(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer)
      this.syncTimer = null
    }
  }

  async syncAllAccounts(): Promise<SyncStatus> {
    if (this.isSyncing) {
      return this.getStatus()
    }

    this.isSyncing = true
    let syncedCount = 0

    try {
      // 1. Flush offline pending operations from op_queue
      await this.flushPendingOps()

      // 2. Fetch new emails for all accounts via IMAP
      const accounts = this.storage.getAccounts()
      for (const acc of accounts) {
        const client = new NativeImapClient({
          host: 'imap.' + acc.email.split('@')[1],
          port: 993,
          tls: true,
          user: acc.email,
          pass: 'demo-token',
        })

        const fetched = await client.connectAndFetchRecent('INBOX', 5)
        for (const item of fetched) {
          // Store into SQLite if not exists
          const existing = this.storage.getEmails('f_inbox').find((e) => e.subject === item.subject)
          if (!existing) {
            this.storage.insertEmailDirectly({
              id: item.uid,
              accountId: acc.id,
              folderId: 'f_inbox',
              senderName: item.from.split('@')[0],
              senderEmail: item.from,
              recipientEmails: [item.to],
              subject: item.subject,
              snippet: item.snippet,
              dateIso: item.dateIso,
              isRead: false,
              isStarred: false,
              category: 'focused',
              bodyHtml: `<div style="font-family: sans-serif; line-height: 1.6;"><p>${item.snippet}</p><p><em>Nội dung được đồng bộ tự động qua giao thức IMAP/TLS của VuaMail.</em></p></div>`,
              plainText: item.snippet,
            })
            syncedCount++
          }
        }
      }

      this.lastSyncTime = Date.now()
    } catch (err: any) {
      this.isSyncing = false
      return {
        isSyncing: false,
        lastSyncTimeIso: this.lastSyncTime ? new Date(this.lastSyncTime).toISOString() : null,
        syncedCount,
        pendingOpsCount: this.storage.getPendingOpsCount(),
        error: err?.message || 'Sync failed',
      }
    }

    this.isSyncing = false
    return this.getStatus(syncedCount)
  }

  private async flushPendingOps(): Promise<void> {
    const pendingOps = this.storage.getPendingOps()
    for (const op of pendingOps) {
      try {
        if (op.opType === 'send_draft') {
          const payload = JSON.parse(op.payloadJson)
          const smtpClient = new NativeSmtpClient({
            host: 'smtp.360.org.vn',
            port: 465,
            tls: true,
            user: 'support@360.org.vn',
            pass: 'secret',
          })
          await smtpClient.sendMail({
            from: 'chau.le@360.org.vn',
            to: payload.to,
            subject: payload.subject,
            bodyHtml: payload.bodyHtml,
          })
        }
        this.storage.markOpCompleted(op.id)
      } catch {
        // Leave in queue for next retry
      }
    }
  }

  getStatus(syncedCount = 0): SyncStatus {
    return {
      isSyncing: this.isSyncing,
      lastSyncTimeIso: this.lastSyncTime ? new Date(this.lastSyncTime).toISOString() : null,
      syncedCount,
      pendingOpsCount: this.storage.getPendingOpsCount(),
      error: null,
    }
  }
}
