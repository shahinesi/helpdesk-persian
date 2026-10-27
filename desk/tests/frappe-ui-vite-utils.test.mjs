import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { findAppName, findAppsFolder, findBenchPath } from '../node_modules/frappe-ui/vite/utils.js'

test('Frappe UI Vite path discovery terminates at the platform root', () => {
  const startDir = mkdtempSync(path.join(tmpdir(), 'frappe-ui-path-'))
  try {
    assert.equal(findBenchPath(startDir), null)
    assert.equal(findAppsFolder(startDir), null)
    assert.equal(findAppName(startDir), null)
  } finally {
    rmSync(startDir, { recursive: true, force: true })
  }
})

test('Frappe UI Vite path discovery finds a bench and app from nested folders', () => {
  const root = mkdtempSync(path.join(tmpdir(), 'frappe-ui-bench-'))
  const appDir = path.join(root, 'apps', 'support', 'desk')
  try {
    mkdirSync(path.join(root, 'sites'), { recursive: true })
    mkdirSync(appDir, { recursive: true })
    assert.equal(findBenchPath(appDir), root)
    assert.equal(findAppsFolder(appDir), path.join(root, 'apps'))
    assert.equal(findAppName(appDir), 'support')
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})
