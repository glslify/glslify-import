const string = require('glsl-token-string');
const tokenize = require('glsl-tokenizer');
const resolve = require('glsl-resolve');
const path = require('path');
const fs = require('fs');

module.exports = glslifyImport;
module.exports.sync = glslifyImport;

function glslifyImport(file, src, opts, done) {
  const tokens = tokenize(src);

  var total = 0;

  for (var i = 0; i < tokens.length; i++)
    (function (i) {
      var token = tokens[i];
      if (token.type !== 'preprocessor') return;

      var imported = /#pragma glslify:\s*import(.+)/.exec(token.data);

      if (!imported) return;

      imported = imported[0].match(
        /\((?:[^)(]+|\((?:[^)(]+|\([^)(]*\))*\))+\)/g
      );

      if (!imported[0]) return;

      imported = imported.map(function (str) {
        return str
          .trim()
          .replace(/^\(|\)$/g, '')
          .replace(/^'|'$/g, '')
          .replace(/^"|"$/g, '');
      });

      var target = imported[0];

      var chunkPattern;
      var chunkFlags;

      if (imported[1]) {
        var chunkParts = imported[1].split('/');
        chunkPattern = chunkParts[1];
        chunkFlags = chunkParts.slice(-1);
      }

      total++;

      var basedir = path.dirname(file);

      if (typeof done === 'function') {
        resolve(target, { basedir: basedir }, function (err, resolved) {
          if (err) return done(err);

          fs.readFile(resolved, 'utf8', function (err, contents) {
            if (err) return done(err);

            contents = extractChunk(contents, chunkPattern, chunkFlags);
            contents = modifyRequirePaths(contents, basedir, target);

            glslifyImport(resolved, contents, opts, function (err, contents) {
              if (err) return done(err);

              token.data = contents;
              if (--total) return;

              done(null, string(tokens));
            });
          });
        });
      } else {
        var resolved = resolve.sync(target, { basedir: basedir });
        var contents = fs.readFileSync(resolved, 'utf8');

        contents = extractChunk(contents, chunkPattern, chunkFlags);
        contents = modifyRequirePaths(contents, basedir, target);

        token.data = glslifyImport(resolved, contents, opts);

        total--;
      }
    })(i);

  if (!total)
    return typeof done === 'function' ? done(null, src) : string(tokens);
}

function extractChunk(contents, chunkPattern, chunkFlags) {
  if (chunkPattern) {
    var chunkContents = new RegExp(chunkPattern, chunkFlags).exec(contents);

    if (chunkContents && chunkContents[1]) {
      contents = chunkContents[1];
    }
  }

  return contents;
}

function modifyRequirePaths(src, basedir, baseTarget) {
  const tokens = tokenize(src);

  var targetDir = path.dirname(path.resolve(basedir, baseTarget));

  for (var i = 0; i < tokens.length; i++) {
    var token = tokens[i];
    if (token.type !== 'preprocessor') continue;

    var required = /#pragma glslify:\s*([^=\s]+)\s*=\s*require\(([^\)]+)\)/.exec(
      token.data
    );
    if (!required) continue;
    if (!required[2]) continue;

    var name = required[1];
    var maps = required[2].split(/\s?,\s?/g);
    var target = maps
      .shift()
      .trim()
      .replace(/^'|'$/g, '')
      .replace(/^"|"$/g, '');

    var resolvedTarget = path.resolve(targetDir, target);

    if (name) {
      token.data =
        '#pragma glslify: ' +
        name +
        ' = require("' +
        [resolvedTarget].concat(maps).join(', ') +
        '")';
    } else {
      token.data =
        '#pragma glslify: require("' +
        [resolvedTarget].concat(maps).join(', ') +
        '")';
    }
  }

  return string(tokens);
}
