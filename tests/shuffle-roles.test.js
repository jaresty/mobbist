import { beforeEach, describe, expect, it, vi } from 'vitest'
import fs from 'fs'
import path from 'path'
import { JSDOM } from 'jsdom'

const HTML_PATH = path.join(__dirname, '..', 'index.html')
const html = fs.readFileSync(HTML_PATH, 'utf8')

describe('shuffleAllRoles', () => {
  let dom
  let hooks

  beforeEach(async () => {
    dom = createDom()
    hooks = await waitForHooks(dom.window)
  })

  it('distributes a single role to different tracks across multiple shuffles', async () => {
    hooks.setState({
      ...hooks.getState(),
      roles: [{ id: 'role-1', name: 'Driver', color: null }],
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
          id: 'track-1',
          name: 'Track A',
          type: 'normal',
          capacity: 2,
          personIds: [],
          roleIds: ['role-1'],
          locked: false,
        },
        {
          id: 'track-2',
          name: 'Track B',
          type: 'normal',
          capacity: 2,
          personIds: [],
          roleIds: [],
          locked: false,
        },
        {
          id: 'track-3',
          name: 'Track C',
          type: 'normal',
          capacity: 2,
          personIds: [],
          roleIds: [],
          locked: false,
      },
      ],
      nextRoleId: 2,
    }, false)

    const getRoleTrackId = () => {
      const state = hooks.getState()
      const track = state.tracks.find((t) => t.type === 'normal' && t.roleIds.includes('role-1'))
      return track?.id
    }

    const initialTrackId = getRoleTrackId()
    expect(initialTrackId).toBe('track-1')

    const shuffleButton = dom.window.document.getElementById('shuffleRolesButton')
    expect(shuffleButton).not.toBeNull()

    const destinations = new Set()
    for (let i = 0; i < 20; i++) {
      shuffleButton.click()
      const newTrackId = getRoleTrackId()
      if (newTrackId) destinations.add(newTrackId)
    }

    expect(destinations.size).toBeGreaterThan(1)
  })

  it('moves roles between tracks when shuffling', async () => {
    hooks.setState({
      ...hooks.getState(),
      roles: [
        { id: 'role-1', name: 'Driver', color: null },
        { id: 'role-2', name: 'Navigator', color: null },
      ],
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
          id: 'track-1',
          name: 'Track A',
          type: 'normal',
          capacity: 2,
          personIds: [],
          roleIds: ['role-1', 'role-2'],
          locked: false,
        },
        {
          id: 'track-2',
          name: 'Track B',
          type: 'normal',
          capacity: 2,
          personIds: [],
          roleIds: [],
          locked: false,
        },
      ],
      nextRoleId: 3,
    }, false)

    const getTracksWithRoles = () => {
      const state = hooks.getState()
      return state.tracks
        .filter((t) => t.type === 'normal')
        .map((t) => t.roleIds.slice().sort())
        .filter((r) => r.length > 0)
    }

    const beforeCount = getTracksWithRoles().length
    expect(beforeCount).toBe(1)

    const shuffleButton = dom.window.document.getElementById('shuffleRolesButton')
    shuffleButton.click()

    const afterCount = getTracksWithRoles().length
    expect(afterCount).toBe(2)
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
  const { fetchMock = vi.fn(() => Promise.reject(new Error('offline'))) } = options

  const dom = new JSDOM(html, {
    url: 'https://app.mobbist.test/',
    runScripts: 'dangerously',
    resources: 'usable',
    pretendToBeVisual: true,
    beforeParse(window) {
      window.fetch = (...args) => fetchMock(...args)
      window.alert = () => {}
      window.confirm = () => true
      window.prompt = () => ''
      window.navigator.clipboard = {
        writeText: () => Promise.resolve(),
        readText: () => Promise.resolve(''),
      }
      window.navigator.sendBeacon = () => true
    },
  })

  dom.window._fetchMock = fetchMock
  return dom
}
