// Comprueba disponibilidad y permisos de sensores al montar la pantalla.
import { useCallback, useEffect, useState } from 'react';
import { checkSensors } from '../services/sensorService';

type State = { status: 'checking' } | { status: 'ready' } | { status: 'error'; message: string };

export function useSensorsReady() {
  const [state, setState] = useState<State>({ status: 'checking' });

  const run = useCallback(async () => {
    setState({ status: 'checking' });
    const result = await checkSensors();
    setState(result.ok ? { status: 'ready' } : { status: 'error', message: result.message });
  }, []);

  useEffect(() => {
    run();
  }, [run]);

  return { state, retry: run };
}
