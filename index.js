const string = require('glsl-token-string')
const tokenize = require('glsl-tokenizer')
const resolve = require('glsl-resolve')
const path = require('path')
const fs = require('fs')

module.exports = glslifyImport

function glslifyImport (file, src, opts, done) {
  const tokens = tokenize(src)

  var total = 0

  for (var i = 0; i < tokens.length; i++) (function (i) {
    var token = tokens[i]
    if (token.type !== 'preprocessor') return

    var imported = /#pragma glslify:\s*import\(([^\)]+)\)/.exec(token.data)
    if (!imported) return
    if (!imported[1]) return

    var target = imported[1]
      .trim()
      .replace(/^'|'$/g, '')
      .replace(/^"|"$/g, '')

    total++

    resolve(target, {
      basedir: path.dirname(file)
    }, function (err, resolved) {
      if (err) return done(err)

      fs.readFile(resolved, 'utf8', function (err, contents) {
        if (err) return done(err)

        glslifyImport(resolved, contents, opts, function (err, contents) {
          if (err) return done(err)

          token.data = contents
          if (--total) return

          done(null, string(tokens))
        })
      })
    })
  })(i)

  if (!total) return done(null, src)
}
