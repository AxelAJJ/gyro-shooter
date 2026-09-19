// Mira. Se mueve con un Animated.ValueXY (sin re-renderizar React) y "pulsa" en cada disparo.
import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import type { ShotEvent } from '../types';
import { CROSSHAIR_SIZE } from '../utils/config';

interface Props {
  /** Posición del CENTRO de la mira (px). */
  position: Animated.ValueXY;
  /** Último disparo, para dar feedback visual. */
  shot: ShotEvent | null;
}

const COLORS = { idle: '#7CFFB2', hit: '#FF4D6D', miss: '#FFFFFF' };

export function Crosshair({ position, shot }: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const [flash, setFlash] = useState<'hit' | 'miss' | null>(null);

  // Cada disparo: pulso de tamaño + cambio de color breve (rojo = impacto).
  useEffect(() => {
    if (!shot) return;
    setFlash(shot.hit ? 'hit' : 'miss');
    scale.setValue(1.5);
    Animated.spring(scale, { toValue: 1, friction: 5, useNativeDriver: true }).start();
    const timeout = setTimeout(() => setFlash(null), 140);
    return () => clearTimeout(timeout);
  }, [shot, scale]);

  const color = flash ? COLORS[flash] : COLORS.idle;
  const half = CROSSHAIR_SIZE / 2;

  return (
    // Contenedor de 0x0 ubicado en el centro de la mira; los hijos se dibujan alrededor.
    <Animated.View
      pointerEvents="none"
      style={[styles.anchor, { transform: position.getTranslateTransform() }]}
    >
      <Animated.View
        style={{
          position: 'absolute',
          left: -half,
          top: -half,
          width: CROSSHAIR_SIZE,
          height: CROSSHAIR_SIZE,
          transform: [{ scale }],
        }}
      >
        <View
          style={[
            styles.ring,
            { borderColor: color, borderRadius: half, width: CROSSHAIR_SIZE, height: CROSSHAIR_SIZE },
          ]}
        />
        {/* Cuatro marcas en cruz */}
        <View style={[styles.tick, { backgroundColor: color, left: half - 1, top: -6, width: 2, height: 14 }]} />
        <View style={[styles.tick, { backgroundColor: color, left: half - 1, bottom: -6, width: 2, height: 14 }]} />
        <View style={[styles.tick, { backgroundColor: color, top: half - 1, left: -6, width: 14, height: 2 }]} />
        <View style={[styles.tick, { backgroundColor: color, top: half - 1, right: -6, width: 14, height: 2 }]} />
        {/* Punto central */}
        <View style={[styles.dot, { backgroundColor: color, left: half - 3, top: half - 3 }]} />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  anchor: { position: 'absolute', left: 0, top: 0, width: 0, height: 0 },
  ring: { position: 'absolute', borderWidth: 2, opacity: 0.9 },
  tick: { position: 'absolute' },
  dot: { position: 'absolute', width: 6, height: 6, borderRadius: 3 },
});
