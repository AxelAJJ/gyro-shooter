// ─────────────────────────────────────────────────────────────
// Servicio de sensores: única capa que toca `expo-sensors`.
// El resto de la app (hooks/pantallas) solo usa estas funciones,
// así, si mañana cambias de librería, solo editas este archivo.
// ─────────────────────────────────────────────────────────────
import {
  Accelerometer,
  DeviceMotion,
  Gyroscope,
  type AccelerometerMeasurement,
  type DeviceMotionOrientation,
  type GyroscopeMeasurement,
} from 'expo-sensors';

export type SensorCheck = { ok: true } | { ok: false; message: string };

/**
 * Comprueba que el giroscopio y el acelerómetro existen y que el usuario dio permiso.
 * En el simulador de iOS NO hay sensores de movimiento: hace falta un iPhone real.
 */
export async function checkSensors(): Promise<SensorCheck> {
  try {
    const [hasGyro, hasAccel] = await Promise.all([
      Gyroscope.isAvailableAsync(),
      Accelerometer.isAvailableAsync(),
    ]);
    if (!hasGyro || !hasAccel) {
      return {
        ok: false,
        message:
          'Este dispositivo no tiene giroscopio/acelerómetro disponibles. ' +
          'Los sensores no funcionan en el simulador: prueba en un iPhone real.',
      };
    }

    // Permiso de "Movimiento y forma física" (iOS). Si ya está concedido, resuelve al instante.
    const permissions = await Promise.all([
      Gyroscope.requestPermissionsAsync(),
      Accelerometer.requestPermissionsAsync(),
      DeviceMotion.requestPermissionsAsync(),
    ]);
    if (permissions.some((p) => !p.granted)) {
      return {
        ok: false,
        message:
          'Falta el permiso de Movimiento y forma física. ' +
          'Actívalo en Ajustes › Privacidad y seguridad › Movimiento y forma física.',
      };
    }
    return { ok: true };
  } catch (error) {
    return { ok: false, message: `No se pudieron iniciar los sensores: ${String(error)}` };
  }
}

/** Suscribe al giroscopio (velocidad angular en rad/s). Devuelve la función para cancelar. */
export function subscribeGyroscope(
  listener: (m: GyroscopeMeasurement) => void,
  intervalMs: number,
): () => void {
  Gyroscope.setUpdateInterval(intervalMs);
  const subscription = Gyroscope.addListener(listener);
  return () => subscription.remove();
}

/** Suscribe al acelerómetro (en G, incluye la gravedad). */
export function subscribeAccelerometer(
  listener: (m: AccelerometerMeasurement) => void,
  intervalMs: number,
): () => void {
  Accelerometer.setUpdateInterval(intervalMs);
  const subscription = Accelerometer.addListener(listener);
  return () => subscription.remove();
}

/**
 * Suscribe al sensor de orientación (DeviceMotion, que fusiona giroscopio + acelerómetro
 * + magnetómetro). Solo usamos la orientación física del teléfono: 0, 90, -90 o 180.
 */
export function subscribeOrientation(
  listener: (orientation: DeviceMotionOrientation) => void,
  intervalMs: number,
): () => void {
  DeviceMotion.setUpdateInterval(intervalMs);
  const subscription = DeviceMotion.addListener((m) => listener(m.orientation));
  return () => subscription.remove();
}
