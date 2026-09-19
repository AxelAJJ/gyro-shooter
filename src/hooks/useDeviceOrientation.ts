// Usa el sensor de orientación para avisar si el iPhone no está en vertical.
import { useEffect, useState } from 'react';
import { subscribeOrientation } from '../services/sensorService';
import { ORIENTATION_INTERVAL_MS } from '../utils/config';

/** `true` mientras el teléfono esté físicamente en vertical (orientación 0). */
export function useIsPortrait(active: boolean = true): boolean {
  const [isPortrait, setIsPortrait] = useState(true);

  useEffect(() => {
    if (!active) return;
    const unsubscribe = subscribeOrientation((orientation) => {
      // `setState` con el mismo valor no vuelve a renderizar, así que es barato.
      setIsPortrait(orientation === 0);
    }, ORIENTATION_INTERVAL_MS);
    return unsubscribe;
  }, [active]);

  return isPortrait;
}
