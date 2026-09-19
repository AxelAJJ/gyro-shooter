// Botón reutilizable para menús.
import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

interface Props {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
}

export function Button({ title, onPress, variant = 'primary' }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.base, variant === 'primary' ? styles.primary : styles.secondary, pressed && styles.pressed]}
    >
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
  primary: { backgroundColor: '#FF3B5C' },
  secondary: { backgroundColor: 'rgba(255,255,255,0.12)' },
  pressed: { opacity: 0.75 },
  text: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
});
