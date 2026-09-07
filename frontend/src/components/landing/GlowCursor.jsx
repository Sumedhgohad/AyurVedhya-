import { useEffect, useRef } from 'react';
import { Mesh, Program, Renderer, Triangle } from 'ogl';
import './GlowCursor.css';

const MAX_POINTS = 64;

const VERTEX_SHADER = `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision highp float;

#define MAX_POINTS 64

uniform vec2 uResolution;
uniform vec2 uPoints[MAX_POINTS];
uniform float uPointCount;
uniform vec3 uColor;
uniform vec3 uSecondaryColor;
uniform float uTrailWidth;
uniform float uTaper;
uniform float uGlowIntensity;
uniform float uGlowSpread;
uniform float uHotspot;
uniform float uBrightness;
uniform float uOpacity;
uniform float uPulseSpeed;
uniform float uNoiseStrength;
uniform float uNormalBlend;
uniform float uTime;
uniform float uFade;

varying vec2 vUv;

float sRGB(float x) {
  if (x <= 0.00031308) return 12.92 * x;
  return 1.055 * pow(x, 1.0 / 2.4) - 0.055;
}

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float filmGrain(vec2 p, float time) {
  float frame = time * 18.0;
  float frameIndex = mod(floor(frame), 256.0);
  float nextFrameIndex = mod(frameIndex + 1.0, 256.0);
  float blend = fract(frame);
  blend = blend * blend * (3.0 - 2.0 * blend);
  vec2 pixel = floor(p);
  float current = hash(pixel + vec2(frameIndex * 17.0, frameIndex * 31.0));
  float next = hash(pixel + vec2(nextFrameIndex * 17.0, nextFrameIndex * 31.0));
  return mix(current, next, blend) * 2.0 - 1.0;
}

void main() {
  vec2 pixel = vUv * uResolution;
  float denominator = max(uPointCount - 1.0, 1.0);
  float strongest = 0.0;
  float strongestCore = 0.0;
  float colorWeight = 0.0;
  vec3 colorSum = vec3(0.0);

  for (int i = 0; i < MAX_POINTS - 1; i++) {
    float index = float(i);
    float active = 1.0 - step(uPointCount - 1.0, index);
    vec2 start = uPoints[i];
    vec2 end = uPoints[i + 1];
    vec2 toPixel = pixel - start;
    vec2 segment = end - start;
    float along = clamp(dot(toPixel, segment) / max(dot(segment, segment), 0.0001), 0.0, 1.0);
    float progress = clamp((index + along) / denominator, 0.0, 1.0);
    float life = pow(max(1.0 - progress, 0.0), mix(0.55, 1.25, uTaper));
    float width = uTrailWidth * mix(1.0, 0.25, pow(progress, mix(0.55, 1.6, uTaper)));
    float distanceToTrail = length(toPixel - segment * along);
    float falloff = max(width * (0.8 + uGlowSpread * 1.4), 0.5);
    float beam = min(1.0, (falloff * falloff) / (distanceToTrail * distanceToTrail + falloff * falloff));
    float core = exp(-pow(distanceToTrail / max(width, 0.5), 2.0) * 2.5);
    float pulseAmount = min(abs(uPulseSpeed), 1.0);
    float pulse = 1.0 + sin(uTime * uPulseSpeed * 3.0 - progress * 11.0) * 0.16 * pulseAmount;
    float intensity = (core + beam * uGlowIntensity * 0.55) * life * pulse * active;
    vec3 segmentColor = mix(uColor, uSecondaryColor, progress);

    strongest = max(strongest, intensity);
    strongestCore = max(strongestCore, core * life * active);
    colorSum += segmentColor * intensity;
    colorWeight += intensity;
  }

  float grain = filmGrain(pixel, uTime);
  float noiseAmount = (1.0 - exp(-uNoiseStrength * 2.2)) * 0.4;
  float alpha = clamp(strongest * uOpacity * uFade, 0.0, 1.0);
  if (alpha < 0.0005) discard;

  vec3 color = colorSum / max(colorWeight, 0.0001);
  color = mix(color, vec3(1.0), smoothstep(0.25, 0.95, strongestCore) * uHotspot);
  float luminance = sRGB(clamp(strongest * uBrightness, 0.0, 1.0));
  luminance *= 1.0 + grain * noiseAmount;
  vec3 additiveColor = color * luminance;
  float normalAlpha = clamp(strongest * uBrightness * uOpacity * uFade, 0.0, 1.0);
  vec3 normalColor = mix(color, vec3(1.0), smoothstep(0.45, 1.0, strongestCore) * uHotspot * 0.35);
  gl_FragColor = vec4(mix(additiveColor, normalColor, uNormalBlend), mix(alpha, normalAlpha, uNormalBlend));
}
`;

const hexToRgb = hex => {
  let value = (hex || '').replace('#', '').trim();
  if (value.length === 3)
    value = value
      .split('')
      .map(char => char + char)
      .join('');
  const parsed = Number.parseInt(value || '000000', 16);
  return [((parsed >> 16) & 255) / 255, ((parsed >> 8) & 255) / 255, (parsed & 255) / 255];
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

// Check if element or ancestor has green or dark background
const isGreenOrDarkBackground = (element) => {
  if (!element || typeof window === 'undefined') return false;
  let curr = element;
  while (curr && curr !== document.body && curr !== document.documentElement) {
    const id = curr.id || '';
    const classList = curr.classList;

    // 1. Explicit light containers / cards
    if (
      id === 'hero-tilt-card' ||
      classList?.contains('bg-white') ||
      classList?.contains('bg-cream') ||
      classList?.contains('bg-parchment') ||
      classList?.contains('bg-sand')
    ) {
      return false;
    }

    // 2. Explicit dark green containers / cards
    if (
      id === 'hero-section' ||
      id === 'cta' ||
      curr.tagName === 'FOOTER' ||
      classList?.contains('bg-forest') ||
      classList?.contains('bg-deep-green') ||
      classList?.contains('bg-herbal') ||
      classList?.contains('bg-[#173B2A]') ||
      curr.getAttribute?.('data-bg') === 'dark'
    ) {
      return true;
    }

    // 3. Computed style color check fallback
    try {
      const bg = window.getComputedStyle(curr).backgroundColor;
      if (bg && bg !== 'transparent' && bg !== 'rgba(0, 0, 0, 0)') {
        const m = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (m) {
          const r = parseInt(m[1], 10);
          const g = parseInt(m[2], 10);
          const b = parseInt(m[3], 10);
          // Dark green: low overall brightness, green dominates
          if (r < 100 && g < 140 && b < 100 && g >= r) {
            return true;
          }
          // Light/white
          if (r > 160 && g > 160 && b > 140) {
            return false;
          }
        }
      }
    } catch {
      // Ignore
    }

    curr = curr.parentElement;
  }
  return false;
};

const GlowCursor = ({
  color = '#22C55E', // Bright radiant glowing emerald green on light backgrounds
  secondaryColor = '#86EFAC', // Luminous light mint-green on light backgrounds
  darkColor = '#FFFFFF', // Pure luminous white on green backgrounds
  darkSecondaryColor = '#E6F5EB', // Radiant crystalline white on green backgrounds
  trailLength = 36,
  trailWidth = 7.5,
  trailTaper = 0.8,
  followSpeed = 0.16,
  glowIntensity = 1.4,
  glowSpread = 1.15,
  hotspot = 0.55,
  brightness = 1.1,
  opacity = 0.88,
  pulseSpeed = 1.0,
  noiseStrength = 0.035,
  idleFade = true,
  idleTimeout = 700,
  fadeDuration = 900,
  blendMode = 'adaptive',
  maxDevicePixelRatio = 0.5,
  enabled = true,
  children,
  className = '',
  style,
  ...rest
}) => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const propsRef = useRef({});

  propsRef.current = {
    color,
    secondaryColor,
    darkColor,
    darkSecondaryColor,
    trailLength,
    trailWidth,
    trailTaper,
    followSpeed,
    glowIntensity,
    glowSpread,
    hotspot,
    brightness,
    opacity,
    pulseSpeed,
    noiseStrength,
    idleFade,
    idleTimeout,
    fadeDuration,
    maxDevicePixelRatio,
    blendMode,
    enabled
  };

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const initialConfig = propsRef.current;
    const renderer = new Renderer({
      canvas,
      alpha: true,
      dpr: Math.min(window.devicePixelRatio || 1, initialConfig.maxDevicePixelRatio)
    });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);

    const pointData = Array(MAX_POINTS * 2).fill(0);
    const points = Array.from({ length: MAX_POINTS }, () => ({ x: 0, y: 0 }));
    const target = { x: 0, y: 0 };
    const head = { x: 0, y: 0 };

    // Adaptive contrast colors
    const whitePrimary = hexToRgb(initialConfig.darkColor || '#FFFFFF');
    const whiteSecondary = hexToRgb(initialConfig.darkSecondaryColor || '#E6F5EB');
    const greenPrimary = hexToRgb(initialConfig.color || '#22C55E');
    const greenSecondary = hexToRgb(initialConfig.secondaryColor || '#86EFAC');

    let isDark = true; // default start on Hero (dark green)
    const currentColor = [...whitePrimary];
    const currentSecondary = [...whiteSecondary];
    let currentNormalBlend = 0.0;
    let currentHotspot = 0.70;
    let currentBrightness = 1.15;
    let lastPointerX = null;
    let lastPointerY = null;
    let lastCheckTime = 0;

    let checkTimeout = null;

    const checkBackground = (clientX, clientY) => {
      lastPointerX = clientX;
      lastPointerY = clientY;
      const now = performance.now();
      if (now - lastCheckTime >= 24) {
        lastCheckTime = now;
        const el = document.elementFromPoint(clientX, clientY);
        isDark = isGreenOrDarkBackground(el);
      } else {
        if (checkTimeout) clearTimeout(checkTimeout);
        checkTimeout = setTimeout(() => {
          if (lastPointerX !== null && lastPointerY !== null) {
            const el = document.elementFromPoint(lastPointerX, lastPointerY);
            isDark = isGreenOrDarkBackground(el);
          }
        }, 28);
      }
    };

    const program = new Program(gl, {
      vertex: VERTEX_SHADER,
      fragment: FRAGMENT_SHADER,
      uniforms: {
        uResolution: { value: [1, 1] },
        uPoints: { value: pointData },
        uPointCount: { value: initialConfig.trailLength },
        uColor: { value: currentColor },
        uSecondaryColor: { value: currentSecondary },
        uTrailWidth: { value: initialConfig.trailWidth },
        uTaper: { value: initialConfig.trailTaper },
        uGlowIntensity: { value: initialConfig.glowIntensity },
        uGlowSpread: { value: initialConfig.glowSpread },
        uHotspot: { value: currentHotspot },
        uBrightness: { value: currentBrightness },
        uOpacity: { value: initialConfig.opacity },
        uPulseSpeed: { value: initialConfig.pulseSpeed },
        uNoiseStrength: { value: initialConfig.noiseStrength },
        uNormalBlend: { value: currentNormalBlend },
        uTime: { value: 0 },
        uFade: { value: 0 }
      },
      transparent: true,
      depthTest: false,
      depthWrite: false
    });
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

    let width = 1;
    let height = 1;
    let initialized = false;
    let pointerInside = false;
    let fade = 0;
    let lastInputTime = performance.now();
    let lastFrameTime = performance.now();
    let raf = 0;
    let isRunning = false;
    let destroyed = false;

    const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouch = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);

    if (prefersReducedMotion || isTouch) {
      return;
    }

    const resize = () => {
      width = Math.max(window.innerWidth, 1);
      height = Math.max(window.innerHeight, 1);
      renderer.setSize(width, height);
      program.uniforms.uResolution.value = [width, height];
    };

    const initializeTrail = (x, y) => {
      target.x = x;
      target.y = y;
      head.x = x;
      head.y = y;
      for (const point of points) {
        point.x = x;
        point.y = y;
      }
      initialized = true;
      fade = 1;
    };

    const startLoop = () => {
      if (!isRunning && !destroyed) {
        isRunning = true;
        lastFrameTime = performance.now();
        raf = requestAnimationFrame(render);
      }
    };

    const updatePointer = event => {
      const x = clamp(event.clientX, 0, width);
      const y = clamp(height - event.clientY, 0, height);
      if (!initialized) initializeTrail(x, y);
      target.x = x;
      target.y = y;
      pointerInside = true;
      lastInputTime = performance.now();
      checkBackground(event.clientX, event.clientY);
      startLoop();
    };

    const onPointerLeave = () => {
      pointerInside = false;
      lastInputTime = performance.now();
    };

    const onScroll = () => {
      if (lastPointerX !== null && lastPointerY !== null) {
        const el = document.elementFromPoint(lastPointerX, lastPointerY);
        isDark = isGreenOrDarkBackground(el);
        startLoop();
      }
    };

    const render = now => {
      if (destroyed) {
        isRunning = false;
        return;
      }
      const config = propsRef.current;
      const delta = Math.min((now - lastFrameTime) / 16.667, 3);
      lastFrameTime = now;

      if (initialized) {
        const headEase = 1 - Math.pow(1 - clamp(config.followSpeed, 0.01, 0.99), delta);
        const chainBase = clamp(0.28 + config.followSpeed * 0.35, 0.08, 0.92);
        const chainEase = 1 - Math.pow(1 - chainBase, delta);
        head.x += (target.x - head.x) * headEase;
        head.y += (target.y - head.y) * headEase;
        points[0].x = head.x;
        points[0].y = head.y;

        for (let i = 1; i < MAX_POINTS; i++) {
          points[i].x += (points[i - 1].x - points[i].x) * chainEase;
          points[i].y += (points[i - 1].y - points[i].y) * chainEase;
        }

        for (let i = 0; i < MAX_POINTS; i++) {
          pointData[i * 2] = points[i].x;
          pointData[i * 2 + 1] = points[i].y;
        }
      }

      const idleFor = now - lastInputTime;
      const shouldFade = config.idleFade && (!pointerInside || idleFor > config.idleTimeout);
      const fadeStep = (16.667 * delta) / Math.max(config.fadeDuration, 16);
      const fadeTarget = initialized && config.enabled && !shouldFade ? 1 : 0;
      fade += (fadeTarget - fade) * Math.min(1, fadeStep * 7);

      // Adaptive color & blend mode transition:
      // On green background -> white glow
      // On white background -> green glow
      const targetColor = isDark ? whitePrimary : greenPrimary;
      const targetSecondary = isDark ? whiteSecondary : greenSecondary;
      const targetNormalBlend = isDark ? 0.0 : 0.92;
      const targetHotspot = isDark ? 0.70 : 0.20;
      const targetBrightness = isDark ? 1.15 : 1.05;

      const lerpSpeed = 0.15;
      currentColor[0] += (targetColor[0] - currentColor[0]) * lerpSpeed;
      currentColor[1] += (targetColor[1] - currentColor[1]) * lerpSpeed;
      currentColor[2] += (targetColor[2] - currentColor[2]) * lerpSpeed;

      currentSecondary[0] += (targetSecondary[0] - currentSecondary[0]) * lerpSpeed;
      currentSecondary[1] += (targetSecondary[1] - currentSecondary[1]) * lerpSpeed;
      currentSecondary[2] += (targetSecondary[2] - currentSecondary[2]) * lerpSpeed;

      currentNormalBlend += (targetNormalBlend - currentNormalBlend) * lerpSpeed;
      currentHotspot += (targetHotspot - currentHotspot) * lerpSpeed;
      currentBrightness += (targetBrightness - currentBrightness) * lerpSpeed;

      const targetBlendMode = isDark ? 'screen' : 'normal';
      if (canvas.style.mixBlendMode !== targetBlendMode) {
        canvas.style.mixBlendMode = targetBlendMode;
      }

      program.uniforms.uPointCount.value = clamp(Math.round(config.trailLength), 2, MAX_POINTS);
      program.uniforms.uColor.value = currentColor;
      program.uniforms.uSecondaryColor.value = currentSecondary;
      program.uniforms.uTrailWidth.value = Math.max(config.trailWidth, 0.1);
      program.uniforms.uTaper.value = clamp(config.trailTaper, 0, 1);
      program.uniforms.uGlowIntensity.value = Math.max(config.glowIntensity, 0);
      program.uniforms.uGlowSpread.value = Math.max(config.glowSpread, 0);
      program.uniforms.uHotspot.value = currentHotspot;
      program.uniforms.uBrightness.value = currentBrightness;
      program.uniforms.uOpacity.value = clamp(config.opacity, 0, 1);
      program.uniforms.uPulseSpeed.value = config.pulseSpeed;
      program.uniforms.uNoiseStrength.value = clamp(config.noiseStrength, 0, 1);
      program.uniforms.uNormalBlend.value = currentNormalBlend;
      program.uniforms.uTime.value = now * 0.001;
      program.uniforms.uFade.value = fade;

      if (fade > 0.001 || fadeTarget > 0) {
        renderer.render({ scene: mesh });
        raf = requestAnimationFrame(render);
      } else {
        // Pause animation when completely faded out and idle
        gl.clear(gl.COLOR_BUFFER_BIT);
        isRunning = false;
      }
    };

    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', updatePointer, { passive: true });
    window.addEventListener('pointerenter', updatePointer, { passive: true });
    window.addEventListener('pointerleave', onPointerLeave, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    resize();
    startLoop();

    return () => {
      destroyed = true;
      isRunning = false;
      cancelAnimationFrame(raf);
      if (checkTimeout) clearTimeout(checkTimeout);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', updatePointer);
      window.removeEventListener('pointerenter', updatePointer);
      window.removeEventListener('pointerleave', onPointerLeave);
      window.removeEventListener('scroll', onScroll);
      mesh.geometry.remove();
      program.remove();
    };
  }, [maxDevicePixelRatio]);

  return (
    <div ref={containerRef} className={`glow-cursor${className ? ` ${className}` : ''}`} style={style} {...rest}>
      <canvas ref={canvasRef} className="glow-cursor__canvas" style={{ mixBlendMode: 'screen' }} aria-hidden="true" />
      {children && <div className="glow-cursor__content">{children}</div>}
    </div>
  );
};

export default GlowCursor;
