// Panel de ajustes de apuntado: sensibilidad, suavizado e inversión de ejes.
import React from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import type { AimSettings } from '../types';
import { AIM_LIMITS } from '../utils/config';
import { clamp } from '../utils/math';

interface Props {
  settings: AimSettings;
  onChange: (next: AimSettings) => void;
}

/** Control con botones − / + (evita depender de una librería de sliders). */
function Stepper({
  label,
  value,
  display,
  onMinus,
  onPlus,
}: {
  label: string;
  value: number;
  display: string;
  onMinus: () => void;
  onPlus: () => void;
}) {
  return (
    <View style={styles.row}>
      <View>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{display}</Text>
      </View>
      <View style={styles.buttons}>
        <Pressable style={styles.stepBtn} onPress={onMinus} accessibilityLabel={`Bajar ${label}`}>
          <Text style={styles.stepText}>−</Text>
        </Pressable>
        <Pressable style={styles.stepBtn} onPress={onPlus} accessibilityLabel={`Subir ${label}`}>
          <Text style={styles.stepText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

export function SettingsPanel({ settings, onChange }: Props) {
  const { sensitivity, smoothing } = AIM_LIMITS;

  // Redondeamos a 2 decimales para evitar errores de coma flotante (0.30000000000000004).
  const step = (current: number, delta: number, min: number, max: number) =>
    Math.round(clamp(current + delta, min, max) * 100) / 100;

  return (
    <View style={styles.card}>
      <Stepper
        label="Sensibilidad"
        value={settings.sensitivity}
        display={`${settings.sensitivity.toFixed(2)}x`}
        onMinus={() =>
          onChange({ ...settings, sensitivity: step(settings.sensitivity, -sensitivity.step, sensitivity.min, sensitivity.max) })
        }
        onPlus={() =>
          onChange({ ...settings, sensitivity: step(settings.sensitivity, sensitivity.step, sensitivity.min, sensitivity.max) })
        }
      />
      <Stepper
        label="Suavizado"
        value={settings.smoothing}
        display={`${Math.round(settings.smoothing * 100)}%`}
        onMinus={() =>
          onChange({ ...settings, smoothing: step(settings.smoothing, -smoothing.step, smoothing.min, smoothing.max) })
        }
        onPlus={() =>
          onChange({ ...settings, smoothing: step(settings.smoothing, smoothing.step, smoothing.min, smoothing.max) })
        }
      />
      <View style={styles.row}>
        <Text style={styles.label}>Invertir horizontal</Text>
        <Switch value={settings.invertX} onValueChange={(invertX) => onChange({ ...settings, invertX })} />
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Invertir vertical</Text>
        <Switch value={settings.invertY} onValueChange={(invertY) => onChange({ ...settings, invertY })} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 18, padding: 16, gap: 14 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { color: '#E6EEFF', fontSize: 16, fontWeight: '600' },
  value: { color: '#7CFFB2', fontSize: 14, marginTop: 2, fontVariant: ['tabular-nums'] },
  buttons: { flexDirection: 'row', gap: 10 },
  stepBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: { color: '#FFFFFF', fontSize: 24, fontWeight: '700', marginTop: -2 },
});
