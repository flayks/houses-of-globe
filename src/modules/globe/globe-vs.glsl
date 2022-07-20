precision highp float;

attribute vec3 normal;
attribute vec3 position;
attribute vec2 uv;

uniform mat4 uMVMatrix;
uniform mat4 uMMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNormalMatrix;
uniform float uCameraOffsetY;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPos;


void main(void) {
    vUv = uv;
    vNormal = (uNormalMatrix * vec4(normal, 1.)).rgb;
    vPos = (uMMatrix * vec4(position, 1.)).rgb;
    gl_Position = uPMatrix * uMVMatrix * vec4(position, 1.0);
    gl_Position[1] += uCameraOffsetY * gl_Position.w;
}