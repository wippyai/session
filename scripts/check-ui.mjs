#!/usr/bin/env node
// EE2-2461 — Session frontend packaging drift guard.
//
// Modeled on the Host's scripts/check-import-map-drift.mjs: fails loudly when
// a hand-maintained copy of some data disagrees with its source of truth,
// instead of letting the two quietly drift apart. Two independent checks:
//
//   (a) dist check — the committed src/forms/ui/dist (wippy-form) and
//       src/forms/ui/answers-dist (wippy-form-answers) bundles must be
//       byte-identical to a fresh `npm run build` of each package. Catches
//       "edited frontend/wippy-form*/src and forgot to rebuild".
//
//   (b) metadata check — the view.component registry entries in
//       src/forms/ui/_index.yaml hand-copy each package's package.json
//       `wippy` block (tag name, description, props, entry point) because
//       the registry loader needs that metadata inline, not fetched from
//       package.json at load time (see the comment at the top of
//       _index.yaml). This check fails when that copy disagrees with the
//       package.json it was copied from. This is the check that would have
//       caught N9: `_index.yaml`'s form-version prop description said
//       "shows a \"needs a newer app\" notice" while package.json said
//       "shows an" — already fixed by this change, see below.
//
// Why a CHECK, not a generator: _index.yaml's own header comment records
// the decision already made for this file — registry.entry metadata has to
// be inline for the Wippy registry loader to read it, and the YAML also
// carries fields with no package.json equivalent at all (auto_register,
// announced, base_path, the HTTP-serving wiring). Generating the whole file
// from package.json would need a second code path the file's authors
// deliberately avoided, and would turn a hand-authored, hand-commented
// config file into partially generated output for the sake of 5 fields.
// Checking keeps the one authored file and still catches the exact class of
// bug that already shipped (N9).
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync, rmSync } from 'node:fs'
import { basename, dirname, join, relative, sep } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const INDEX_YAML_PATH = join(root, 'src/forms/ui/_index.yaml')

// Temp build output deliberately lives under src/forms/ui/ — a SIBLING of
// the real dist/answers-dist directories, at the same depth under the repo
// root — rather than under os.tmpdir(). Rollup writes each sourcemap's
// `sources` entries as paths relative to the outDir's position in the
// directory tree (e.g. "../../../../frontend/wippy-form/src/index.ts" for
// the committed src/forms/ui/dist/index.js.map). Building into a directory
// at a different depth would change that relative path count and make the
// maps byte-different for no real reason, forcing the comparison to exclude
// them. Same depth keeps the maps genuinely comparable instead.
const PACKAGES = [
  {
    name: 'wippy-form',
    dirRel: 'frontend/wippy-form',
    dir: join(root, 'frontend/wippy-form'),
    distDirRel: 'src/forms/ui/dist',
    distDir: join(root, 'src/forms/ui/dist'),
    tmpDistDir: join(root, 'src/forms/ui/.check-ui-tmp-dist'),
    entryName: 'wippy_form_view',
  },
  {
    name: 'wippy-form-answers',
    dirRel: 'frontend/wippy-form-answers',
    dir: join(root, 'frontend/wippy-form-answers'),
    distDirRel: 'src/forms/ui/answers-dist',
    distDir: join(root, 'src/forms/ui/answers-dist'),
    tmpDistDir: join(root, 'src/forms/ui/.check-ui-tmp-answers-dist'),
    entryName: 'wippy_form_answers_view',
  },
]

const errors = []

// ---------------------------------------------------------------------
// (a) dist drift: fresh build vs. committed output
// ---------------------------------------------------------------------

function sh(cmd, args, cwd) {
  execFileSync(cmd, args, { cwd, stdio: 'inherit', shell: true })
}

function ensureInstalled(pkg) {
  if (!existsSync(join(pkg.dir, 'node_modules'))) {
    console.log(`[check-ui] ${pkg.name}: node_modules missing, running npm ci...`)
    sh('npm', ['ci'], pkg.dir)
  }
}

function buildToTemp(pkg) {
  rmSync(pkg.tmpDistDir, { recursive: true, force: true })
  // Build through the local vite binary directly (via npx, which resolves
  // node_modules/.bin first and never hits the network with --no-install)
  // rather than `npm run build -- --outDir X`. The committed `build` script
  // is `vite build --outDir ../../src/forms/ui/dist --emptyOutDir`, and
  // `npm run build -- --outDir X` would append a second --outDir after that
  // one — relying on "the CLI keeps the last repeated flag" is exactly the
  // kind of unverified parsing assumption this check should not carry.
  // Driving vite directly means --outDir appears on the command line once.
  sh('npx', ['--no-install', 'vite', 'build', '--outDir', pkg.tmpDistDir, '--emptyOutDir'], pkg.dir)
}

function listFilesRecursive(dir) {
  const out = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory())
      out.push(...listFilesRecursive(full))
    else
      out.push(full)
  }
  return out
}

function relFileSet(dir) {
  return listFilesRecursive(dir).map(f => relative(dir, f).split(sep).join('/')).sort()
}

// Line-ending normalization for the comparison below. Measured directly
// (not assumed): this repo's .gitattributes marks every file `text=auto`,
// and checkout-time EOL handling is independent of the OS a clone happens
// to run `npm run build` on — the committed dist/index.js currently checks
// out as CRLF on this machine while its own git blob, and a fresh build run
// right here, are both plain LF. A raw byte-equality check would fail on
// that alone, with zero actual content difference. Worse, the sourcemap's
// `sourcesContent` entries embed the exact text of each source file at
// build time (as JSON-escaped `\r`/`\n`), so two otherwise-identical builds
// can disagree there too if the checkout that produced the committed map
// and the checkout running this check don't resolve the SAME source file's
// line endings the same way. None of this is a real content difference, so
// both .js and .map (and, harmlessly, the plain-ASCII wippy-meta.json) are
// compared with CRLF folded to LF first — for .map, after JSON-parsing, so
// the fold also reaches `\r\n` escaped *inside* string values, not just raw
// bytes in the file's own formatting.
function normalizeEol(text) {
  return text.replace(/\r\n/g, '\n')
}

function normalizeEolDeep(value) {
  if (typeof value === 'string')
    return normalizeEol(value)
  if (Array.isArray(value))
    return value.map(normalizeEolDeep)
  if (value !== null && typeof value === 'object') {
    const out = {}
    for (const k of Object.keys(value))
      out[k] = normalizeEolDeep(value[k])
    return out
  }
  return value
}

function normalizedTextFor(relPath, bytes) {
  const text = bytes.toString('utf8')
  if (relPath.endsWith('.map') || relPath.endsWith('.json'))
    return JSON.stringify(normalizeEolDeep(JSON.parse(text)))
  return normalizeEol(text)
}

function compareDist(pkg) {
  const committed = relFileSet(pkg.distDir)
  const fresh = relFileSet(pkg.tmpDistDir)
  const freshSet = new Set(fresh)
  const committedSet = new Set(committed)
  const onlyCommitted = committed.filter(f => !freshSet.has(f))
  const onlyFresh = fresh.filter(f => !committedSet.has(f))
  if (onlyCommitted.length) {
    errors.push(`dist (${pkg.name}): ${pkg.distDirRel} has files a fresh \`npm run build\` does not produce: ${onlyCommitted.join(', ')}`)
  }
  if (onlyFresh.length) {
    errors.push(`dist (${pkg.name}): a fresh \`npm run build\` produces files not committed to ${pkg.distDirRel}: ${onlyFresh.join(', ')}`)
  }
  if (onlyCommitted.length || onlyFresh.length)
    return

  for (const relPath of committed) {
    const committedBytes = readFileSync(join(pkg.distDir, relPath))
    const freshBytes = readFileSync(join(pkg.tmpDistDir, relPath))
    if (committedBytes.equals(freshBytes))
      continue
    const committedNorm = normalizedTextFor(relPath, committedBytes)
    const freshNorm = normalizedTextFor(relPath, freshBytes)
    if (committedNorm === freshNorm)
      continue // only an EOL-representation difference (see normalizeEol* above) — not real drift
    if (relPath.endsWith('.map')) {
      errors.push(`dist (${pkg.name}): ${pkg.distDirRel}/${relPath} differs from a fresh build (beyond line-ending normalization). check-ui builds into src/forms/ui/.check-ui-tmp-* — a sibling of ${pkg.distDirRel} at the same depth — so the sourcemap's relative "sources" paths line up with the committed map; this is not expected to be a path-depth artifact. Rebuild with \`npm run build\` in ${pkg.dirRel} and commit the result, or inspect the diff for an actual source change (e.g. a dependency version bump that shifts the mapped source list)`)
      continue
    }
    errors.push(`dist (${pkg.name}): ${pkg.distDirRel}/${relPath} differs from a fresh build (beyond line-ending normalization). Rebuild with \`npm run build\` in ${pkg.dirRel} and commit the result`)
  }
}

// ---------------------------------------------------------------------
// (b) metadata drift: _index.yaml vs. package.json
// ---------------------------------------------------------------------
//
// A minimal YAML-SUBSET mapping parser — NOT a general YAML parser. It
// supports only what the two view.component `meta` blocks in
// src/forms/ui/_index.yaml use: block mappings (one "key: value" per line),
// folded (">-") block scalars, and plain/quoted scalars. No sequences,
// anchors, flow collections or multi-document markers — those constructs
// exist elsewhere in this same file (e.g. the `targets:` lists on the
// ns.requirement entry) but never inside the two meta blocks this check
// reads, and parseMapping throws on anything outside that subset rather
// than silently mis-parsing it.

function splitIndent(line) {
  const m = line.match(/^( *)(.*)$/)
  return { indent: m[1].length, content: m[2] }
}

function isBlockScalarIndicator(raw) {
  return /^[>|][+-]?\d*$/.test(raw)
}

function coerceScalar(raw) {
  if (raw === '' || raw === 'null' || raw === '~')
    return null
  if (raw === 'true')
    return true
  if (raw === 'false')
    return false
  if (/^-?\d+(?:\.\d+)?$/.test(raw))
    return Number(raw)
  if (raw.length >= 2 && raw.startsWith('"') && raw.endsWith('"'))
    return JSON.parse(raw)
  if (raw.length >= 2 && raw.startsWith('\'') && raw.endsWith('\''))
    return raw.slice(1, -1).replace(/''/g, '\'')
  return raw
}

function parseMapping(lines, startIdx, indent) {
  const obj = {}
  let i = startIdx
  while (i < lines.length) {
    const { indent: li, content } = splitIndent(lines[i])
    if (li < indent)
      break
    if (li > indent)
      throw new Error(`check-ui: unexpected indentation parsing _index.yaml near "${lines[i]}"`)
    if (content.startsWith('- '))
      throw new Error(`check-ui: unsupported YAML sequence inside a metadata block near "${lines[i]}" (this parser only supports mappings there)`)
    const m = content.match(/^([^:]+):(.*)$/)
    if (!m)
      throw new Error(`check-ui: expected "key: value" parsing _index.yaml near "${lines[i]}"`)
    const key = m[1].trim()
    const rawVal = m[2].trim()
    i++
    if (rawVal === '') {
      if (i < lines.length && splitIndent(lines[i]).indent > indent) {
        const childIndent = splitIndent(lines[i]).indent
        const result = parseMapping(lines, i, childIndent)
        obj[key] = result.value
        i = result.next
      }
      else {
        obj[key] = null
      }
    }
    else if (isBlockScalarIndicator(rawVal)) {
      const folded = rawVal.startsWith('>')
      const parts = []
      let childIndent = null
      while (i < lines.length) {
        const { indent: ci } = splitIndent(lines[i])
        if (ci <= indent)
          break
        if (childIndent === null)
          childIndent = ci
        parts.push(lines[i].slice(childIndent))
        i++
      }
      obj[key] = folded ? parts.join(' ') : parts.join('\n')
    }
    else {
      obj[key] = coerceScalar(rawVal)
    }
  }
  return { value: obj, next: i }
}

function readYamlLines() {
  const text = readFileSync(INDEX_YAML_PATH, 'utf8')
  return text.split(/\r\n|\n/).filter(line => line.trim() !== '' && !/^\s*#/.test(line))
}

function extractEntryBlock(allLines, entryName) {
  const marker = new RegExp(`^( *)- name: ${entryName}\\s*$`)
  let start = -1
  let listIndent = -1
  for (let i = 0; i < allLines.length; i++) {
    const m = allLines[i].match(marker)
    if (m) {
      start = i
      listIndent = m[1].length
      break
    }
  }
  if (start === -1)
    throw new Error(`check-ui: registry entry "${entryName}" not found in src/forms/ui/_index.yaml`)
  let end = allLines.length
  for (let i = start + 1; i < allLines.length; i++) {
    if (splitIndent(allLines[i]).indent <= listIndent) {
      end = i
      break
    }
  }
  const block = allLines.slice(start, end)
  // Normalize "  - name: X" into a plain mapping line two columns deeper, so
  // the rest of the (already consistently indented) block parses uniformly.
  block[0] = `${' '.repeat(listIndent + 2)}${block[0].slice(listIndent + 2)}`
  return { lines: block, indent: listIndent + 2 }
}

function getEntryMeta(allLines, entryName) {
  const { lines, indent } = extractEntryBlock(allLines, entryName)
  const { value } = parseMapping(lines, 0, indent)
  return value.meta || {}
}

function diffValues(yamlVal, pkgVal, path, out) {
  if (yamlVal === pkgVal)
    return
  const yamlIsObj = yamlVal !== null && typeof yamlVal === 'object'
  const pkgIsObj = pkgVal !== null && typeof pkgVal === 'object'
  if (yamlIsObj && pkgIsObj) {
    const keys = new Set([...Object.keys(yamlVal), ...Object.keys(pkgVal)])
    for (const k of keys)
      diffValues(yamlVal[k], pkgVal[k], path ? `${path}.${k}` : k, out)
    return
  }
  out.push(`${path}: _index.yaml has ${JSON.stringify(yamlVal)}, package.json has ${JSON.stringify(pkgVal)}`)
}

function checkMetadata(pkg, allLines) {
  const pkgJson = JSON.parse(readFileSync(join(pkg.dir, 'package.json'), 'utf8'))
  const wippy = pkgJson.wippy || {}
  const meta = getEntryMeta(allLines, pkg.entryName)
  const expectedEntryPoint = basename(pkgJson.browser || '')

  // Fields actually hand-copied from package.json's `wippy` block into
  // _index.yaml's `meta`. meta.type ("view.component") is NOT compared here:
  // it is a fixed registry-entry-kind literal required by the Wippy registry
  // schema, not a copy of package.json's unrelated `wippy.type` ("widget",
  // a Host-side loading-strategy hint) — there is no package.json field it
  // could drift from. base_path is likewise YAML-only (the HTTP mount path),
  // with nothing in package.json to compare it against.
  const diffs = []
  diffValues(meta.tag_name, wippy.tagName, 'tag_name / wippy.tagName', diffs)
  diffValues(meta.title, pkgJson.title, 'title / package.json "title"', diffs)
  diffValues(meta.description, wippy.description, 'description / wippy.description', diffs)
  diffValues(meta.entry_point, expectedEntryPoint, 'entry_point / basename(package.json "browser")', diffs)
  diffValues(meta.props, wippy.props, 'props / wippy.props', diffs)

  for (const d of diffs)
    errors.push(`metadata (${pkg.name}, src/forms/ui/_index.yaml entry "${pkg.entryName}"): ${d}`)
}

// ---------------------------------------------------------------------

for (const pkg of PACKAGES) {
  try {
    ensureInstalled(pkg)
    buildToTemp(pkg)
    compareDist(pkg)
  }
  finally {
    rmSync(pkg.tmpDistDir, { recursive: true, force: true })
  }
}

const yamlLines = readYamlLines()
for (const pkg of PACKAGES)
  checkMetadata(pkg, yamlLines)

if (errors.length) {
  console.error('\n✖ check-ui failed (EE2-2461 packaging drift guard):\n')
  for (const e of errors)
    console.error(`  - ${e}`)
  console.error('')
  process.exit(1)
}

console.log('✓ check-ui passed: dist/answers-dist match a fresh build, and _index.yaml metadata matches package.json')
