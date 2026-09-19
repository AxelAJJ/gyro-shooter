// ─────────────────────────────────────────────────────────────
// Núcleo del apuntado con sensores.
//
// Cómo funciona (apuntado por velocidad angular, como Splatoon o Zelda):
//   1. El giroscopio entrega la velocidad de giro (rad/s) de cada eje del teléfono.
//   2. Restamos el bias de la calibración y aplicamos una zona muerta (anti-temblor).
//   3. Separamos el giro en:
//        • yaw   (izquierda/derecha) → giro alrededor del vector "arriba" del mundo,
//                que sacamos del acelerómetro (gravedad). Así funciona aunque inclines el teléfono.
//        • pitch (arriba/abajo)      → giro alrededor del eje horizontal del teléfono (x).
//   4. Suavizamos con un filtro exponencial (basado en dt, independiente del framerate).
//   5. Integramos: posición += velocidad · dt · sensibilidad, y limitamos a los bordes.
//
// La posición se guarda en un `Animated.ValueXY` y en un ref: mover la mira a 60 Hz
// NO vuelve a renderizar React, solo actualiza la vista nativa.
// ─────────────────────────────────────────────────────────────
import { useCallback, useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import type { AimSettings, Calibration, Vec2, Vec3 } from '../types';
import { subscribeAccelerometer, subscribeGyroscope } from '../services/sensorService';
import {
  ACCEL_INTERVAL_MS,
  GYRO_DEADZONE,
  GYRO_INTERVAL_MS,
  PIXELS_PER_RADIAN,
  SHAKE_COOLDOWN_MS,
  SHAKE_THRESHOLD_G,
  SMOOTHING_MAX_TAU,
} from '../utils/config';
import { clamp, deadzone, dot3, length3, normalize3 } from '../utils/math';

/** Rectángulo (px) dentro del cual puede moverse el centro de la mira. */
export interface AimBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

interface Params {
  bounds: AimBounds;
  settings: AimSettings;
  calibration: Calibration;
  /** Pausa/reanuda la lectura de sensores. */
  active?: boolean;
  /** Se llama cuando el usuario agita el teléfono (la mira ya se recentró). */
  onShake?: () => void;
}

const centerOf = (b: AimBounds): Vec2 => ({ x: (b.minX + b.maxX) / 2, y: (b.minY + b.maxY) / 2 });

export function useGyroAim(params: Params) {
  const { active = true } = params;

  // Guardamos los parámetros en un ref para que los listeners de sensores siempre lean
  // los valores más recientes SIN tener que re-suscribirse cada vez que cambian.
  const paramsRef = useRef(params);
  paramsRef.current = params;

  const posRef = useRef<Vec2>(centerOf(params.bounds));
  const position = useRef(new Animated.ValueXY(posRef.current)).current;

  // Estado interno del filtro y de la gravedad (no necesitan renderizar).
  const filtered = useRef({ yaw: 0, pitch: 0 });
  const gravity = useRef<Vec3 | null>(null);
  const up = useRef<Vec3>({ x: 0, y: 1, z: 0 });
  const lastGyroTs = useRef<number | null>(null);
  const lastShakeAt = useRef(0);

  /** Devuelve la mira al centro y limpia el filtro. */
  const recenter = useCallback(() => {
    const c = centerOf(paramsRef.current.bounds);
    posRef.current = c;
    position.setValue(c);
    filtered.current = { yaw: 0, pitch: 0 };
  }, [position]);

  /** Posición actual de la mira (px). Se usa para detectar colisiones al disparar. */
  const getPosition = useCallback((): Vec2 => posRef.current, []);

  useEffect(() => {
    if (!active) return;
    lastGyroTs.current = null;

    // ── Acelerómetro: dirección de la gravedad + detección de sacudida ──
    const stopAccel = subscribeAccelerometer((a) => {
      const { calibration } = paramsRef.current;

      // Filtro pasa-bajos para aislar la gravedad de los movimientos bruscos.
      const g = gravity.current;
      gravity.current = g
        ? { x: g.x + 0.15 * (a.x - g.x), y: g.y + 0.15 * (a.y - g.y), z: g.z + 0.15 * (a.z - g.z) }
        : { x: a.x, y: a.y, z: a.z };

      const s = calibration.upSign;
      up.current = normalize3({
        x: gravity.current.x * s,
        y: gravity.current.y * s,
        z: gravity.current.z * s,
      });

      // Sacudida: la aceleración total (en G) se dispara muy por encima de 1 G.
      const now = performance.now();
      if (length3(a) > SHAKE_THRESHOLD_G && now - lastShakeAt.current > SHAKE_COOLDOWN_MS) {
        lastShakeAt.current = now;
        recenter();
        paramsRef.current.onShake?.();
      }
    }, ACCEL_INTERVAL_MS);

    // ── Giroscopio: mueve la mira ──
    const stopGyro = subscribeGyroscope((m) => {
      const now = performance.now();
      const last = lastGyroTs.current;
      lastGyroTs.current = now;
      if (last === null) return;
      const dt = clamp((now - last) / 1000, 0, 0.05); // evita saltos tras pausas

      const { settings, calibration, bounds } = paramsRef.current;

      // 1) Quitar deriva (bias) de la calibración.
      const w: Vec3 = {
        x: m.x - calibration.gyroBias.x,
        y: m.y - calibration.gyroBias.y,
        z: m.z - calibration.gyroBias.z,
      };

      // 2) Separar yaw / pitch y aplicar zona muerta.
      const yawRate = deadzone(dot3(w, up.current), GYRO_DEADZONE); // + = giras a la izquierda
      const pitchRate = deadzone(w.x, GYRO_DEADZONE); // + = inclinas la parte de arriba hacia ti

      // 3) Suavizado exponencial. tau = 0 → sin filtro.
      const tau = settings.smoothing * SMOOTHING_MAX_TAU;
      const alpha = tau <= 0 ? 1 : 1 - Math.exp(-dt / tau);
      const f = filtered.current;
      f.yaw += alpha * (yawRate - f.yaw);
      f.pitch += alpha * (pitchRate - f.pitch);

      // 4) Integrar → píxeles. Girar a la derecha = yaw negativo = mira a la derecha.
      const pxPerRad = PIXELS_PER_RADIAN * settings.sensitivity;
      const dirX = settings.invertX ? 1 : -1;
      const dirY = settings.invertY ? -1 : 1;
      const p = posRef.current;
      const next: Vec2 = {
        x: clamp(p.x + dirX * f.yaw * dt * pxPerRad, bounds.minX, bounds.maxX),
        y: clamp(p.y + dirY * f.pitch * dt * pxPerRad, bounds.minY, bounds.maxY),
      };
      posRef.current = next;
      position.setValue(next);
    }, GYRO_INTERVAL_MS);

    return () => {
      stopAccel();
      stopGyro();
    };
  }, [active, position, recenter]);

  return { position, getPosition, recenter };
}
