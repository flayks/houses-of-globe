varying vec3 vNormal;

attribute vec2 uv;
attribute vec3 position;
attribute vec3 normal;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;
uniform float rotation;
varying vec2 vUv;
varying vec3 vSunDir;

void main() {
  vUv = uv;
  float px = sin(rotation) * 1.0;
  float pz = cos(rotation) * 1.0;
  vec3 uLightPos = vec3(px, 0.0, pz);

  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

  vNormal = normalMatrix * normal;
  vSunDir = mat3(normalMatrix) * uLightPos;

  gl_Position = projectionMatrix * mvPosition;
}
