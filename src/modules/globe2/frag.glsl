precision highp float;
varying vec3 v_normal;
varying vec3 v_surfaceToLight;
varying vec3 v_surfaceToView;
varying vec2 v_uv;
uniform float u_dt;
uniform float u_shininess;
uniform sampler2D map;

void main() {
    // Re-normalize interpolated varyings
    vec3 normal = normalize(v_normal);
    vec3 surfaceToLightDirection = normalize(v_surfaceToLight);
    vec3 surfaceToViewDirection = normalize(v_surfaceToView);
    // Calculate Half-Vector, Vector that bisects the angle of reflection.
    // This vector indecates the "brightest point" A "refrence vector" if you will.
    vec3 halfVector = normalize(surfaceToLightDirection + surfaceToViewDirection);
    // Then we can get the brightness at any point by seeing "how similar" the surface normal is to the refrence vector.
    float light = dot(normal, surfaceToLightDirection);

    // By raising the specular vector to a power we can control the intensity of the light
    float specular = 0.0;

    if (light > 0.0) {
        specular = pow(dot(normal, halfVector), u_shininess * 100.0);
    }

    // Mapping textures
    vec4 map = texture2D(map, v_uv).rgba;
    // vec3 spec = texture2D(specMap, v_uv).rgb;

    gl_FragColor.rgba = map;
    // Add Point Lighting
    gl_FragColor.rgba *= light;
    // Add Specular Highlights
    // gl_FragColor.rgb += specular * spec;
}