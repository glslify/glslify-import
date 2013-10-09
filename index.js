var combine = require('stream-combiner')
var glslify = require('glslify-stream')
var concat = require('concat-stream')
var map = require('map-stream')
var fs = require('graceful-fs')
var split = require('split')
var eol = require('os').EOL

module.exports = include

function include(file) {
  var stream = combine(split(), map(write))

  return stream

  function write(line, next) {
    var cache = {}
    var match

    line = String(line)
    line = line.replace(/^\s*?#pragma\s+import\:(.+)$/g, function(full, name) {
      match = name.trim()
      return ''
    })

    if (!match) return next(null, line + eol)

    glslify.resolve(file, match, function(err, dest) {
      if (err) return stream.emit('error', err)
      if (cache[dest]) return next(null, cache[dest])

      // Handle imports recursively too!
      fs.createReadStream(dest)
        .on('error', error)
        .pipe(include(dest))
        .on('error', error)
        .pipe(concat(function(data) {
          next(null, cache[dest] = data + eol)
        }))
        .on('error', error)

      function error(err) {
        return stream.emit('error', err)
      }
    })
  }
}
