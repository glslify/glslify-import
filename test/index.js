const glslify = require('glslify')
const path    = require('path')
const test    = require('tape')
const origin  = path.join(__dirname, 'fixtures', 'basic-origin.glsl')

test('glslify-import', function(t) {
  glslify.bundle(origin, {
    transform: [ require.resolve('../index.js') ]
  }, function(err, src) {
    if (err) throw err

    t.ok(/\sunaltered\s/.exec(src), 'unaltered variable is unaltered')
    t.ok(/basicRequire/.exec(src), 'basic-require.glsl imported dependency is still included')
    t.end()
  })
})
