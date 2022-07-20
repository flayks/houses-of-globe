precision highp float;

uniform float alpha;
varying vec3 vColor;
varying vec2 vUv;

uniform vec2 offset;

#ifdef USE_MAP
	uniform sampler2D map;
	uniform vec2 mapOffset;
#endif

#ifdef USE_ALPHA_MAP
	uniform sampler2D alphaMap;
	uniform vec2 alphaMapOffset;
#endif


uniform vec3 color;

void main(void) {

	vec4 color = vec4(color, alpha);

	#ifdef USE_MAP
		color = texture2D(map, vUv + offset);
		color.a *= alpha;
	#endif

    gl_FragColor = color;

}