// ─────────────────────────────────────────────────────────────
// Constantes de configuración. Aquí se afina el "game feel".
// ─────────────────────────────────────────────────────────────
import type { AimSettings } from '../types';

/** Reglas de la partida. */
export const GAME_CONFIG = {
  /** Objetivos totales por partida. */
  totalTargets: 20,
  /** Duración máxima de la partida (segundos). */
  durationSec: 60,
  /** Máximo de objetivos visibles a la vez. */
  maxActiveTargets: 3,
  /** Tiempo mínimo entre apariciones (ms). */
  spawnIntervalMs: 900,
  /** Tiempo que vive un objetivo antes de desaparecer (ms). */
  targetLifetimeMs: 3500,
  /** Radio del objetivo (px). */
  targetRadius: 34,
  /** Tolerancia extra al apuntar (px). Hace el disparo más "perdonador". */
  hitTolerance: 10,
} as const;

/** Rangos permitidos para los controles del menú. */
export const AIM_LIMITS = {
  sensitivity: { min: 0.5, max: 3, step: 0.25 },
  smoothing: { min: 0, max: 0.9, step: 0.1 },
} as const;

export const DEFAULT_AIM_SETTINGS: AimSettings = {
  sensitivity: 1,
  smoothing: 0.3,
  invertX: false,
  invertY: false,
};

/**
 * Pixeles que se mueve la mira por cada radián que giras el teléfono con sensibilidad 1.
 * ~450 px/rad ≈ girar unos 50° para cruzar un iPhone de ~390 pt de ancho.
 */
export const PIXELS_PER_RADIAN = 450;

/** Velocidades angulares menores a esto (rad/s) se ignoran: elimina el temblor de la mano. */
export const GYRO_DEADZONE = 0.015;

/** Constante de tiempo máxima del filtro de suavizado (segundos) cuando smoothing = 1. */
export const SMOOTHING_MAX_TAU = 0.2;

/** Calibración: cuánto tiempo hay que sostener quieto el teléfono (ms). */
export const CALIBRATION_DURATION_MS = 1500;
/** Calibración: velocidad angular máxima (rad/s) para considerar que está "quieto". */
export const CALIBRATION_MAX_RATE = 0.15;

/** Agitar el teléfono (aceleración total en G) por encima de esto recentra la mira. */
export const SHAKE_THRESHOLD_G = 2.6;
export const SHAKE_COOLDOWN_MS = 1200;

/** Intervalos de muestreo de sensores (ms). */
export const GYRO_INTERVAL_MS = 16; // ~60 Hz
export const ACCEL_INTERVAL_MS = 33; // ~30 Hz
export const ORIENTATION_INTERVAL_MS = 300;

/** Márgenes de seguridad (aprox. notch / barra inferior) para no depender de librerías extra. */
export const SAFE_TOP = 56;
export const SAFE_BOTTOM = 34;

/** Margen mínimo entre el centro de la mira y el borde de pantalla. */
export const CROSSHAIR_MARGIN = 16;
/** Tamaño visual de la mira (px). */
export const CROSSHAIR_SIZE = 56;
