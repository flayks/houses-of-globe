precision highp float;

uniform float alpha;
varying vec2 vUv;

void main(void) {
    gl_FragColor = vec4( vec3(1., 1., 1.), alpha);
}