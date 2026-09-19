# Gyro Shooter — MVP

Videojuego de disparos para iPhone: apuntas moviendo el teléfono (giroscopio + acelerómetro + sensor de orientación).
Hecho con React Native, Expo (SDK 57), TypeScript y `expo-sensors`.

## Instalación desde cero

```bash
npx create-expo-app@latest gyro-shooter --template blank-typescript
cd gyro-shooter
npx expo install expo-sensors expo-haptics expo-keep-awake
```

Luego copia `App.tsx`, `app.json` y la carpeta `src/` de este proyecto encima.
(Si descargaste el proyecto ya armado, solo necesitas `npm install`.)

## Ejecutar en tu iPhone

1. Instala **Expo Go** desde la App Store.
2. En la carpeta del proyecto: `npx expo start`
3. Escanea el QR con la app Cámara del iPhone y ábrelo en Expo Go.
   (iPhone y computadora en la misma Wi‑Fi. Si no conecta: `npx expo start --tunnel`.)
4. Acepta el permiso de **Movimiento y forma física**.

> Los sensores de movimiento **no existen en el simulador de iOS**: hay que probar en un iPhone real.

## Cómo se juega

1. Menú → ajusta sensibilidad/suavizado → **JUGAR**.
2. Calibración: sostén el iPhone quieto ~1.5 s.
3. Gira el teléfono a los lados (mira horizontal) e inclínalo hacia ti/lejos de ti (mira vertical).
4. **FUEGO** dispara. **CENTRAR** (o agitar el teléfono) recentra la mira.
5. 20 objetivos, 60 segundos. +1 punto por objetivo destruido.

## Estructura

```
App.tsx                       Navegación por estado
src/
├── components/               Crosshair, TargetView, Hud, FireButton, SettingsPanel, Backdrop, Button
├── screens/                  Home, Calibration, Game, Result
├── hooks/                    useGyroAim (apuntado), useGame (lógica), useCalibration,
│                             useSensorsReady, useDeviceOrientation
├── services/sensorService.ts Único archivo que toca expo-sensors
├── utils/                    config.ts (constantes de "game feel"), math.ts
├── types/                    Tipos TypeScript
└── assets/
```

## Si algo no se siente bien

Todo el ajuste fino está en `src/utils/config.ts` (`PIXELS_PER_RADIAN`, `GYRO_DEADZONE`, tiempos, cantidad de objetivos…).
Si la mira se mueve al revés, usa los interruptores **Invertir** del menú.
