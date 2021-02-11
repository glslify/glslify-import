export default /* glsl */ `
#include <header>

void main() {

	#include <main>

	float before = 0;

	vec4 diffuseColor = vec4( diffuse, opacity );

	#include <chunk>

	float after = 1;
}
`;
