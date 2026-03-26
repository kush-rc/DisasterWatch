'use client';

import { useEffect, useRef } from 'react';
import { useStore } from '@/lib/store/useStore';
import type { ShaderMode } from '@/types';

// GLSL Fragment Shaders Ported from Legacy Code
const HEADER = `
  uniform sampler2D colorTexture;
  in vec2 v_textureCoordinates;
`;

const SHADERS: Record<string, string> = {
  NVG: HEADER + `
    void main() {
      vec4 color = texture(colorTexture, v_textureCoordinates);
      float luminance = dot(color.rgb, vec3(0.2126, 0.7152, 0.0722));
      float noise = fract(sin(dot(v_textureCoordinates * 500.0, vec2(12.9898, 78.233))) * 43758.5453);
      luminance += (noise - 0.5) * 0.08;
      vec3 nvg = vec3(luminance * 0.1, luminance * 1.0, luminance * 0.15);
      vec2 center = v_textureCoordinates - 0.5;
      float vignette = 1.0 - dot(center, center) * 1.5;
      out_FragColor = vec4(nvg * vignette, 1.0);
    }`,
  FLIR: HEADER + `
    void main() {
      vec4 color = texture(colorTexture, v_textureCoordinates);
      float lum = dot(color.rgb, vec3(0.2126, 0.7152, 0.0722));
      vec3 therm;
      if (lum < 0.15) therm = mix(vec3(0,0,0.1), vec3(0.1,0,0.4), lum/0.15);
      else if (lum < 0.35) therm = mix(vec3(0.1,0,0.4), vec3(0.6,0,0.3), (lum-0.15)/0.2);
      else if (lum < 0.55) therm = mix(vec3(0.6,0,0.3), vec3(0.9,0.2,0), (lum-0.35)/0.2);
      else if (lum < 0.75) therm = mix(vec3(0.9,0.2,0), vec3(1,0.8,0), (lum-0.55)/0.2);
      else therm = mix(vec3(1,0.8,0), vec3(1,1,0.9), (lum-0.75)/0.25);
      float noise = fract(sin(dot(v_textureCoordinates * 400.0, vec2(12.9, 78.2))) * 43758.5);
      out_FragColor = vec4(therm + (noise-0.5)*0.03, 1.0);
    }`,
  CRT: HEADER + `
    void main() {
      vec2 uv = v_textureCoordinates;
      vec2 center = uv - 0.5;
      float dist = dot(center, center);
      uv = uv + center * dist * 0.15;
      if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
        out_FragColor = vec4(0.0, 0.0, 0.0, 1.0); return;
      }
      vec4 color = texture(colorTexture, uv);
      float scanline = sin(uv.y * 800.0) * 0.08;
      color.rgb -= scanline;
      float r = texture(colorTexture, uv + vec2(0.001, 0.0)).r;
      float b = texture(colorTexture, uv - vec2(0.001, 0.0)).b;
      color.rgb = vec3(r, color.g, b) * (1.0 - dist * 2.5) * vec3(0.9, 1.0, 0.9);
      out_FragColor = vec4(color.rgb, 1.0);
    }`,
  ANIME: HEADER + `
    void main() {
      vec4 color = texture(colorTexture, v_textureCoordinates);
      float lum = dot(color.rgb, vec3(0.21, 0.71, 0.07));
      vec3 sat = mix(vec3(lum), color.rgb, 1.8);
      sat = floor(sat * 6.0) / 6.0;
      vec2 tex = vec2(1.0/1920.0, 1.0/1080.0);
      float gx = 0.0, gy = 0.0;
      for (int x=-1; x<=1; x++) {
        for (int y=-1; y<=1; y++) {
          float l = dot(texture(colorTexture, v_textureCoordinates + vec2(float(x),float(y))*tex*2.0).rgb, vec3(0.21,0.71,0.07));
          gx += l * float(x); gy += l * float(y);
        }
      }
      float edge = sqrt(gx*gx + gy*gy);
      out_FragColor = vec4(sat * (edge > 0.15 ? 0.0 : 1.0) * vec3(1.05, 1.0, 0.95), 1.0);
    }`
};

export default function ShaderControls() {
  const currentMode = useStore(state => state.shaderMode);
  const setShaderMode = useStore(state => state.setShaderMode);
  const stageRef = useRef<any>(null);

  // Apply shader to Cesium viewer
  useEffect(() => {
    // We rely on the viewer being stored globally (set in GlobeViewer)
    const viewer = (window as any).__cesiumViewer;
    if (!viewer) return;

    const Cesium = (window as any).Cesium;
    if (!Cesium) return;

    // Remove existing post-process stage
    if (stageRef.current) {
      viewer.scene.postProcessStages.remove(stageRef.current);
      stageRef.current = null;
    }

    if (currentMode === 'STANDARD' || !SHADERS[currentMode]) {
      return;
    }

    // Apply new shader
    try {
      stageRef.current = new Cesium.PostProcessStage({
        fragmentShader: SHADERS[currentMode],
        name: `gods-eye-shader-${currentMode.toLowerCase()}`
      });
      viewer.scene.postProcessStages.add(stageRef.current);
    } catch (e) {
      console.error('[ShaderControls] Error applying shader:', e);
    }
  }, [currentMode]);

  // Keyboard shortcut (M to cycle modes)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key.toLowerCase() === 'm') {
        const modes: ShaderMode[] = ['STANDARD', 'NVG', 'FLIR', 'CRT', 'ANIME'];
        setShaderMode(modes[(modes.indexOf(currentMode) + 1) % modes.length]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentMode, setShaderMode]);

  return null; // Invisible logical component
}
