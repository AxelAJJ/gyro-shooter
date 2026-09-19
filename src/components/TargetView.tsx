// Objetivo circular (diana). Aparece con una animación de "resorte".
import React, { memo, useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import type { Target } from '../types';

interface Props {
  target: Target;
}

function TargetViewBase({ target }: Props) {
  const scale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scale, { toValue: 1, friction: 5, tension: 120, useNativeDriver: true }).start();
  }, [scale]);

  const d = target.radius * 2;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.base,
        {
          left: target.x - target.radius,
          top: target.y - target.radius,
          width: d,
          height: d,
          borderRadius: target.radius,
          transform: [{ scale }],
        },
      ]}
    >
      <View style={[styles.ring, { width: d * 0.68, height: d * 0.68, borderRadius: d * 0.34 }]}>
        <View style={[styles.core, { width: d * 0.3, height: d * 0.3, borderRadius: d * 0.15 }]} />
      </View>
    </Animated.View>
  );
}

// memo: los objetivos no cambian mientras viven, así no se repintan cada 100 ms.
export const TargetView = memo(TargetViewBase, (prev, next) => prev.target.id === next.target.id);

const styles = StyleSheet.create({
  base: {
    position: 'absolute',
    backgroundColor: '#FF3B5C',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFD1D9',
  },
  ring: { backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  core: { backgroundColor: '#FF3B5C' },
});
