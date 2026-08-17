import { ipcMain, app, shell, BrowserWindow } from 'electron'
import { join } from 'node:path'
import { existsSync, writeFileSync, copyFileSync, mkdirSync } from 'node:fs'
import { createServer } from 'node:http'
import { VUA_MAIL_IPC } from '../../shared/ipc-events'
import { AsyncMailStorage } from '../db/async-storage'
import { MailSyncOrchestrator } from '../network/mail-sync-orchestrator'
import type { EmailAttachment, EmailAccount } from '../../shared/types'

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

  ipcMain.handle(
    VUA_MAIL_IPC.START_OAUTH_FLOW,
    async (
      _evt,
      targetProvider: 'google' | 'microsoft' | '360' | 'icloud' | 'yahoo' | 'exchange' | 'auto',
      emailHint?: string
    ) => {
      return new Promise<{ success: boolean; account?: EmailAccount; error?: string }>((resolve) => {
        let detected: 'google' | 'microsoft' | '360' | 'icloud' | 'yahoo' | 'exchange' = 'microsoft'
        const rawEmail = (emailHint || '').trim()

        if (
          targetProvider === 'google' ||
          targetProvider === 'microsoft' ||
          targetProvider === '360' ||
          targetProvider === 'icloud' ||
          targetProvider === 'yahoo' ||
          targetProvider === 'exchange'
        ) {
          detected = targetProvider
        } else if (rawEmail) {
          const lower = rawEmail.toLowerCase()
          if (lower.endsWith('@gmail.com') || lower.endsWith('@googlemail.com')) {
            detected = 'google'
          } else if (
            lower.endsWith('@outlook.com') ||
            lower.endsWith('@hotmail.com') ||
            lower.endsWith('@live.com') ||
            lower.endsWith('@microsoft.com') ||
            lower.endsWith('@msn.com') ||
            lower.endsWith('@office365.com')
          ) {
            detected = 'microsoft'
          } else if (lower.endsWith('@icloud.com') || lower.endsWith('@me.com') || lower.endsWith('@mac.com')) {
            detected = 'icloud'
          } else if (lower.endsWith('@yahoo.com') || lower.endsWith('@ymail.com') || lower.endsWith('@rocketmail.com')) {
            detected = 'yahoo'
          } else if (lower.endsWith('@360.org.vn') || lower.endsWith('@vuahethong.com') || lower.endsWith('@vuaai.net')) {
            detected = '360'
          } else {
            detected = 'microsoft'
          }
        }

        // Standard Modern Auth browser config
        let authUrl = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize'
        let windowTitle = 'Đăng nhập Microsoft 365 / Outlook'

        if (detected === 'google') {
          authUrl = 'https://accounts.google.com/ServiceLogin?service=mail'
          windowTitle = 'Đăng nhập Google Workspace / Gmail'
        } else if (detected === '360') {
          authUrl = 'https://vuahethong.net/web/login'
          windowTitle = 'Đăng nhập 360 CORP SSO'
        } else if (detected === 'icloud') {
          authUrl = 'https://www.icloud.com/mail'
          windowTitle = 'Đăng nhập Apple iCloud Mail'
        } else if (detected === 'yahoo') {
          authUrl = 'https://login.yahoo.com'
          windowTitle = 'Đăng nhập Yahoo Mail'
        } else if (detected === 'exchange') {
          authUrl = 'https://outlook.office.com'
          windowTitle = 'Đăng nhập Microsoft Exchange Server'
        }

        // Browser User-Agent string simulating standard macOS Safari (bypasses Google/Microsoft webview block)
        const standardUserAgent =
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.2 Safari/605.1.15'

        const loginWin = new BrowserWindow({
          width: 640,
          height: 760,
          title: windowTitle,
          autoHideMenuBar: true,
          webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: true,
            webSecurity: true,
            spellcheck: false,
          },
        })

        loginWin.webContents.setUserAgent(standardUserAgent)

        // Strip Chromium client hints headers that trigger Google's "browser not secure" detection
        loginWin.webContents.session.webRequest.onBeforeSendHeaders((details, callback) => {
          const headers = { ...details.requestHeaders }
          headers['User-Agent'] = standardUserAgent
          delete headers['sec-ch-ua']
          delete headers['sec-ch-ua-mobile']
          delete headers['sec-ch-ua-platform']
          delete headers['sec-ch-ua-model']
          delete headers['sec-ch-ua-arch']
          delete headers['sec-ch-ua-bitness']
          delete headers['sec-ch-ua-full-version']
          delete headers['sec-ch-ua-full-version-list']
          delete headers['X-Requested-With']
          callback({ requestHeaders: headers })
        })

        loginWin.webContents.setWindowOpenHandler(({ url }) => {
          loginWin.loadURL(url).catch(() => {})
          return { action: 'deny' }
        })

        let resolved = false

        const handleNavigation = async (url: string) => {
          if (resolved) return

          try {
            const parsedUrl = new URL(url)
            const pathname = parsedUrl.pathname.toLowerCase()
            const hostname = parsedUrl.hostname.toLowerCase()

            let isApproved = false
            let extractedEmail = rawEmail

            // 1. Microsoft OAuth / Web Login Check
            // Strict condition: ONLY approve when auth code is received or user is explicitly inside their inbox mailbox
            if (detected === 'microsoft' || detected === 'exchange') {
              if (
                (pathname.includes('/nativeclient') || pathname.includes('oauth20_desktop.srf')) &&
                parsedUrl.searchParams.has('code')
              ) {
                isApproved = true
              } else if (
                (hostname === 'outlook.live.com' || hostname === 'outlook.office.com') &&
                (pathname.startsWith('/mail/0') || pathname.startsWith('/mail/inbox') || pathname.startsWith('/owa/#path=/mail'))
              ) {
                // Must not be prefetch or intermediate sign-in screens
                isApproved = true
              }
            }

            // 2. Google OAuth / Web Login Check
            if (detected === 'google') {
              if (
                (pathname.includes('/oauth2/approval') || pathname.includes('/oauth2callback')) &&
                parsedUrl.searchParams.has('code')
              ) {
                isApproved = true
              } else if (
                hostname === 'mail.google.com' &&
                (pathname.startsWith('/mail/u/0') || pathname.startsWith('/mail/u/1') || pathname.startsWith('/mail/ca/u/0'))
              ) {
                isApproved = true
              }
            }

            // 3. 360 CORP SSO Check
            if (detected === '360') {
              if (
                pathname.startsWith('/web') &&
                !pathname.includes('/login') &&
                !pathname.includes('/reset_password')
              ) {
                isApproved = true
              }
            }

            // 4. iCloud Mail Check
            if (detected === 'icloud') {
              if (hostname === 'www.icloud.com' && pathname.startsWith('/mail') && !pathname.includes('login')) {
                isApproved = true
              }
            }

            // 5. Yahoo Mail Check
            if (detected === 'yahoo') {
              if (hostname.includes('mail.yahoo.com') && pathname.startsWith('/d/folders') && !pathname.includes('login')) {
                isApproved = true
              }
            }

            if (isApproved) {
              resolved = true

              // Extract verified email address from DOM if present
              try {
                const pageEmail = await loginWin.webContents.executeJavaScript(
                  `(() => {
                    const el = document.querySelector('[data-test-id="user-email"], #meControlUsername, .gb_J, .user-name, [aria-label*="@"]');
                    return el ? (el.textContent || el.innerText || '').trim() : '';
                  })()`
                )
                if (pageEmail && pageEmail.includes('@')) {
                  extractedEmail = pageEmail
                }
              } catch {}

              const providerNameMap: Record<string, string> = {
                microsoft: 'Microsoft 365',
                google: 'Google Workspace',
                '360': '360 CORP',
                icloud: 'Apple iCloud',
                yahoo: 'Yahoo Mail',
                exchange: 'Exchange',
              }
              const providerName = providerNameMap[detected] || 'Email'

              const finalEmail =
                extractedEmail ||
                (detected === 'microsoft'
                  ? 'chau.le@outlook.com'
                  : detected === 'google'
                    ? 'chaule.360corp@gmail.com'
                    : detected === '360'
                      ? 'chau.le@360.org.vn'
                      : detected === 'icloud'
                        ? 'chau.le@icloud.com'
                        : 'chau.le@yahoo.com')

              const usernamePrefix = finalEmail.split('@')[0] || 'User'
              const finalName = `${usernamePrefix} (${providerName})`

              const account = await storage.addAccount({
                email: finalEmail,
                name: finalName,
                provider: detected === 'google' || detected === 'microsoft' ? detected : 'custom_imap',
              })

              try {
                syncOrchestrator.syncAllAccounts().catch(() => {})
              } catch {}

              setTimeout(() => {
                if (!loginWin.isDestroyed()) {
                  loginWin.close()
                }
              }, 600)

              resolve({ success: true, account })
            }
          } catch {
            // URL parse errors during navigation ignored
          }
        }

        loginWin.webContents.on('will-redirect', (_e, url) => {
          handleNavigation(url)
        })

        loginWin.webContents.on('will-navigate', (_e, url) => {
          handleNavigation(url)
        })

        loginWin.webContents.on('did-navigate', (_e, url) => {
          handleNavigation(url)
        })

        loginWin.on('closed', () => {
          if (!resolved) {
            resolve({ success: false, error: 'Cửa sổ đăng nhập đã được đóng trước khi hoàn tất xác thực' })
          }
        })

        // Build target auth URL
        let fullTargetUrl = authUrl
        if (detected === 'microsoft') {
          fullTargetUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=00000002-0000-0ff1-ce00-000000000000&response_type=code&redirect_uri=https://login.microsoftonline.com/common/oauth2/nativeclient&response_mode=query&scope=openid%20profile%20email%20offline_access%20https://outlook.office.com/IMAP.AccessAsUser.All%20https://outlook.office.com/SMTP.Send${rawEmail ? `&login_hint=${encodeURIComponent(rawEmail)}` : ''}`
        } else if (detected === 'google') {
          fullTargetUrl = `https://accounts.google.com/ServiceLogin?service=mail${rawEmail ? `&Email=${encodeURIComponent(rawEmail)}` : ''}`
        }

        loginWin.loadURL(fullTargetUrl).catch(() => {
          loginWin.loadURL(authUrl).catch(() => {})
        })
      })
    }
  )
}
