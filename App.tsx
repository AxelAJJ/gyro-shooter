// ─────────────────────────────────────────────────────────────
// Raíz de la app. Navegación mínima por estado (sin librerías extra):
//   home → calibration → game → result → (game | calibration | home)
// ─────────────────────────────────────────────────────────────
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { CalibrationScreen } from './src/screens/CalibrationScreen';
import { GameScreen } from './src/screens/GameScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { ResultScreen } from './src/screens/ResultScreen';
import type { AimSettings, Calibration, GameResult, ScreenName } from './src/types';
import { DEFAULT_AIM_SETTINGS } from './src/utils/config';

export default function App() {
  const [screen, setScreen] = useState<ScreenName>('home');
  const [settings, setSettings] = useState<AimSettings>(DEFAULT_AIM_SETTINGS);
  const [calibration, setCalibration] = useState<Calibration | null>(null);
  const [result, setResult] = useState<GameResult | null>(null);
  // Cambiar la `key` de GameScreen reinicia por completo la partida.
  const [gameId, setGameId] = useState(0);

  const startGame = () => {
    setGameId((id) => id + 1);
    setScreen('game');
  };

  let content: React.ReactNode = null;

  if (screen === 'home') {
    content = (
      <HomeScreen
        settings={settings}
        onChangeSettings={setSettings}
        onPlay={() => setScreen('calibration')}
      />
    );
  } else if (screen === 'calibration') {
    content = (
      <CalibrationScreen
        onDone={(c) => {
          setCalibration(c);
          startGame();
        }}
        onCancel={() => setScreen('home')}
      />
    );
  } else if (screen === 'game' && calibration) {
    content = (
      <GameScreen
        key={gameId}
        settings={settings}
        calibration={calibration}
        onFinish={(r) => {
          setResult(r);
          setScreen('result');
        }}
        onExit={() => setScreen('home')}
      />
    );
  } else if (screen === 'result' && result) {
    content = (
      <ResultScreen
        result={result}
        onPlayAgain={startGame}
        onRecalibrate={() => setScreen('calibration')}
        onMenu={() => setScreen('home')}
      />
    );
  }

  return (
    <>
      <StatusBar style="light" />
      {content}
    </>
  );
}
