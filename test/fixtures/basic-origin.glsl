#pragma glslify: import('./basic-import-1.glsl')
#pragma glslify: import('./basic-import-2.glsl')

void main() {
  gl_FragCoord = imported();
}
