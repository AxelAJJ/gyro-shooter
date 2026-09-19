// Marcador superior: puntaje, objetivos restantes y tiempo.
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { formatTime } from '../utils/math';

interface Props {
  score: number;
  remaining: number;
  timeLeftMs: number;
}

function Stat({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, warn && styles.warn]}>{value}</Text>
    </View>
  );
}

export function Hud({ score, remaining, timeLeftMs }: Props) {
  const seconds = timeLeftMs / 1000;
  return (
    <View style={styles.row} pointerEvents="none">
      <Stat label="PUNTOS" value={String(score)} />
      <Stat label="RESTANTES" value={String(remaining)} />
      <Stat label="TIEMPO" value={formatTime(seconds)} warn={seconds <= 10} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16 },
  stat: {
    minWidth: 96,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
  },
  label: { color: '#8FA3C7', fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  value: { color: '#FFFFFF', fontSize: 24, fontWeight: '800', fontVariant: ['tabular-nums'] },
  warn: { color: '#FF6B81' },
});
