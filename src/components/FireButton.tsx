// Botón de disparo. Usa onPressIn (no onPress) para que responda al instante al tocar.
import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

interface Props {
  onFire: () => void;
}

export function FireButton({ onFire }: Props) {
  return (
    <Pressable
      onPressIn={onFire}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel="Disparar"
    >
      <Text style={styles.text}>FUEGO</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: '#FF3B5C',
    borderWidth: 4,
    borderColor: '#FFD1D9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { transform: [{ scale: 0.92 }], backgroundColor: '#D62B49' },
  text: { color: '#FFFFFF', fontWeight: '900', fontSize: 16, letterSpacing: 1 },
});
