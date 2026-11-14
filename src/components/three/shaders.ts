export const orbitVertex = /* glsl */ `
uniform float uTime;
uniform float uOpen;
uniform float uFocus;
uniform float uFocusStrength;
uniform float uScatter;
uniform float uPixelRatio;
uniform vec3 uPointer;
uniform float uIncl[10];
uniform float uNode[10];
uniform float uRadius[10];
uniform float uSpeed[10];
uniform vec3 uColor[10];

attribute float aRing;
attribute float aAngle;
attribute float aJitterR;
attribute float aJitterY;
attribute float aSize;
attribute float aSeed;

varying vec3 vColor;
varying float vAlpha;

mat3 rotX(float a){ float c=cos(a), s=sin(a); return mat3(1.,0.,0., 0.,c,-s, 0.,s,c); }
mat3 rotY(float a){ float c=cos(a), s=sin(a); return mat3(c,0.,s, 0.,1.,0., -s,0.,c); }

void main(){
  int ring = int(aRing + 0.5);
  float incl = uIncl[ring] * (1.0 - uOpen * 0.55);
  float node = uNode[ring];

  float speedBoost = 1.0;
  float bright = 1.0;
  float dim = 1.0;
  if (uFocus > -0.5) {
    if (abs(aRing - uFocus) < 0.5) {
      speedBoost = 1.0 + uFocusStrength * 1.7;
      bright = 1.0 + uFocusStrength * 0.9;
    } else {
      dim = 1.0 - uFocusStrength * 0.62;
    }
  }

  float r = uRadius[ring] * (1.0 + uOpen * 0.4) + aJitterR;
  float ang = aAngle + uTime * uSpeed[ring] * speedBoost;
  vec3 p = vec3(cos(ang) * r, aJitterY * (1.0 + uOpen * 1.5), sin(ang) * r);
  p = rotY(node) * rotX(incl) * p;
  p.y += uOpen * (aRing - 4.5) * 0.34;

  vec3 dir = normalize(p + vec3(0.0001));
  p += dir * uScatter * (1.5 + aSeed * 2.5);

  vec3 toP = p - uPointer;
  float d = length(toP);
  float push = smoothstep(1.35, 0.0, d) * 0.45;
  p += normalize(toP + vec3(0.0001)) * push;

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = aSize * uPixelRatio * (30.0 / -mv.z) * (1.0 + bright * 0.25);

  vColor = uColor[ring] * bright;
  float twinkle = 0.6 + 0.4 * sin(aSeed * 6.2831 + uTime * 1.6);
  vAlpha = dim * twinkle * (1.0 - uScatter * 0.35);
}
`;

export const orbitFragment = /* glsl */ `
precision highp float;
uniform float uGlow;
varying vec3 vColor;
varying float vAlpha;

void main(){
  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv);
  float core = smoothstep(0.5, 0.0, d);
  float glow = core * core;
  float a = glow * vAlpha;
  if (a < 0.012) discard;
  gl_FragColor = vec4(vColor * (0.55 + glow * 0.9) * uGlow, a);
}
`;

export const glowVertex = /* glsl */ `
varying vec3 vNormal;
varying vec3 vView;
void main(){
  vNormal = normalize(normalMatrix * normal);
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vView = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}
`;

export const glowFragment = /* glsl */ `
precision highp float;
uniform vec3 uColor;
uniform float uIntensity;
varying vec3 vNormal;
varying vec3 vView;
void main(){
  float fres = pow(1.0 - abs(dot(vNormal, vView)), 2.2);
  vec3 col = uColor * (0.35 + fres * 1.6) * uIntensity;
  gl_FragColor = vec4(col, 0.35 + fres * 0.65);
}
`;