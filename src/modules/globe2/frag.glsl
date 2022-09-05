precision highp float;

varying vec3 vNormal;
uniform sampler2D map;
uniform sampler2D mapDark;
varying vec2 vUv;
varying vec3 vSunDir;


void main() {
    vec3 dayColor = texture2D( map, vUv ).rgb;
    vec3 nightColor = texture2D( mapDark, vUv ).rgb;

    float cosineAngleSunToNormal = dot(normalize(vNormal), normalize(vSunDir));

    cosineAngleSunToNormal = clamp(cosineAngleSunToNormal * 1.0, -1.0, 1.0);

    float mixAmount = cosineAngleSunToNormal * 0.5 + 0.5;

    vec3 color = mix(nightColor, dayColor, mixAmount);

    gl_FragColor = vec4(color, 1.0);
}
