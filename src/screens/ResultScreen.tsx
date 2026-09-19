// Pantalla de resultados al terminar la partida.
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../components/Button';
import type { GameResult } from '../types';
import { SAFE_BOTTOM, SAFE_TOP } from '../utils/config';
import { formatTime } from '../utils/math';

interface Props {
  result: GameResult;
  onPlayAgain: () => void;
  onRecalibrate: () => void;
  onMenu: () => void;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

export function ResultScreen({ result, onPlayAgain, onRecalibrate, onMenu }: Props) {
  const accuracy = result.shots > 0 ? Math.round((result.hits / result.shots) * 100) : 0;

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>{result.reason === 'completed' ? '¡Ronda completa!' : '¡Se acabó el tiempo!'}</Text>

      <View style={styles.scoreBox}>
        <Text style={styles.score}>{result.score}</Text>
        <Text style={styles.scoreLabel}>de {result.total} objetivos</Text>
      </View>

      <View style={styles.card}>
        <Row label="Disparos" value={String(result.shots)} />
        <Row label="Precisión" value={`${accuracy}%`} />
        <Row label="Tiempo" value={formatTime(result.timeUsedSec)} />
      </View>

      <View style={styles.footer}>
        <Button title="JUGAR DE NUEVO" onPress={onPlayAgain} />
        <Button title="Recalibrar" variant="secondary" onPress={onRecalibrate} />
        <Button title="Menú" variant="secondary" onPress={onMenu} />
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
  title: { color: '#FFFFFF', fontSize: 30, fontWeight: '900', textAlign: 'center' },
  scoreBox: { alignItems: 'center', marginVertical: 8 },
  score: { color: '#7CFFB2', fontSize: 88, fontWeight: '900', fontVariant: ['tabular-nums'] },
  scoreLabel: { color: '#A8B8D8', fontSize: 16 },
  card: { backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 18, padding: 16, gap: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  rowLabel: { color: '#A8B8D8', fontSize: 16 },
  rowValue: { color: '#FFFFFF', fontSize: 16, fontWeight: '800', fontVariant: ['tabular-nums'] },
  footer: { marginTop: 'auto', gap: 10 },
});
