// Pantalla de juego: junta sensores (mira), lógica (objetivos/puntos) y la interfaz.
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useMemo } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Backdrop } from '../components/Backdrop';
import { Crosshair } from '../components/Crosshair';
import { FireButton } from '../components/FireButton';
import { Hud } from '../components/Hud';
import { TargetView } from '../components/TargetView';
import { useIsPortrait } from '../hooks/useDeviceOrientation';
import { useGame } from '../hooks/useGame';
import { useGyroAim } from '../hooks/useGyroAim';
import type { AimSettings, Calibration, GameResult } from '../types';
import { CROSSHAIR_MARGIN, SAFE_BOTTOM, SAFE_TOP } from '../utils/config';

interface Props {
  settings: AimSettings;
  calibration: Calibration;
  onFinish: (result: GameResult) => void;
  onExit: () => void;
}

const HUD_HEIGHT = 84;
const BOTTOM_BAR_HEIGHT = 140;

export function GameScreen({ settings, calibration, onFinish, onExit }: Props) {
  const { width, height } = useWindowDimensions();
  const showPortraitWarning = !useIsPortrait();

  // Límites: la mira no puede salir de la pantalla.
  const bounds = useMemo(
    () => ({
      minX: CROSSHAIR_MARGIN,
      maxX: width - CROSSHAIR_MARGIN,
      minY: CROSSHAIR_MARGIN,
      maxY: height - CROSSHAIR_MARGIN,
    }),
    [width, height],
  );

  // Zona donde aparecen objetivos: debajo del HUD y encima de los botones.
  const spawnArea = useMemo(
    () => ({
      minX: 16,
      maxX: width - 16,
      minY: SAFE_TOP + HUD_HEIGHT,
      maxY: height - SAFE_BOTTOM - BOTTOM_BAR_HEIGHT,
    }),
    [width, height],
  );

  const { position, getPosition, recenter } = useGyroAim({ bounds, settings, calibration });
  const { ui, lastShot, fire } = useGame({ spawnArea, getAim: getPosition, onFinish });

  // Mantener la pantalla encendida durante la partida.
  useEffect(() => {
    activateKeepAwakeAsync('game');
    return () => {
      deactivateKeepAwake('game');
    };
  }, []);

  const handleFire = useCallback(() => {
    const shot = fire();
    if (!shot) return;
    // Vibración: fuerte si aciertas, ligera si fallas.
    Haptics.impactAsync(
      shot.hit ? Haptics.ImpactFeedbackStyle.Heavy : Haptics.ImpactFeedbackStyle.Light,
    );
  }, [fire]);

  return (
    <View style={styles.screen}>
      <Backdrop />

      {/* Objetivos */}
      {ui.targets.map((t) => (
        <TargetView key={t.id} target={t} />
      ))}

      {/* Mira (encima de los objetivos) */}
      <Crosshair position={position} shot={lastShot} />

      {/* HUD */}
      <View style={[styles.hud, { top: SAFE_TOP }]}>
        <Hud score={ui.score} remaining={ui.remaining} timeLeftMs={ui.timeLeftMs} />
      </View>

      {showPortraitWarning && (
        <View style={styles.warning} pointerEvents="none">
          <Text style={styles.warningText}>Sostén el iPhone en vertical</Text>
        </View>
      )}

      {/* Barra inferior: utilidades a la izquierda, disparo a la derecha */}
      <View style={[styles.bottom, { bottom: SAFE_BOTTOM }]}>
        <View style={styles.utilities}>
          <Pressable style={styles.smallBtn} onPress={recenter}>
            <Text style={styles.smallText}>CENTRAR</Text>
          </Pressable>
          <Pressable style={styles.smallBtn} onPress={onExit}>
            <Text style={styles.smallText}>SALIR</Text>
          </Pressable>
        </View>
        <FireButton onFire={handleFire} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0B1020', overflow: 'hidden' },
  hud: { position: 'absolute', left: 0, right: 0 },
  warning: {
    position: 'absolute',
    top: SAFE_TOP + HUD_HEIGHT - 12,
    alignSelf: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(255,184,107,0.9)',
  },
  warningText: { color: '#1B1200', fontWeight: '800', fontSize: 13 },
  bottom: {
    position: 'absolute',
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  utilities: { gap: 10 },
  smallBtn: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  smallText: { color: '#E6EEFF', fontWeight: '800', fontSize: 13, letterSpacing: 1 },
});
