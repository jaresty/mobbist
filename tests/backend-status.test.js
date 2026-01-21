import { beforeEach, describe, expect, it, vi } from 'vitest'
import fs from 'fs'
import path from 'path'
import { JSDOM } from 'jsdom'

const HTML_PATH = path.join(__dirname, '..', 'index.html')
const html = fs.readFileSync(HTML_PATH, 'utf8')

describe('ADR-0009 backend status', () => {
  /** @type {import('jsdom').JSDOM} */
  let dom

  beforeEach(() => {
    const fetchMock = vi.fn(() => Promise.reject(new Error('offline')))
    const confirmMock = vi.fn(() => true)
    dom = new JSDOM(html, {
      url: 'https://app.mobbist.test/',
      runScripts: 'dangerously',
      resources: 'usable',
      pretendToBeVisual: true,
      beforeParse(window) {
        window.fetch = (...args) => fetchMock(...args)
        window.alert = () => {}
        window.confirm = (...args) => confirmMock(...args)
        window.prompt = () => ''
        window.navigator.clipboard = {
          writeText: () => Promise.resolve(),
          readText: () => Promise.resolve(''),
        }
      },
    })
    dom.window._fetchMock = fetchMock
    dom.window._confirmMock = confirmMock
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

  it('loads from backend when connected and workspaceId present', async () => {
    const hooks = await waitForHooks(dom.window)
    const fetchMock = dom.window._fetchMock
    const sampleState = { ...hooks.getState(), tracks: [], people: [{ id: 'p1', name: 'Alice' }] }

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'abc', name: 'Workspace', data: sampleState }),
    })

    hooks.backendConfig.backendUrl = 'https://api.example.com'
    hooks.backendConfig.reachability = 'connected'
    hooks.workspaceMeta.workspaceId = 'abc'
    const ok = await hooks.loadFromBackend()

    expect(ok).toBe(true)
    expect(hooks.getState().people[0].name).toBe('Alice')
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.example.com/workspaces/abc',
      expect.objectContaining({ method: 'GET' }),
    )
  })

  it('revert to local prevents backend calls on save', async () => {
    const hooks = await waitForHooks(dom.window)
    const fetchMock = dom.window._fetchMock

    hooks.backendConfig.backendUrl = 'https://api.example.com'
    hooks.backendConfig.reachability = 'connected'
    hooks.workspaceMeta.workspaceId = 'abc'

    hooks.revertToLocal()
    const ok = await hooks.saveToBackend()

    expect(ok).toBe(false)
    expect(fetchMock).not.toHaveBeenCalled()
    expect(hooks.backendConfig.reachability).toBe('offline')
  })

  it('prompts before loading when local edits exist and aborts on cancel', async () => {
    const hooks = await waitForHooks(dom.window)
    const fetchMock = dom.window._fetchMock
    const confirmMock = dom.window._confirmMock

    hooks.backendConfig.backendUrl = 'https://api.example.com'
    hooks.backendConfig.reachability = 'connected'
    hooks.workspaceMeta.workspaceId = 'abc'
    hooks.setDirtySinceServerLoad(true)

    confirmMock.mockReturnValueOnce(false)
    const ok = await hooks.loadFromBackend()

    expect(ok).toBe(false)
    expect(confirmMock).toHaveBeenCalled()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('sets offline when backend load fails', async () => {
    const hooks = await waitForHooks(dom.window)
    const fetchMock = dom.window._fetchMock

    hooks.backendConfig.backendUrl = 'https://api.example.com'
    hooks.backendConfig.reachability = 'connected'
    hooks.workspaceMeta.workspaceId = 'abc'

    fetchMock.mockRejectedValueOnce(new Error('server down'))
    const ok = await hooks.loadFromBackend()

    expect(ok).toBe(false)
    expect(fetchMock).toHaveBeenCalled()
    expect(hooks.backendConfig.reachability).toBe('offline')
  })

  it('sets offline when backend save fails', async () => {
    const hooks = await waitForHooks(dom.window)
    const fetchMock = dom.window._fetchMock

    hooks.backendConfig.backendUrl = 'https://api.example.com'
    hooks.backendConfig.reachability = 'connected'
    hooks.workspaceMeta.workspaceId = null
    hooks.workspaceMeta.clientTempId = 'temp-123'

    fetchMock.mockRejectedValueOnce(new Error('server down'))
    const ok = await hooks.saveToBackend()

    expect(ok).toBe(false)
    expect(fetchMock).toHaveBeenCalled()
    expect(hooks.backendConfig.reachability).toBe('offline')
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
