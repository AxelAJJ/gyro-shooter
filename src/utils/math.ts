// ─────────────────────────────────────────────────────────────
// Utilidades matemáticas puras (fáciles de probar)
// ─────────────────────────────────────────────────────────────
import type { Vec2, Vec3 } from '../types';

/** Limita `value` al rango [min, max]. */
export const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

/** Distancia entre dos puntos 2D. */
export const distance = (a: Vec2, b: Vec2): number => Math.hypot(a.x - b.x, a.y - b.y);

/** Número aleatorio en [min, max). */
export const randomRange = (min: number, max: number): number => min + Math.random() * (max - min);

/** Producto punto 3D. */
export const dot3 = (a: Vec3, b: Vec3): number => a.x * b.x + a.y * b.y + a.z * b.z;

/** Longitud de un vector 3D. */
export const length3 = (v: Vec3): number => Math.sqrt(dot3(v, v));

/** Normaliza un vector 3D. Si es casi cero, devuelve `fallback`. */
export const normalize3 = (v: Vec3, fallback: Vec3 = { x: 0, y: 1, z: 0 }): Vec3 => {
  const len = length3(v);
  return len < 1e-6 ? fallback : { x: v.x / len, y: v.y / len, z: v.z / len };
};

/** Quita valores pequeños (zona muerta). */
export const deadzone = (value: number, threshold: number): number =>
  Math.abs(value) < threshold ? 0 : value;

/** Formatea segundos como m:ss. */
export const formatTime = (totalSeconds: number): string => {
  const s = Math.max(0, Math.ceil(totalSeconds));
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, '0')}`;
};
