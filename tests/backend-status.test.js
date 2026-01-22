import { beforeEach, describe, expect, it, vi } from 'vitest'
import fs from 'fs'
import path from 'path'
import { JSDOM } from 'jsdom'

const HTML_PATH = path.join(__dirname, '..', 'index.html')
const html = fs.readFileSync(HTML_PATH, 'utf8')
const CONFIG_STORAGE_KEY = 'mobbist:config:v1'
const WORKSPACE_META_KEY = 'mobbist:workspace-meta:v1'

describe('ADR-0009 backend status', () => {
  /** @type {import('jsdom').JSDOM} */
  let dom

  beforeEach(() => {
    dom = createDom()
  })

  it('shows offline/local fallback when backend is unreachable', async () => {
    const hooks = await waitForHooks(dom.window)
    const { checkBackendReachability, backendConfig } = hooks
    expect(typeof checkBackendReachability).toBe('function')

    const badge = dom.window.document.getElementById('backendStatusBadge')
    expect(badge).not.toBeNull()

    backendConfig.backendUrl = 'https://api.example.com'
    await checkBackendReachability()

    expect(badge.dataset.status).toBe('unreachable')
    expect((badge.textContent || '').toLowerCase()).toContain('unreachable')
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
    expectLoadSaveDisabled(dom, true)
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
    expectLoadSaveDisabled(dom, true)
  })

  it('sends PUT with name/data when workspaceId exists', async () => {
    const hooks = await waitForHooks(dom.window)
    const fetchMock = dom.window._fetchMock
    hooks.backendConfig.backendUrl = 'https://api.example.com'
    hooks.backendConfig.reachability = 'connected'
    hooks.workspaceMeta.workspaceId = 'w1'

    hooks.setState({ ...hooks.getState(), people: [{ id: 'p1', name: 'Alice' }] }, false)
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'w1', name: 'Workspace', data: hooks.getState() }),
    })

    const ok = await hooks.saveToBackend()
    expect(ok).toBe(true)
    const call = fetchMock.mock.calls[0]
    expect(call[0]).toBe('https://api.example.com/workspaces/w1')
    const body = JSON.parse(call[1].body)
    expect(body.id).toBe('w1')
    expect(body.data.people[0].name).toBe('Alice')
    expect(body.name).toBe('Workspace')
  })

  it('sends POST with clientTempId and name/data when no workspaceId', async () => {
    const hooks = await waitForHooks(dom.window)
    const fetchMock = dom.window._fetchMock
    hooks.backendConfig.backendUrl = 'https://api.example.com'
    hooks.backendConfig.reachability = 'connected'
    hooks.workspaceMeta.workspaceId = null
    hooks.workspaceMeta.clientTempId = 'temp-xyz'

    hooks.setState({ ...hooks.getState(), people: [{ id: 'p1', name: 'Bob' }] }, false)
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'sqid-1', name: 'Workspace', data: hooks.getState() }),
    })

    const ok = await hooks.saveToBackend()
    expect(ok).toBe(true)
    const call = fetchMock.mock.calls[0]
    expect(call[0]).toBe('https://api.example.com/workspaces')
    const body = JSON.parse(call[1].body)
    expect(body.clientTempId).toBe('temp-xyz')
    expect(body.data.people[0].name).toBe('Bob')
    expect(body.name).toBe('Workspace')
  })
})

describe('ADR-0011 backend auto-load and drawer', () => {
  it('keeps the drawer closed when no backend URL is configured', async () => {
    const dom = createDom()
    await waitForHooks(dom.window)
    const drawer = dom.window.document.getElementById('backendDrawer')
    const badge = dom.window.document.getElementById('backendStatusBadge')
    expect(drawer?.dataset.open).toBe('false')
    expect((badge?.textContent || '').toLowerCase()).toContain('local')
  })

  it('auto-connects and loads from backend on startup', async () => {
    const fetchMock = vi.fn()
    const sampleState = {
      people: [{ id: 'p1', name: 'Auto' }],
      roles: [],
      tracks: [
        {
          id: 'on_deck',
          name: 'On Deck',
          type: 'on_deck',
          capacity: null,
          personIds: [],
          roleIds: [],
          locked: false,
        },
        {
          id: 'out_of_office',
          name: 'Out of Office',
          type: 'out_of_office',
          capacity: null,
          personIds: [],
          roleIds: [],
          locked: false,
        },
        {
          id: 'track-1',
          name: 'Track A',
          type: 'normal',
          capacity: 2,
          personIds: [],
          roleIds: [],
          locked: false,
        },
      ],
      nextPersonId: 2,
      nextTrackId: 2,
      nextRoleId: 1,
      defaultTrackCapacity: 2,
      tenure: {
        assignments: {},
        overrides: {},
        config: { softDays: 2, hardDays: 4 },
      },
    }

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ supportsWorkspaces: true }),
    })
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'w1', name: 'Workspace', data: sampleState }),
    })
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'w1', name: 'Workspace', data: sampleState }),
    })

    const dom = createDom({
      fetchMock,
      backendConfig: { backendUrl: 'https://api.example.com', reachability: 'unknown', lastCheckedAt: null },
      workspaceMeta: { workspaceId: null, clientTempId: 'temp-abc', persisted: false },
    })

    const hooks = await waitForHooks(dom.window)
    await waitForFetchCalls(fetchMock, 3)
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.example.com/capabilities',
      expect.objectContaining({ method: 'GET' }),
    )
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.example.com/workspaces',
      expect.objectContaining({ method: 'POST' }),
    )
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.example.com/workspaces/w1',
      expect.objectContaining({ method: 'GET' }),
    )
    expect(hooks.getState().people[0].name).toBe('Auto')
  })
})

describe('ADR-0011 autosave and toast behaviour', () => {
  it('blocks unload when autosave previously failed', async () => {
    const dom = createDom()
    const hooks = await waitForHooks(dom.window)
    hooks.backendConfig.backendUrl = 'https://api.example.com'
    hooks.backendConfig.reachability = 'connected'
    hooks.setDirtySinceServerLoad(true)
    hooks.setBackendSaveBlocked(true)

    const event = { preventDefault: () => {}, returnValue: undefined }
    await hooks.handleBeforeUnload(event)

    expect(event.returnValue).toBe('')
    expect(dom.window._sendBeaconMock).toHaveBeenCalled()
  })

  it('marks failure toast as sticky on save failure', async () => {
    const fetchMock = vi.fn(() => Promise.reject(new Error('server down')))
    const dom = createDom({ fetchMock })
    const hooks = await waitForHooks(dom.window)
    hooks.backendConfig.backendUrl = 'https://api.example.com'
    hooks.backendConfig.reachability = 'connected'
    hooks.workspaceMeta.workspaceId = 'w1'

    const ok = await hooks.saveToBackend()
    expect(ok).toBe(false)

    const toast = dom.window.document.getElementById('toast')
    expect(toast).not.toBeNull()
    expect(toast?.dataset.sticky).toBe('true')
    expect(toast?.classList.contains('visible')).toBe(true)
  })

  it('marks success toast as auto-dismiss on save success', async () => {
    const fetchMock = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({ id: 'w1', name: 'Workspace', data: {} }),
      }),
    )
    const dom = createDom({ fetchMock })
    const hooks = await waitForHooks(dom.window)
    hooks.backendConfig.backendUrl = 'https://api.example.com'
    hooks.backendConfig.reachability = 'connected'
    hooks.workspaceMeta.workspaceId = 'w1'

    const ok = await hooks.saveToBackend()
    expect(ok).toBe(true)

    const toast = dom.window.document.getElementById('toast')
    expect(toast).not.toBeNull()
    expect(toast?.dataset.sticky).toBe('false')
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

function createDom(options = {}) {
  const {
    fetchMock = vi.fn(() => Promise.reject(new Error('offline'))),
    confirmMock = vi.fn(() => true),
    backendConfig = null,
    workspaceMeta = null,
  } = options

  const dom = new JSDOM(html, {
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
      window.navigator.sendBeacon = (...args) => {
        const mock = window._sendBeaconMock
        return mock(...args)
      }
      window._sendBeaconMock = vi.fn(() => true)
      if (backendConfig) {
        window.localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(backendConfig))
      }
      if (workspaceMeta) {
        window.localStorage.setItem(WORKSPACE_META_KEY, JSON.stringify(workspaceMeta))
      }
    },
  })

  dom.window._fetchMock = fetchMock
  dom.window._confirmMock = confirmMock
  return dom
}

function waitForFetchCalls(fetchMock, count, timeoutMs = 2000) {
  const start = Date.now()
  return new Promise((resolve, reject) => {
    const check = () => {
      if (fetchMock.mock.calls.length >= count) return resolve()
      if (Date.now() - start > timeoutMs) return reject(new Error('fetch calls did not reach target'))
      setTimeout(check, 25)
    }
    check()
  })
}

function expectLoadSaveDisabled(dom, disabled) {
  const loadBtn = dom.window.document.getElementById('loadBackendButton')
  const saveBtn = dom.window.document.getElementById('saveBackendButton')
  expect(loadBtn?.disabled || false).toBe(disabled)
  expect(saveBtn?.disabled || false).toBe(disabled)
}
