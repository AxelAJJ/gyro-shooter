// ─────────────────────────────────────────────────────────────
// Tipos compartidos de todo el proyecto
// ─────────────────────────────────────────────────────────────

/** Punto / vector 2D en pixeles de pantalla. */
export interface Vec2 {
  x: number;
  y: number;
}

/** Vector 3D (ejes del dispositivo: x → derecha, y → arriba, z → sale de la pantalla). */
export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

/** Ajustes de apuntado que el jugador puede cambiar en el menú. */
export interface AimSettings {
  /** Multiplicador de sensibilidad (1 = valor base). */
  sensitivity: number;
  /** Suavizado 0..0.9 (0 = sin filtro, 0.9 = muy suave pero con más "retraso"). */
  smoothing: number;
  /** Invierte el eje horizontal si tu iPhone mueve la mira al lado contrario. */
  invertX: boolean;
  /** Invierte el eje vertical. */
  invertY: boolean;
}

/** Resultado de la calibración inicial. */
export interface Calibration {
  /** Deriva promedio del giroscopio en reposo (rad/s). Se resta de cada lectura. */
  gyroBias: Vec3;
  /**
   * Signo que convierte la lectura del acelerómetro en el vector "arriba" del mundo.
   * (En iOS el acelerómetro apunta hacia abajo; este signo lo hace independiente de eso.)
   */
  upSign: 1 | -1;
}

/** Un objetivo activo en pantalla. */
export interface Target {
  id: number;
  /** Centro del objetivo (px). */
  x: number;
  y: number;
  radius: number;
  /** Momento (ms epoch) en que desaparece si nadie le dispara. */
  expiresAt: number;
}

/** Estado de la partida que se pinta en la interfaz. */
export interface GameUiState {
  targets: Target[];
  score: number;
  /** Objetivos que aún pueden destruirse o expirar. */
  remaining: number;
  timeLeftMs: number;
}

/** Resultado de un disparo. */
export interface ShotEvent {
  /** Contador incremental: permite reaccionar a cada disparo aunque el resultado se repita. */
  id: number;
  hit: boolean;
}

/** Resumen final de una partida. */
export interface GameResult {
  score: number;
  total: number;
  shots: number;
  hits: number;
  /** Segundos que duró la partida. */
  timeUsedSec: number;
  reason: 'completed' | 'timeout';
}

/** Pantallas de la app (navegación simple por estado). */
export type ScreenName = 'home' | 'calibration' | 'game' | 'result';
