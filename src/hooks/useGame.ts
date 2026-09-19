// ─────────────────────────────────────────────────────────────
// Lógica de la partida: aparición de objetivos, expiración, puntaje, tiempo y disparo.
//
// Diseño: el estado "real" vive en refs (rápido y sin renderizados extra) y cada 100 ms,
// o tras cada disparo, se publica una copia a `ui` (React state) para pintar la interfaz.
// ─────────────────────────────────────────────────────────────
import { useCallback, useEffect, useRef, useState } from 'react';
import type { GameResult, GameUiState, ShotEvent, Target, Vec2 } from '../types';
import { GAME_CONFIG } from '../utils/config';
import { distance, randomRange } from '../utils/math';

/** Zona (px) donde pueden aparecer los centros de los objetivos. */
export interface SpawnArea {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

interface Params {
  spawnArea: SpawnArea;
  /** Devuelve la posición actual de la mira (px). */
  getAim: () => Vec2;
  onFinish: (result: GameResult) => void;
}

const TICK_MS = 100;
const FINISH_DELAY_MS = 500; // pequeña pausa para ver el último impacto

/** Elige una posición aleatoria que no se solape con los objetivos existentes. */
function pickPosition(area: SpawnArea, existing: Target[]): Vec2 {
  const r = GAME_CONFIG.targetRadius;
  let candidate: Vec2 = { x: 0, y: 0 };
  for (let attempt = 0; attempt < 12; attempt++) {
    candidate = {
      x: randomRange(area.minX + r, area.maxX - r),
      y: randomRange(area.minY + r, area.maxY - r),
    };
    if (existing.every((t) => distance(candidate, t) >= r * 2.4)) break;
  }
  return candidate;
}

export function useGame({ spawnArea, getAim, onFinish }: Params) {
  const [ui, setUi] = useState<GameUiState>({
    targets: [],
    score: 0,
    remaining: GAME_CONFIG.totalTargets,
    timeLeftMs: GAME_CONFIG.durationSec * 1000,
  });
  const [lastShot, setLastShot] = useState<ShotEvent | null>(null);

  // Estado mutable de la partida.
  const targetsRef = useRef<Target[]>([]);
  const stats = useRef({
    score: 0,
    expired: 0,
    spawned: 0,
    shots: 0,
    nextTargetId: 1,
    nextShotId: 1,
    lastSpawnAt: 0,
    startAt: 0,
    finished: false,
  });
  const timers = useRef<{
    interval?: ReturnType<typeof setInterval>;
    finish?: ReturnType<typeof setTimeout>;
  }>({});

  // Refs para leer siempre los valores más recientes desde callbacks estables.
  const areaRef = useRef(spawnArea);
  areaRef.current = spawnArea;
  const getAimRef = useRef(getAim);
  getAimRef.current = getAim;
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;

  /** Termina la partida (una sola vez) y avisa a la pantalla. */
  const finish = useCallback((now: number, reason: GameResult['reason']) => {
    const st = stats.current;
    if (st.finished) return;
    st.finished = true;
    clearInterval(timers.current.interval);
    const result: GameResult = {
      score: st.score,
      total: GAME_CONFIG.totalTargets,
      shots: st.shots,
      hits: st.score,
      timeUsedSec: Math.min(GAME_CONFIG.durationSec, (now - st.startAt) / 1000),
      reason,
    };
    timers.current.finish = setTimeout(() => onFinishRef.current(result), FINISH_DELAY_MS);
  }, []);

  /** Copia el estado interno a React y comprueba si la partida terminó. */
  const publish = useCallback(
    (now: number) => {
      const st = stats.current;
      const timeLeftMs = Math.max(0, GAME_CONFIG.durationSec * 1000 - (now - st.startAt));
      const remaining = GAME_CONFIG.totalTargets - st.score - st.expired;
      setUi({ targets: [...targetsRef.current], score: st.score, remaining, timeLeftMs });

      if (remaining <= 0) finish(now, 'completed');
      else if (timeLeftMs <= 0) finish(now, 'timeout');
    },
    [finish],
  );

  /** Un "latido" del juego: expira y genera objetivos. */
  const tick = useCallback(() => {
    const st = stats.current;
    if (st.finished) return;
    const now = Date.now();

    // Expiración: los que nadie disparó desaparecen (cuentan como fallados).
    const alive = targetsRef.current.filter((t) => t.expiresAt > now);
    st.expired += targetsRef.current.length - alive.length;
    targetsRef.current = alive;

    // Aparición aleatoria (respetando máximo simultáneo y cadencia).
    if (
      st.spawned < GAME_CONFIG.totalTargets &&
      alive.length < GAME_CONFIG.maxActiveTargets &&
      now - st.lastSpawnAt >= GAME_CONFIG.spawnIntervalMs
    ) {
      const { x, y } = pickPosition(areaRef.current, alive);
      targetsRef.current = [
        ...alive,
        {
          id: st.nextTargetId++,
          x,
          y,
          radius: GAME_CONFIG.targetRadius,
          expiresAt: now + GAME_CONFIG.targetLifetimeMs,
        },
      ];
      st.spawned += 1;
      st.lastSpawnAt = now;
    }

    publish(now);
  }, [publish]);

  // Arranque / limpieza del bucle.
  useEffect(() => {
    const st = stats.current;
    Object.assign(st, {
      score: 0,
      expired: 0,
      spawned: 0,
      shots: 0,
      nextTargetId: 1,
      nextShotId: 1,
      finished: false,
      startAt: Date.now(),
      lastSpawnAt: 0,
    });
    targetsRef.current = [];

    tick();
    timers.current.interval = setInterval(tick, TICK_MS);
    return () => {
      clearInterval(timers.current.interval);
      clearTimeout(timers.current.finish);
    };
  }, [tick]);

  /**
   * DISPARO. Detección de colisión "hitscan": si la mira (con una pequeña tolerancia)
   * está dentro del círculo de un objetivo, se destruye. Si hay varios, el más cercano.
   */
  const fire = useCallback((): ShotEvent | null => {
    const st = stats.current;
    if (st.finished) return null;

    const aim = getAimRef.current();
    st.shots += 1;

    let hitId: number | null = null;
    let bestDistance = Infinity;
    for (const t of targetsRef.current) {
      const d = distance(aim, t);
      if (d <= t.radius + GAME_CONFIG.hitTolerance && d < bestDistance) {
        hitId = t.id;
        bestDistance = d;
      }
    }

    if (hitId !== null) {
      targetsRef.current = targetsRef.current.filter((t) => t.id !== hitId);
      st.score += 1; // +1 punto por objetivo destruido
    }

    const shot: ShotEvent = { id: st.nextShotId++, hit: hitId !== null };
    setLastShot(shot);
    publish(Date.now());
    return shot;
  }, [publish]);

  return { ui, lastShot, fire };
}
