#!/usr/bin/env node
// EE2-2461: Session frontend packaging drift guard.
//
// Modeled on the Host's scripts/check-import-map-drift.mjs. It fails when a
// hand-maintained copy of some data disagrees with its source of truth. It
// runs three independent checks:
//
//   (a) Dist check. The committed src/forms/ui/dist (wippy-form) and
//       src/forms/ui/answers-dist (wippy-form-answers) bundles must match a
//       fresh build of each package. It catches a source edit that was not
//       rebuilt.
//
//   (b) Metadata check. The view.component registry entries in
//       src/forms/ui/_index.yaml copy each package's package.json `wippy`
//       block (tag name, description, props, entry point), because the
//       registry loader needs that metadata inline and does not read
//       package.json at load time (see the comment at the top of
//       _index.yaml). The check fails when the copy disagrees with the
//       package.json it was copied from.
//
//   (c) Publish manifest check. The module manifest (src/wippy.yaml) must
//       list every fs.directory entry under src/ in `embed:`, so the
//       published pack ships the bundles, and no second manifest may sit at
//       the repository root (see checkPublishManifest).
//
// The metadata is checked rather than generated because _index.yaml is a
// hand-authored, commented config file. Its registry entries must carry the
// metadata inline, and it also holds fields with no package.json equivalent
// (auto_register, announced, base_path, the HTTP serving entries).
// Generating the file from package.json would turn it into partly generated
// output for five fields, while a check keeps one authored file and still
// fails on a copy that drifted.
import { execFileSync, execSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync, rmSync } from 'node:fs'
import { createRequire } from 'node:module'
import { basename, dirname, join, relative, sep } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const INDEX_YAML_PATH = join(root, 'src/forms/ui/_index.yaml')
const SRC_DIR = join(root, 'src')
const MANIFEST_PATH = join(SRC_DIR, 'wippy.yaml')
const REPO_MANIFEST_PATH = join(root, 'wippy.yaml')

// The temp build output lives under src/forms/ui/, beside the real dist and
// answers-dist directories and at the same depth under the repo root, and
// not under os.tmpdir(). Rollup writes each sourcemap's `sources` entries as
// paths relative to the outDir (e.g. "../../../../frontend/wippy-form/src/index.ts"
// for the committed src/forms/ui/dist/index.js.map). An outDir at another
// depth would change those paths, so the maps would differ for no real
// reason and the comparison would have to skip them.
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

// js-yaml is a devDependency of frontend/wippy-form. The script has no
// package.json of its own, so it loads the parser from that package.
const YAML_OWNER = PACKAGES[0]

const errors = []

// ---------------------------------------------------------------------
// (a) dist drift: fresh build vs. committed output
// ---------------------------------------------------------------------

// `npm` is a .cmd file on Windows, and Node runs .cmd files only through a
// shell. The command is a fixed string with no paths in it (the package
// directory is passed as the working directory), so the shell has nothing
// to quote.
function ensureInstalled(pkg) {
  if (existsSync(join(pkg.dir, 'node_modules')))
    return
  console.log(`[check-ui] ${pkg.name}: node_modules missing, running npm ci...`)
  execSync('npm ci', { cwd: pkg.dir, stdio: 'inherit' })
}

// Runs the package's own vite build with node and vite's JavaScript entry
// point, with the arguments as an array and no shell, so a repo path with
// spaces reaches vite intact. The committed `build` script is not reused:
// `npm run build -- --outDir X` would add a second --outDir after the one
// in the script, and which one vite keeps is not something this check
// should depend on. Here --outDir appears once.
function buildToTemp(pkg) {
  rmSync(pkg.tmpDistDir, { recursive: true, force: true })
  const vitePackagePath = createRequire(join(pkg.dir, 'package.json')).resolve('vite/package.json')
  const viteBin = join(dirname(vitePackagePath), JSON.parse(readFileSync(vitePackagePath, 'utf8')).bin.vite)
  execFileSync(process.execPath, [viteBin, 'build', '--outDir', pkg.tmpDistDir, '--emptyOutDir'],
    { cwd: pkg.dir, stdio: 'inherit' })
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

// Line endings are folded before the comparison. The repo's .gitattributes
// marks every file `text=auto`, so a Windows checkout can hold the committed
// dist/index.js with CRLF while its git blob, and a fresh build, use LF. A
// raw byte comparison would fail on that alone. The sourcemap's
// `sourcesContent` entries also embed each source file's text as it was
// checked out at build time (as JSON-escaped `\r`/`\n`), so two builds of
// the same source can differ there too. None of that is a content change,
// so .js, .map and wippy-meta.json are compared with CRLF folded to LF. For
// .map and .json the fold runs after JSON parsing, so it also reaches the
// escaped `\r\n` inside string values.
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
      continue // only the line endings differ (see normalizeEol above)
    if (relPath.endsWith('.map')) {
      errors.push(`dist (${pkg.name}): ${pkg.distDirRel}/${relPath} differs from a fresh build (beyond line-ending normalization). check-ui builds into src/forms/ui/.check-ui-tmp-*, beside ${pkg.distDirRel} at the same depth, so the sourcemap's relative "sources" paths match the committed map and the difference is not a path-depth effect. Rebuild with \`npm run build\` in ${pkg.dirRel} and commit the result, or inspect the diff for a real source change (e.g. a dependency version bump that changes the mapped source list)`)
      continue
    }
    errors.push(`dist (${pkg.name}): ${pkg.distDirRel}/${relPath} differs from a fresh build (beyond line-ending normalization). Rebuild with \`npm run build\` in ${pkg.dirRel} and commit the result`)
  }
}

// ---------------------------------------------------------------------
// (b) metadata drift: _index.yaml vs. package.json
// ---------------------------------------------------------------------

function loadJsYaml() {
  try {
    return createRequire(join(YAML_OWNER.dir, 'package.json'))('js-yaml')
  }
  catch (err) {
    throw new Error(`check-ui: cannot load js-yaml from ${YAML_OWNER.dirRel} (run \`npm ci\` there): ${err.message}`)
  }
}

function loadYaml(yaml) {
  return yaml.load(readFileSync(INDEX_YAML_PATH, 'utf8'))
}

function getEntryMeta(indexYaml, entryName) {
  const entries = Array.isArray(indexYaml?.entries) ? indexYaml.entries : []
  const entry = entries.find(e => e && e.name === entryName)
  if (!entry)
    throw new Error(`check-ui: registry entry "${entryName}" not found in src/forms/ui/_index.yaml`)
  return entry.meta || {}
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

function checkMetadata(pkg, indexYaml) {
  const pkgJson = JSON.parse(readFileSync(join(pkg.dir, 'package.json'), 'utf8'))
  const wippy = pkgJson.wippy || {}
  const meta = getEntryMeta(indexYaml, pkg.entryName)
  const expectedEntryPoint = basename(pkgJson.browser || '')

  // These are the fields _index.yaml's `meta` copies from package.json.
  // meta.type ("view.component") is not compared. It is the registry entry
  // kind the Wippy registry schema requires, and package.json's unrelated
  // `wippy.type` ("widget") is a Host loading hint, so there is nothing for
  // it to drift from. base_path is also YAML-only (the HTTP mount path).
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
// (c) publish manifest: the bundles must reach the published pack
// ---------------------------------------------------------------------

// `wippy publish` packs the module from the directory that holds wippy.yaml,
// and resolves a `base: module` fs.directory against that same directory. A
// pack keeps the contents of an fs.directory entry only when the manifest's
// `embed:` list (or --embed) names the entry. Without it the pack still
// carries the entry but not its files, so a published module serves no
// component bundle and nothing fails at publish time. A manifest above src/
// resolves `forms/ui/dist` to a directory that does not exist and fails the
// pack as soon as the entries are embedded; src/ is also the module root a
// workspace replacement of this checkout resolves from.
function checkPublishManifest(yaml) {
  if (existsSync(REPO_MANIFEST_PATH)) {
    errors.push('publish (wippy.yaml): the manifest sits above src/, so `wippy publish` resolves base: module directories against the repository root instead of src/. Keep it in src/wippy.yaml and publish with --config <checkout>/src')
  }
  if (!existsSync(MANIFEST_PATH)) {
    errors.push('publish (src/wippy.yaml): the module manifest is missing')
    return
  }
  const manifest = yaml.load(readFileSync(MANIFEST_PATH, 'utf8')) || {}
  const embedded = Array.isArray(manifest.embed) ? manifest.embed : []

  const directories = []
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name)
      if (entry.isDirectory()) {
        walk(full)
        continue
      }
      if (entry.name !== '_index.yaml')
        continue
      const doc = yaml.load(readFileSync(full, 'utf8')) || {}
      for (const item of Array.isArray(doc.entries) ? doc.entries : []) {
        if (item && item.kind === 'fs.directory')
          directories.push({ id: `${doc.namespace}:${item.name}`, item, file: relative(root, full).split(sep).join('/') })
      }
    }
  }
  walk(SRC_DIR)

  const known = new Set(directories.map(d => d.id))
  for (const { id, item, file } of directories) {
    if (!embedded.includes(id))
      errors.push(`publish (src/wippy.yaml): fs.directory "${id}" (${file}) is not in \`embed:\`, so the published pack would omit its files`)
    if (item.base === 'module' && !(existsSync(join(SRC_DIR, item.directory)) && readdirSync(join(SRC_DIR, item.directory)).length))
      errors.push(`publish (${file}): "${id}" directory "${item.directory}" is missing or empty under src/`)
  }
  for (const id of embedded) {
    if (!known.has(id))
      errors.push(`publish (src/wippy.yaml): \`embed:\` names "${id}", which is not an fs.directory entry under src/`)
  }
}

// ---------------------------------------------------------------------

const jsYaml = loadJsYaml()
checkPublishManifest(jsYaml)

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

const indexYaml = loadYaml(jsYaml)
for (const pkg of PACKAGES)
  checkMetadata(pkg, indexYaml)

if (errors.length) {
  console.error('\n✖ check-ui failed (EE2-2461 packaging drift guard):\n')
  for (const e of errors)
    console.error(`  - ${e}`)
  console.error('')
  process.exit(1)
}

console.log('✓ check-ui passed: dist/answers-dist match a fresh build, _index.yaml metadata matches package.json, and src/wippy.yaml embeds the bundles')
