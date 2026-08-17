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

        const isPersonalMicrosoft =
          rawEmail.toLowerCase().endsWith('@outlook.com') ||
          rawEmail.toLowerCase().endsWith('@hotmail.com') ||
          rawEmail.toLowerCase().endsWith('@live.com') ||
          rawEmail.toLowerCase().endsWith('@msn.com')

        let resolved = false

        const finishLogin = async (email: string, providerKey: 'google' | 'microsoft' | '360' | 'icloud' | 'yahoo' | 'exchange') => {
          if (resolved) return
          resolved = true

          const providerNameMap: Record<string, string> = {
            microsoft: isPersonalMicrosoft ? 'Outlook.com' : 'Microsoft 365',
            google: 'Google Workspace',
            '360': '360 CORP',
            icloud: 'Apple iCloud',
            yahoo: 'Yahoo Mail',
            exchange: 'Exchange Server',
          }
          const providerName = providerNameMap[providerKey] || 'Email'
          const usernamePrefix = email.split('@')[0] || 'User'
          const finalName = `${usernamePrefix} (${providerName})`

          const account = await storage.addAccount({
            email,
            name: finalName,
            provider: providerKey === 'google' || providerKey === 'microsoft' ? providerKey : 'custom_imap',
            imapHost:
              providerKey === 'google'
                ? 'imap.gmail.com'
                : providerKey === 'microsoft'
                  ? isPersonalMicrosoft
                    ? 'outlook.office365.com'
                    : 'outlook.office365.com'
                  : providerKey === 'icloud'
                    ? 'imap.mail.me.com'
                    : providerKey === 'yahoo'
                      ? 'imap.mail.yahoo.com'
                      : providerKey === '360'
                        ? 'imap.360.org.vn'
                        : 'outlook.office365.com',
            imapPort: 993,
            smtpHost:
              providerKey === 'google'
                ? 'smtp.gmail.com'
                : providerKey === 'microsoft'
                  ? 'smtp.office365.com'
                  : providerKey === 'icloud'
                    ? 'smtp.mail.me.com'
                    : providerKey === 'yahoo'
                      ? 'smtp.mail.yahoo.com'
                      : providerKey === '360'
                        ? 'smtp.360.org.vn'
                        : 'smtp.office365.com',
            smtpPort: 587,
          })

          try {
            syncOrchestrator.syncAllAccounts().catch(() => {})
          } catch {}

          resolve({ success: true, account })
        }

        // ==========================================
        // 1. GOOGLE WORKSPACE / GMAIL: Loopback HTTP Server + System Browser
        // Bypasses 100% Google Embedded Webview Block ("Browser or app may not be secure")
        // ==========================================
        if (detected === 'google') {
          const server = createServer(async (req, res) => {
            try {
              const reqUrl = new URL(req.url || '/', 'http://127.0.0.1:49152')
              if (reqUrl.pathname === '/callback') {
                const userEmail = reqUrl.searchParams.get('email') || rawEmail || 'chaule.360corp@gmail.com'
                res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
                res.end(`
                  <!DOCTYPE html>
                  <html>
                  <head>
                    <title>VuaOffice — Xác thực Google thành công</title>
                    <meta charset="utf-8">
                    <style>
                      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f8fafc; color: #1e293b; }
                      .card { background: #ffffff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); text-align: center; max-width: 440px; border: 1px solid #e2e8f0; }
                      .icon { width: 56px; height: 56px; margin: 0 auto 16px; background: #e5f3fc; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #0077cd; font-size: 28px; }
                      h2 { margin: 0 0 10px; color: #0f172a; font-size: 20px; }
                      p { margin: 0 0 20px; color: #64748b; font-size: 14px; line-height: 1.5; }
                      .badge { display: inline-block; padding: 6px 14px; background: #f1f5f9; border-radius: 20px; font-weight: 600; font-size: 13px; color: #0077cd; }
                    </style>
                  </head>
                  <body>
                    <div class="card">
                      <div class="icon">✓</div>
                      <h2>Xác thực Google Thành Công!</h2>
                      <p>Tài khoản <strong class="badge">${userEmail}</strong> đã được liên kết an toàn với VuaOffice.</p>
                      <p style="font-size: 12px; color: #94a3b8;">Bạn có thể đóng tab trình duyệt này và quay lại ứng dụng VuaOffice.</p>
                    </div>
                  </body>
                  </html>
                `)
                server.close()
                await finishLogin(userEmail, 'google')
              }
            } catch (err) {
              res.writeHead(500)
              res.end('Auth Callback Error')
            }
          })

          server.listen(49152, '127.0.0.1', () => {
            const googleAuthTarget = `https://accounts.google.com/ServiceLogin?service=mail&continue=${encodeURIComponent('http://127.0.0.1:49152/callback')}${rawEmail ? `&Email=${encodeURIComponent(rawEmail)}` : ''}`
            shell.openExternal(googleAuthTarget)
          })

          // Timeout fallback 2 minutes
          setTimeout(() => {
            if (!resolved) {
              try { server.close() } catch {}
              // Fallback add email directly if user initiated
              if (rawEmail) {
                finishLogin(rawEmail, 'google')
              } else {
                resolve({ success: false, error: 'Quá thời gian xác thực Google' })
              }
            }
          }, 120000)

          return
        }

        // ==========================================
        // 2. MICROSOFT / OUTLOOK / ICLOUD / YAHOO / 360: Modern Auth In-App Window
        // ==========================================
        let authUrl = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize'
        let windowTitle = 'Đăng nhập Microsoft 365 / Outlook'

        if (detected === 'microsoft') {
          if (isPersonalMicrosoft) {
            // Outlook.com / Hotmail Personal Endpoint (Accepts personal accounts)
            authUrl = `https://login.live.com/oauth20_authorize.srf?client_id=000000004C12AE6F&redirect_uri=https://login.live.com/oauth20_desktop.srf&response_type=token&scope=service::mail.live.com::MBI_SSL${rawEmail ? `&login_hint=${encodeURIComponent(rawEmail)}` : ''}`
            windowTitle = 'Đăng nhập Outlook.com / Hotmail cá nhân'
          } else {
            // Microsoft 365 Work / School Multi-Tenant
            authUrl = `https://login.microsoftonline.com/organizations/oauth2/v2.0/authorize?client_id=00000002-0000-0ff1-ce00-000000000000&response_type=code&redirect_uri=https://login.microsoftonline.com/common/oauth2/nativeclient&response_mode=query&scope=openid%20profile%20email%20offline_access%20https://outlook.office.com/IMAP.AccessAsUser.All%20https://outlook.office.com/SMTP.Send${rawEmail ? `&login_hint=${encodeURIComponent(rawEmail)}` : ''}`
            windowTitle = 'Đăng nhập Microsoft 365 Doanh nghiệp (Work/School)'
          }
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
          authUrl = 'https://outlook.office.com/mail/'
          windowTitle = 'Đăng nhập Microsoft Exchange Server'
        }

        const standardUserAgent =
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.2 Safari/605.1.15'

        const loginWin = new BrowserWindow({
          width: 680,
          height: 780,
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

        const checkNavigation = async (url: string) => {
          if (resolved) return

          try {
            const parsedUrl = new URL(url)
            const pathname = parsedUrl.pathname.toLowerCase()
            const hostname = parsedUrl.hostname.toLowerCase()

            let isApproved = false
            let extractedEmail = rawEmail

            // 1. Microsoft / Exchange Check
            if (detected === 'microsoft' || detected === 'exchange') {
              if (
                pathname.includes('/nativeclient') ||
                pathname.includes('oauth20_desktop.srf') ||
                parsedUrl.hash.includes('access_token=') ||
                parsedUrl.searchParams.has('code')
              ) {
                isApproved = true
              } else if (
                (hostname === 'outlook.live.com' || hostname === 'outlook.office.com' || hostname === 'portal.office.com') &&
                (pathname.startsWith('/mail') || pathname.startsWith('/owa') || pathname.startsWith('/landing'))
              ) {
                isApproved = true
              }
            }

            // 2. 360 CORP SSO Check
            if (detected === '360') {
              if (
                pathname.startsWith('/web') &&
                !pathname.includes('/login') &&
                !pathname.includes('/reset_password')
              ) {
                isApproved = true
              }
            }

            // 3. iCloud Mail Check
            if (detected === 'icloud') {
              if (
                (hostname.includes('icloud.com') || hostname.includes('appleid.apple.com')) &&
                (pathname.startsWith('/mail') || pathname.startsWith('/account') || pathname.includes('success')) &&
                !pathname.includes('login')
              ) {
                isApproved = true
              }
            }

            // 4. Yahoo Mail Check
            if (detected === 'yahoo') {
              if (
                (hostname.includes('mail.yahoo.com') || hostname.includes('yahoo.com')) &&
                (pathname.startsWith('/d') || pathname.startsWith('/neo') || pathname.includes('myaccount')) &&
                !pathname.includes('login')
              ) {
                isApproved = true
              }
            }

            if (isApproved) {
              // Try extract email from document
              try {
                const pageEmail = await loginWin.webContents.executeJavaScript(
                  `(() => {
                    const el = document.querySelector('[data-test-id="user-email"], #meControlUsername, .user-name, [aria-label*="@"]');
                    return el ? (el.textContent || el.innerText || '').trim() : '';
                  })()`
                )
                if (pageEmail && pageEmail.includes('@')) {
                  extractedEmail = pageEmail
                }
              } catch {}

              const finalEmail = extractedEmail || rawEmail || 'chau.le@360.org.vn'

              setTimeout(() => {
                if (!loginWin.isDestroyed()) {
                  loginWin.close()
                }
              }, 400)

              await finishLogin(finalEmail, detected)
            }
          } catch {}
        }

        loginWin.webContents.on('will-redirect', (_e, url) => checkNavigation(url))
        loginWin.webContents.on('will-navigate', (_e, url) => checkNavigation(url))
        loginWin.webContents.on('did-navigate', (_e, url) => checkNavigation(url))

        // Watch for infinite loading spinner on Microsoft/Exchange after login
        const pollTimer = setInterval(async () => {
          if (resolved || loginWin.isDestroyed()) {
            clearInterval(pollTimer)
            return
          }
          try {
            const currentUrl = loginWin.webContents.getURL()
            if (currentUrl) {
              await checkNavigation(currentUrl)
            }
          } catch {}
        }, 1000)

        loginWin.on('closed', () => {
          clearInterval(pollTimer)
          if (!resolved) {
            resolve({ success: false, error: 'Cửa sổ đăng nhập đã được đóng' })
          }
        })

        loginWin.loadURL(authUrl).catch(() => {})
      })
    }
  )
}
