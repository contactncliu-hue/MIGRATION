/**
 * Fails the build when a page stylesheet leaks into other screens.
 *
 * Vite bundles every imported CSS file together, so a bare `body {}` or a
 * class name that another screen also uses is applied everywhere. This has
 * bitten us three times: body{overflow:hidden} locked scrolling on every
 * page, .scene{pointer-events:none} killed the transfer buttons, and
 * .scene{opacity:0} blanked the login artwork.
 *
 * Rules:
 *   1. A page stylesheet may not define bare element selectors (body, html, *).
 *   2. A class may be defined in one file only — unless that file is a shared
 *      one under components/ui/, which owns its primitives, and the other
 *      file scopes the class under a page root (e.g. `.login-form .field`).
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const SRC = new URL('../src', import.meta.url).pathname
const SHARED_DIR = 'components/ui'
const EXEMPT_FILES = new Set(['tokens.css', 'index.css'])
const PAGE_ROOTS = [
  '.stage', '.transfer-stage', '.admin-page', '.sidebar',
  '.modal-overlay', '.modal-box', '.login-form', '.app-shell', '.panel',
]

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name)
    return statSync(full).isDirectory() ? walk(full) : full.endsWith('.css') ? [full] : []
  })
}

function selectorsOf(css) {
  const stripped = css.replace(/\/\*[\s\S]*?\*\//g, '')
  return [...stripped.matchAll(/(^|[{}])\s*([^{}@][^{}]*?)\{/g)]
    .map((m) => m[2].split('\n').join(' ').trim())
    .filter(Boolean)
}

const files = walk(SRC)
const owners = new Map()   // class -> Set(file)
const problems = []

for (const full of files) {
  const rel = relative(SRC, full)
  const base = rel.split('/').pop()
  if (EXEMPT_FILES.has(base)) continue

  const css = readFileSync(full, 'utf8')
  for (const sel of selectorsOf(css)) {
    // 1. bare element / universal selectors
    for (const part of sel.split(',').map((s) => s.trim())) {
      if (/^(body|html|\*)\b/.test(part)) {
        problems.push(`${rel}: bare global selector \`${part}\` — scope it to a page root`)
      }
    }
    for (const cls of sel.match(/\.[a-zA-Z][\w-]*/g) ?? []) {
      if (!owners.has(cls)) owners.set(cls, new Set())
      owners.get(cls).add(rel)
    }
  }
}

for (const [cls, fileSet] of owners) {
  if (fileSet.size < 2) continue
  const list = [...fileSet]
  const sharedOwner = list.find((f) => f.startsWith(SHARED_DIR))

  for (const file of list) {
    if (file === sharedOwner) continue
    const css = readFileSync(join(SRC, file), 'utf8')
    const bad = selectorsOf(css)
      .flatMap((sel) => sel.split(',').map((s) => s.trim()))
      .filter((part) => part.includes(cls))
      .filter((part) => !PAGE_ROOTS.some((root) => part.startsWith(root)))
      // a class combined with its own owner element (.nav-link.active) is fine
      .filter((part) => part.replace(/:[\w-]+(\([^)]*\))?/g, '').trim() === cls)

    if (bad.length && sharedOwner) {
      problems.push(
        `${file}: redefines \`${cls}\` owned by ${sharedOwner} — scope it under a page root`
      )
    } else if (bad.length && !sharedOwner) {
      problems.push(
        `${file}: \`${cls}\` is also defined in ${list.filter((f) => f !== file).join(', ')} — scope it`
      )
    }
  }
}

if (problems.length) {
  console.error('\nCSS scope check failed:\n')
  for (const p of [...new Set(problems)]) console.error('  ✗ ' + p)
  console.error('\nSee .tasks/resume.md → 룰북\n')
  process.exit(1)
}
console.log('CSS scope check passed')
