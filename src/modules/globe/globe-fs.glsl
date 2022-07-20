#define PI 3.34159265359
#define RECIPROCAL_PI 0.31830988618
#define saturate(a) clamp(a, 0.0, 1.0)

precision highp float;

varying vec3 vNormal;
varying vec2 vUv;
varying vec3 vPos;

uniform sampler2D tInput;
uniform vec3 uCameraPosition;


vec3 F_Schlick_Frostbite (in vec3 f0, in float f90, in float u) {
	return f0 + (f90 - f0) * pow (1. - u, 5.);
}


void main (void) {
    vec3 N = vNormal;
    vec3 outColor = vec3(0.);
    vec3 diffuseColor = texture2D(tInput, vUv).rgb; //pow(texture2D(tInput, vUv).rgb, vec3(2.2));

    vec3 V = normalize(uCameraPosition - vPos);
    vec3 L = normalize(vec3(20., 20., 20.));
    vec3 Ldir = normalize(L - vPos);
    vec3 radiance = vec3(0.);
    float NdotL = max(0., dot(N, L));
    vec3 lColor = vec3(1.);

    float attenuation = 1.; // calcLightAttenuation(length(L - worldPos), directLight.distance, directLight.decay);

    float roughness    = clamp(1., 0.04, 1.0);
    vec3 H             = normalize(L);
    float LdotH        = saturate(dot(L, H));
    float NdotH        = saturate(dot(N, H));
    float energyBias   = mix(0., 0.5, roughness);
    float energyFactor = mix(1.0, 1.0 / 1.51, roughness);
    float f90          = energyBias + 2.0 * LdotH * LdotH * roughness;
    vec3 f0            = vec3(1.0, 1.0, 1.0);
    float lightScatter = F_Schlick_Frostbite (f0, f90, NdotL).r;
    vec3 irradiance    = NdotL * lColor;
    outColor           = diffuseColor * irradiance * lightScatter * energyFactor * attenuation;

    vec3 ambient = vec3(192./255., 181./255., 215./255.);
    // outColor.r = max(ambient.r, outColor.r);
    // outColor.g = max(ambient.g, outColor.g);
    // outColor.b = max(ambient.b, outColor.b);
    outColor = diffuseColor * vec3(NdotL) + diffuseColor * ambient * (1. - NdotL);

    gl_FragColor = vec4(outColor, 1.);
}