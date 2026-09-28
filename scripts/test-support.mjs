import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';
const cache = new Map();
export function load(file) {
  const absolute = path.resolve(file);
  if (cache.has(absolute)) return cache.get(absolute);
  const source = ts.transpileModule(fs.readFileSync(absolute, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const exports = {};
  cache.set(absolute, exports);
  vm.runInNewContext(source, { exports, Intl, console, require: name => {
    if (!name.startsWith('.')) throw new Error(`Unexpected test dependency: ${name}`);
    return load(path.resolve(path.dirname(absolute), name + '.ts'));
  } }, { filename: absolute });
  return exports;
}
