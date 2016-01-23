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

    var basedir = path.dirname(file)

    resolve(target, {
      basedir: basedir
    }, function (err, resolved) {
      if (err) return done(err)

      fs.readFile(resolved, 'utf8', function (err, contents) {
        if (err) return done(err)

        contents = modifyRequirePaths(contents, basedir, target)

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

function modifyRequirePaths (src, basedir, baseTarget) {
  const tokens = tokenize(src)

  var targetDir = path.dirname(path.resolve(basedir, baseTarget))

  for (var i = 0; i < tokens.length; i++) {
    var token = tokens[i]
    if (token.type !== 'preprocessor') continue

    var required = /#pragma glslify:\s*([^=\s]+)\s*=\s*require\(([^\)]+)\)/.exec(token.data)
    if (!required) continue
    if (!required[2]) continue

    var name = required[1]
    var maps = required[2].split(/\s?,\s?/g)
    var target = maps.shift()
      .trim()
      .replace(/^'|'$/g, '')
      .replace(/^"|"$/g, '')

    var resolvedTarget = path.resolve(targetDir, target)

    if (name) {
      token.data = '#pragma glslify: ' + name + ' = require("' + [resolvedTarget].concat(maps).join(', ') + '")'
    } else {
      token.data = '#pragma glslify: require("' + [resolvedTarget].concat(maps).join(', ') + '")'
    }
  }

  return string(tokens)
}
