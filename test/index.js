const glslify = require('glslify')
const path = require('path')
const test = require('tape')

const recursive = path.join(__dirname, 'fixtures', 'recursive-origin.glsl')
const basic = path.join(__dirname, 'fixtures', 'basic-origin.glsl')
const importRequire = path.join(__dirname, 'fixtures', 'import-with-require.glsl')

test('glslify-import: basic', function (t) {
  var src = glslify(basic, {
    transform: [ require.resolve('../index.js') ]
  });
  t.ok(/\sunaltered\s/.exec(src), 'unaltered variable is unaltered')
  t.ok(/basicRequire/.exec(src), 'basic-require.glsl imported dependency is still included')
  t.end()
})

test('glslify-import: recursive', function (t) {
  var src = glslify(recursive, {
    transform: [ require.resolve('../index.js') ]
  });

  t.ok(/\sunaltered\s/.exec(src), 'unaltered variable is unaltered')
  t.ok(/basicRequire/.exec(src), 'basic-require.glsl imported dependency is still included')
  t.ok(!/\#pragma glslify/.exec(src), 'no pragmas remaining')
  t.equal(src.match(/main\(\)/g).length, 2, '2 copies imported')
  t.equal(src.match(/\#define GLSLIFY/).length, 1, 'only 1 glslify definition')
  t.end()
})

test('glslify-import: require paths modified', function (t) {
  var src = glslify(importRequire, {
    transform: [ require.resolve('../index.js') ]
  });

  t.ok(/basicRequire/.exec(src), 'basic-require.glsl imported dependency is still included')
  t.ok(/subRequire1/.exec(src), 'subfolder-1/basic-require.glsl imported dependency is still included')
  t.ok(/subRequire2/.exec(src), 'subfolder-2/basic-require.glsl imported dependency is still included')
  t.ok(!/\#pragma glslify/.exec(src), 'no pragmas remaining')
  t.end()
})
