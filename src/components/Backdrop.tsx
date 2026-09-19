// Fondo tipo "campo de tiro": cuadrícula tenue para dar sensación de espacio.
import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';

const COLS = 8;
const ROWS = 16;

function BackdropBase() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {Array.from({ length: COLS - 1 }, (_, i) => (
        <View key={`v${i}`} style={[styles.vLine, { left: `${((i + 1) / COLS) * 100}%` }]} />
      ))}
      {Array.from({ length: ROWS - 1 }, (_, i) => (
        <View key={`h${i}`} style={[styles.hLine, { top: `${((i + 1) / ROWS) * 100}%` }]} />
      ))}
    </View>
  );
}

export const Backdrop = memo(BackdropBase);

const styles = StyleSheet.create({
  vLine: { position: 'absolute', top: 0, bottom: 0, width: StyleSheet.hairlineWidth, backgroundColor: 'rgba(143,163,199,0.14)' },
  hLine: { position: 'absolute', left: 0, right: 0, height: StyleSheet.hairlineWidth, backgroundColor: 'rgba(143,163,199,0.14)' },
});
