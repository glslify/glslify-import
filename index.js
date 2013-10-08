var combine = require('stream-combiner')
var glslify = require('glslify-stream')
var concat = require('concat-stream')
var map = require('map-stream')
var split = require('split')
var eol = require('os').EOL
var fs = require('fs')

module.exports = include

function include(file) {
  var stream = combine(split(), map(write))
  var output = ''

  return stream

  function write(line, next) {
    var match

    line = String(line)
    line = line.replace(/#pragma\s+import\:(.+)$/g, function(full, name) {
      match = name.trim()
      return ''
    })

    if (!match) return next(null, line + eol)

    glslify.resolve(file, match, function(err, dest) {
      if (err) return stream.emit('error', err)

      // Handle imports recursively too!
      fs.createReadStream(dest)
        .pipe(include(dest))
        .pipe(concat(function(data) {
          next(null, data + eol)
        }))
        .on('error', function(err) {
          return stream.emit('error', err)
        })
    })
  }
}
