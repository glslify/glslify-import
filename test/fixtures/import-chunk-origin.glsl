#pragma glslify: import('./import-chunk.glsl.js')(/`(.*)void main/gs)

void main() {
  #pragma glslify: import('./import-chunk.glsl.js')(/void main\(\) {(.*)`/gs)

  gl_FragCoord = imported();
}
