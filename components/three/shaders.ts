import * as THREE from "three";

/** Compact 3D value noise shared by several shaders. */
const NOISE = /* glsl */ `
  float hash(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }
  float vnoise(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash(i), hash(i + vec3(1, 0, 0)), f.x), mix(hash(i + vec3(0, 1, 0)), hash(i + vec3(1, 1, 0)), f.x), f.y),
      mix(mix(hash(i + vec3(0, 0, 1)), hash(i + vec3(1, 0, 1)), f.x), mix(hash(i + vec3(0, 1, 1)), hash(i + vec3(1, 1, 1)), f.x), f.y),
      f.z);
  }
`;

/** Neon portal ring: HDR emissive torus with a travelling hot spot. */
export function createRingMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uIntro: { value: 0 }, uRed: { value: 0.85 } },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform float uIntro;
      uniform float uRed;
      varying vec2 vUv;
      void main() {
        float a = vUv.x;
        vec3 cyan = vec3(0.45, 0.95, 1.0);
        vec3 blue = vec3(0.06, 0.48, 1.0);
        vec3 red = vec3(1.0, 0.13, 0.27);
        vec3 col = mix(blue, cyan, 0.62 + 0.38 * sin(a * 6.2831 * 2.0 + uTime * 0.35));
        float redMask = smoothstep(0.78, 0.84, a) * (1.0 - smoothstep(0.9, 0.96, a));
        col = mix(col, red, redMask * uRed);
        float travel = pow(0.5 + 0.5 * sin((a - uTime * 0.07) * 6.2831), 24.0);
        // ignition: segments light up unevenly as uIntro rises
        float ignite = smoothstep(0.0, 0.35, uIntro - 0.65 * fract(sin(floor(a * 48.0) * 91.7) * 43758.5));
        float tube = 1.0 - abs(vUv.y - 0.5) * 2.0;
        float intensity = (2.2 + 1.6 * tube + travel * 5.0) * ignite;
        gl_FragColor = vec4(col * intensity, 1.0);
        #include <colorspace_fragment>
      }
    `,
    toneMapped: false,
  });
}

/** Soft additive glow band, used without bloom on lower tiers and as atmosphere. */
export function createHaloMaterial(color: THREE.ColorRepresentation, ringRadius = 0.385, width = 0.06) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(color) },
      uIntro: { value: 0 },
      uStrength: { value: 1 },
      uRadius: { value: ringRadius },
      uWidth: { value: width },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform float uIntro;
      uniform float uStrength;
      uniform float uRadius;
      uniform float uWidth;
      varying vec2 vUv;
      void main() {
        float r = length(vUv - 0.5);
        float band = exp(-pow((r - uRadius) / uWidth, 2.0));
        float inner = exp(-pow((r - uRadius) / (uWidth * 0.25), 2.0));
        float a = (band * 0.55 + inner * 0.6) * uIntro * uStrength;
        gl_FragColor = vec4(uColor * a, a);
        #include <colorspace_fragment>
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
  });
}

/** Dashed thin ring drawn on a RingGeometry; dashes rotate slowly. */
export function createDashedRingMaterial(color: THREE.ColorRepresentation, dashes: number, duty: number, opacity: number) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(color) },
      uTime: { value: 0 },
      uIntro: { value: 0 },
      uDashes: { value: dashes },
      uDuty: { value: duty },
      uOpacity: { value: opacity },
    },
    vertexShader: /* glsl */ `
      varying vec2 vPos;
      void main() { vPos = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform float uTime;
      uniform float uIntro;
      uniform float uDashes;
      uniform float uDuty;
      uniform float uOpacity;
      varying vec2 vPos;
      void main() {
        float ang = atan(vPos.y, vPos.x) / 6.2831853 + 0.5;
        float d = fract(ang * uDashes + uTime);
        float dash = step(d, uDuty);
        float a = dash * uOpacity * uIntro;
        gl_FragColor = vec4(uColor * 1.6, a);
        #include <colorspace_fragment>
      }
    `,
    transparent: true,
    depthWrite: false,
    toneMapped: false,
  });
}

/** Dark backplate disc behind the head with a faint grid and a blue rim. */
export function createDiscMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: { uIntro: { value: 0 }, uTime: { value: 0 } },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
    `,
    fragmentShader: /* glsl */ `
      uniform float uIntro;
      uniform float uTime;
      varying vec2 vUv;
      void main() {
        vec2 p = (vUv - 0.5) * 2.0;
        float r = length(p);
        if (r > 1.0) discard;
        // linear-space values (≈ sRGB #0e1b28 centre → #060d15 edge)
        vec3 base = mix(vec3(0.0045, 0.011, 0.021), vec3(0.0018, 0.004, 0.0075), smoothstep(0.0, 1.0, r));
        vec2 g = abs(fract(p * 7.0) - 0.5);
        float grid = (1.0 - smoothstep(0.0, 0.03, min(g.x, g.y))) * 0.05 * (1.0 - r);
        float side = smoothstep(-0.2, 0.9, dot(normalize(p + 1e-4), normalize(vec2(1.0, -0.15))));
        float rim = smoothstep(0.955, 0.995, r) * (1.0 - smoothstep(0.995, 1.0, r));
        vec3 col = base + vec3(0.02, 0.06, 0.12) * grid + vec3(0.05, 0.4, 1.0) * rim * side * 2.4;
        float edge = 1.0 - smoothstep(0.985, 1.0, r);
        gl_FragColor = vec4(col, 0.96 * edge * uIntro);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
    transparent: true,
    depthWrite: false,
    toneMapped: false,
  });
}

/** Large dark moon with fresnel rim light. */
export function createMoonMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: { uIntro: { value: 0 } },
    vertexShader: /* glsl */ `
      varying vec3 vNormal;
      varying vec3 vView;
      varying vec3 vPos;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vNormal = normalize(normalMatrix * normal);
        vView = normalize(-mv.xyz);
        vPos = position;
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uIntro;
      varying vec3 vNormal;
      varying vec3 vView;
      varying vec3 vPos;
      ${NOISE}
      void main() {
        float n = vnoise(vPos * 2.4) * 0.6 + vnoise(vPos * 7.0) * 0.4;
        float fres = pow(1.0 - max(dot(vNormal, vView), 0.0), 5.0);
        float lit = smoothstep(0.0, 0.9, dot(vNormal, normalize(vec3(-0.85, -0.4, 0.35))));
        vec3 base = vec3(0.0016, 0.0034, 0.006) * (0.45 + n);
        vec3 rim = vec3(0.1, 0.45, 1.0) * fres * (0.05 + 1.1 * lit);
        float speck = step(0.95, vnoise(vPos * 22.0)) * 0.12 * lit;
        gl_FragColor = vec4((base + rim + vec3(0.2, 0.6, 1.0) * speck) * uIntro, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
  });
}

/** Round, soft, twinkling particles. */
export function createParticleMaterial(pixelRatio: number) {
  return new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uIntro: { value: 0 }, uPixelRatio: { value: pixelRatio } },
    vertexShader: /* glsl */ `
      attribute float aSize;
      attribute float aPhase;
      attribute vec3 aColor;
      uniform float uTime;
      uniform float uIntro;
      uniform float uPixelRatio;
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        vec3 p = position;
        p.y += sin(uTime * 0.25 + aPhase * 6.2831) * 0.18 + uTime * 0.02 * (0.5 + aPhase);
        p.y = mod(p.y + 4.5, 10.0) - 4.5;
        p.x += cos(uTime * 0.18 + aPhase * 12.0) * 0.12;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = aSize * uPixelRatio * (24.0 / -mv.z);
        float tw = 0.45 + 0.55 * sin(uTime * (0.8 + aPhase * 2.2) + aPhase * 40.0);
        vAlpha = tw * uIntro;
        vColor = aColor;
      }
    `,
    fragmentShader: /* glsl */ `
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        float a = smoothstep(0.5, 0.0, d);
        a *= a;
        gl_FragColor = vec4(vColor * 2.2, a * vAlpha);
        #include <colorspace_fragment>
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
  });
}
