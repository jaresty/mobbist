import { describe, expect, it, beforeAll } from 'vitest'
import fs from 'fs'
import path from 'path'
import { JSDOM } from 'jsdom'

const HTML_PATH = path.join(__dirname, '..', 'index.html')
const html = fs.readFileSync(HTML_PATH, 'utf8')

describe('ADR-0009 backend status', () => {
  /** @type {import('jsdom').JSDOM} */
  let dom

  beforeAll(() => {
    dom = new JSDOM(html, {
      url: 'https://app.mobbist.test/',
      runScripts: 'dangerously',
      resources: 'usable',
      pretendToBeVisual: true,
      beforeParse(window) {
        window.fetch = () => Promise.reject(new Error('offline'))
        window.alert = () => {}
        window.confirm = () => true
        window.prompt = () => ''
        window.navigator.clipboard = {
          writeText: () => Promise.resolve(),
          readText: () => Promise.resolve(''),
        }
      },
    })
  })

  it('shows offline/local fallback when backend is unreachable', async () => {
    const hooks = await waitForHooks(dom.window)
    const { checkBackendReachability, backendConfig } = hooks
    expect(typeof checkBackendReachability).toBe('function')

    const badge = dom.window.document.getElementById('backendStatusBadge')
    expect(badge).not.toBeNull()

    backendConfig.backendUrl = 'https://api.example.com'
    await checkBackendReachability()

    expect(badge.dataset.status).toBe('offline')
    expect((badge.textContent || '').toLowerCase()).toContain('local fallback')
  })
})

function waitForHooks(window, timeoutMs = 2000) {
  const start = Date.now()
  return new Promise((resolve, reject) => {
    const check = () => {
      if (window.__mobbistTestHooks) return resolve(window.__mobbistTestHooks)
      if (Date.now() - start > timeoutMs) return reject(new Error('test hooks not exposed'))
      setTimeout(check, 25)
    }
    check()
  })
}
