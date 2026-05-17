"use client";

import { useEffect, useState, type RefObject } from "react";

type UseTiltOptions = {
  disabled?: boolean;
  maxDeviceTilt?: number;
  targetRef?: RefObject<HTMLElement | null>;
};

type TiltVector = {
  x: number;
  y: number;
  active: boolean;
};

const ZERO_TILT: TiltVector = { x: 0, y: 0, active: false };
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function useTilt({
  disabled = false,
  maxDeviceTilt = 18,
  targetRef
}: UseTiltOptions = {}): TiltVector {
  const [tilt, setTilt] = useState<TiltVector>(ZERO_TILT);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(REDUCED_MOTION_QUERY);
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (disabled || reduced) {
      setTilt(ZERO_TILT);
      return;
    }

    const target = targetRef?.current ?? null;
    let rafId: number | null = null;
    let nextTilt: TiltVector | null = null;

    function flush() {
      rafId = null;
      if (nextTilt) {
        setTilt(nextTilt);
        nextTilt = null;
      }
    }

    function schedule(value: TiltVector) {
      nextTilt = value;
      if (rafId === null) {
        rafId = window.requestAnimationFrame(flush);
      }
    }

    function updateFromPointer(event: PointerEvent) {
      const rect = target?.getBoundingClientRect();
      const cx = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
      const cy = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;
      const w = rect ? rect.width / 2 : window.innerWidth / 2;
      const h = rect ? rect.height / 2 : window.innerHeight / 2;

      schedule({
        x: clamp((event.clientX - cx) / w, -1, 1),
        y: clamp((event.clientY - cy) / h, -1, 1),
        active: true
      });
    }

    function resetTilt() {
      schedule(ZERO_TILT);
    }

    let baseGamma: number | null = null;
    let baseBeta: number | null = null;

    function updateFromDevice(event: DeviceOrientationEvent) {
      let { gamma, beta } = event;
      if (typeof gamma !== "number" || typeof beta !== "number") {
        return;
      }

      // Handle orientation changes (landscape vs portrait)
      const orientation = (window.screen?.orientation?.type || window.orientation || "") as string | number;
      const isLandscape = typeof orientation === "string" ? orientation.includes("landscape") : Math.abs(orientation as number) === 90;

      if (isLandscape) {
        const tmp = gamma;
        gamma = beta;
        beta = -tmp;
      }

      if (baseGamma === null) baseGamma = gamma;
      if (baseBeta === null) baseBeta = beta;

      // Low pass filter to slowly re-center the baseline (drift)
      baseGamma = baseGamma * 0.95 + gamma * 0.05;
      baseBeta = baseBeta * 0.95 + beta * 0.05;

      const diffGamma = gamma - baseGamma;
      const diffBeta = beta - baseBeta;

      schedule({
        x: clamp(diffGamma / maxDeviceTilt, -1, 1),
        y: clamp(diffBeta / maxDeviceTilt, -1, 1),
        active: true
      });
    }

    const pointerHost: HTMLElement | Window = target ?? window;
    pointerHost.addEventListener("pointermove", updateFromPointer as EventListener, {
      passive: true
    });
    if (target) {
      target.addEventListener("pointerleave", resetTilt, { passive: true });
    }

    // Attempt to bind gyroscope, with fallback for iOS 13+ permission flow
    let isGyroBound = false;
    let handleGesture: (() => Promise<void>) | null = null;

    function bindGyro() {
      if (!isGyroBound) {
        window.addEventListener("deviceorientation", updateFromDevice, { passive: true });
        isGyroBound = true;
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof (window as any).DeviceOrientationEvent?.requestPermission === "function") {
      handleGesture = async () => {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const permission = await (window as any).DeviceOrientationEvent.requestPermission();
          if (permission === "granted") {
            bindGyro();
          }
        } catch (error) {
          // Ignore
        }
        if (handleGesture) {
          document.removeEventListener("click", handleGesture);
          document.removeEventListener("touchend", handleGesture);
        }
      };
      
      document.addEventListener("click", handleGesture);
      document.addEventListener("touchend", handleGesture);
    } else {
      bindGyro();
    }

    return () => {
      pointerHost.removeEventListener("pointermove", updateFromPointer as EventListener);
      if (target) {
        target.removeEventListener("pointerleave", resetTilt);
      }
      if (isGyroBound) {
        window.removeEventListener("deviceorientation", updateFromDevice);
      }
      if (handleGesture) {
        document.removeEventListener("click", handleGesture);
        document.removeEventListener("touchend", handleGesture);
      }
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, [disabled, reduced, maxDeviceTilt, targetRef]);

  return tilt;
}
