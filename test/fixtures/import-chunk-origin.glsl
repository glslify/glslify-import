#pragma glslify: import('./import-chunk.glsl.js')(/`(.*)void main/gs)

void main() {
  #pragma glslify: import('./import-chunk.glsl.js')(/void main() {(.*)vec4 diffuseColor/gs)

  vec4 diffuseColor = vec4( diffuse, opacity );

  #pragma glslify: import('./import-chunk.glsl.js')(/vec4 diffuseColor([^;]+);(?<chunk>.*)}/gs)

  gl_FragCoord = imported();
}
