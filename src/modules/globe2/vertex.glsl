attribute vec2 uv;
attribute vec3 position;
attribute vec3 normal;
uniform mat4 modelMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;
uniform vec3 u_lightWorldPosition;
uniform vec3 cameraPosition;

varying vec3 v_normal;
varying vec3 v_surfaceToLight;
varying vec3 v_surfaceToView;
varying vec2 v_uv;

void main () {
    // Pass UV information to Fragment Shader
    v_uv = uv;

    // Calculate World Space Normal
    v_normal = normalMatrix * normal;

    // Compute the world position of the surface
    vec3 surfaceWorldPosition = mat3(modelMatrix) * position;

    // Vector from the surface, to the light
    v_surfaceToLight = u_lightWorldPosition - surfaceWorldPosition;

    // Vector from the surface, to the camera
    v_surfaceToView = cameraPosition - surfaceWorldPosition;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}