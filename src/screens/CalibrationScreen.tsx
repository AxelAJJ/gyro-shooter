// Calibración inicial: hay que sostener el iPhone quieto un instante.
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Button } from '../components/Button';
import { useCalibration } from '../hooks/useCalibration';
import { useSensorsReady } from '../hooks/useSensorsReady';
import type { Calibration } from '../types';
import { SAFE_BOTTOM, SAFE_TOP } from '../utils/config';

interface Props {
  onDone: (calibration: Calibration) => void;
  onCancel: () => void;
}

export function CalibrationScreen({ onDone, onCancel }: Props) {
  const { state, retry } = useSensorsReady();
  const { progress, isStill } = useCalibration(state.status === 'ready', onDone);

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Calibración</Text>

      {state.status === 'checking' && <ActivityIndicator color="#7CFFB2" size="large" />}

      {state.status === 'error' && (
        <>
          <Text style={styles.error}>{state.message}</Text>
          <Button title="Reintentar" onPress={retry} />
        </>
      )}

      {state.status === 'ready' && (
        <>
          <Text style={styles.text}>
            Sostén el iPhone frente a ti en tu postura de juego, apuntando hacia el frente, y
            mantenlo lo más quieto posible.
          </Text>

          <View style={styles.track}>
            <View style={[styles.fill, { width: `${Math.round(progress * 100)}%` }]} />
          </View>

          <Text style={[styles.status, !isStill && styles.moving]}>
            {isStill ? 'Midiendo… no te muevas' : 'Te moviste: vuelve a mantenerlo quieto'}
          </Text>
        </>
      )}

      <View style={styles.footer}>
        <Button title="Cancelar" variant="secondary" onPress={onCancel} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0B1020',
    paddingTop: SAFE_TOP + 24,
    paddingBottom: SAFE_BOTTOM + 16,
    paddingHorizontal: 24,
    gap: 20,
  },
  title: { color: '#FFFFFF', fontSize: 30, fontWeight: '900' },
  text: { color: '#A8B8D8', fontSize: 17, lineHeight: 25 },
  error: { color: '#FF8FA3', fontSize: 16, lineHeight: 23 },
  track: { height: 14, borderRadius: 7, backgroundColor: 'rgba(255,255,255,0.12)', overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: '#7CFFB2' },
  status: { color: '#7CFFB2', fontSize: 16, fontWeight: '700' },
  moving: { color: '#FFB86B' },
  footer: { marginTop: 'auto' },
});
