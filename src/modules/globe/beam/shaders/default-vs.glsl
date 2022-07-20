precision highp float;

attribute vec2 uv;
attribute vec3 position;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

varying vec2 vUv;

void main(void) {
	vUv = uv;
    gl_Position = uPMatrix * uMVMatrix * vec4(position, 1.0);
}