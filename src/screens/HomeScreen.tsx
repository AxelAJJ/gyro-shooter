// Menú principal: instrucciones breves + ajustes de apuntado + botón Jugar.
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../components/Button';
import { SettingsPanel } from '../components/SettingsPanel';
import type { AimSettings } from '../types';
import { SAFE_BOTTOM, SAFE_TOP } from '../utils/config';

interface Props {
  settings: AimSettings;
  onChangeSettings: (next: AimSettings) => void;
  onPlay: () => void;
}

export function HomeScreen({ settings, onChangeSettings, onPlay }: Props) {
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>GYRO SHOOTER</Text>
      <Text style={styles.subtitle}>
        Apunta moviendo tu iPhone. Gira a los lados para mover la mira horizontalmente e inclínalo
        hacia ti o lejos de ti para moverla en vertical. Toca FUEGO para disparar.
      </Text>

      <Text style={styles.section}>Ajustes de apuntado</Text>
      <SettingsPanel settings={settings} onChange={onChangeSettings} />
      <Text style={styles.hint}>
        Si la mira se mueve al lado contrario de lo esperado, activa "Invertir". Durante la partida
        puedes agitar el teléfono o tocar CENTRAR para recentrar la mira.
      </Text>

      <View style={styles.spacer} />
      <Button title="JUGAR" onPress={onPlay} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0B1020' },
  content: { paddingTop: SAFE_TOP + 16, paddingBottom: SAFE_BOTTOM + 16, paddingHorizontal: 20, gap: 14 },
  title: { color: '#FFFFFF', fontSize: 34, fontWeight: '900', letterSpacing: 2 },
  subtitle: { color: '#A8B8D8', fontSize: 16, lineHeight: 23 },
  section: { color: '#7CFFB2', fontSize: 13, fontWeight: '800', letterSpacing: 1, marginTop: 10, textTransform: 'uppercase' },
  hint: { color: '#8FA3C7', fontSize: 13, lineHeight: 19 },
  spacer: { height: 8 },
});
