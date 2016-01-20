#pragma glslify: import('./subfolder-1/require.glsl')

void main() {
  gl_FragCoord = imported();
  gl_FragCoord = imported1();
  gl_FragCoord = imported2();
}