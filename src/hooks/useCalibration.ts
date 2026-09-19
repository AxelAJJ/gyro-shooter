// ─────────────────────────────────────────────────────────────
// Calibración inicial.
// El usuario sostiene el iPhone quieto ~1.5 s en su postura de juego. Durante ese tiempo:
//   • Giroscopio  → promediamos las lecturas = "bias" (deriva) que luego se resta.
//   • Acelerómetro → detectamos hacia dónde está "arriba" (gravedad) para separar giro
//                    horizontal (yaw) de vertical (pitch) aunque sostengas el teléfono inclinado.
// Si el teléfono se mueve, el contador se reinicia solo.
// ─────────────────────────────────────────────────────────────
import { useEffect, useRef, useState } from 'react';
import type { Calibration, Vec3 } from '../types';
import { subscribeAccelerometer, subscribeGyroscope } from '../services/sensorService';
import {
  ACCEL_INTERVAL_MS,
  CALIBRATION_DURATION_MS,
  CALIBRATION_MAX_RATE,
  GYRO_INTERVAL_MS,
} from '../utils/config';
import { clamp, length3 } from '../utils/math';

const zero = (): Vec3 => ({ x: 0, y: 0, z: 0 });

export function useCalibration(enabled: boolean, onDone: (c: Calibration) => void) {
  const [progress, setProgress] = useState(0); // 0..1
  const [isStill, setIsStill] = useState(true);

  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    if (!enabled) return;

    // Acumuladores (viven en variables locales: no provocan renders).
    let startAt: number | null = null;
    let gyroSum = zero();
    let gyroCount = 0;
    let accelSum = zero();
    let accelCount = 0;
    let shownProgress = 0;
    let finished = false;

    const reset = () => {
      startAt = null;
      gyroSum = zero();
      gyroCount = 0;
      accelSum = zero();
      accelCount = 0;
      if (shownProgress !== 0) {
        shownProgress = 0;
        setProgress(0);
      }
    };

    const stopGyro = subscribeGyroscope((m) => {
      if (finished) return;
      const now = performance.now();

      // ¿Se mueve demasiado? → reiniciar.
      if (length3(m) > CALIBRATION_MAX_RATE) {
        reset();
        setIsStill(false);
        return;
      }
      setIsStill(true);

      if (startAt === null) startAt = now;
      gyroSum = { x: gyroSum.x + m.x, y: gyroSum.y + m.y, z: gyroSum.z + m.z };
      gyroCount += 1;

      const p = clamp((now - startAt) / CALIBRATION_DURATION_MS, 0, 1);
      if (p - shownProgress >= 0.03 || p === 1) {
        shownProgress = p;
        setProgress(p);
      }

      if (p >= 1 && gyroCount > 0) {
        finished = true;
        const gyroBias: Vec3 = {
          x: gyroSum.x / gyroCount,
          y: gyroSum.y / gyroCount,
          z: gyroSum.z / gyroCount,
        };
        // "Arriba" del teléfono (eje +y) debe apuntar hacia arriba en el mundo.
        // Si la lectura del acelerómetro tiene y ≥ 0 apunta hacia arriba (signo +1);
        // en iOS suele ser y < 0 con el teléfono vertical (signo -1).
        // Sin datos de acelerómetro asumimos la convención de iOS (-1).
        const upSign: 1 | -1 = accelCount > 0 && accelSum.y >= 0 ? 1 : -1;
        onDoneRef.current({ gyroBias, upSign });
      }
    }, GYRO_INTERVAL_MS);

    const stopAccel = subscribeAccelerometer((m) => {
      if (finished || startAt === null) return;
      accelSum = { x: accelSum.x + m.x, y: accelSum.y + m.y, z: accelSum.z + m.z };
      accelCount += 1;
    }, ACCEL_INTERVAL_MS);

    return () => {
      finished = true;
      stopGyro();
      stopAccel();
    };
  }, [enabled]);

  return { progress, isStill };
}
