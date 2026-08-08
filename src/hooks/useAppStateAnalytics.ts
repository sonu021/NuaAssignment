import { useEffect, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";
import { analytics } from "../services/analytics";

export function useAppStateAnalytics() {
  const appState = useRef<AppStateStatus>(AppState.currentState);
  const sessionStartTime = useRef<number>(Date.now());

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      (nextAppState: AppStateStatus) => {
        const isGoingToBackground =
          appState.current === "active" &&
          (nextAppState === "background" || nextAppState === "inactive");

        if (isGoingToBackground) {
          const sessionDurationSec = Math.round(
            (Date.now() - sessionStartTime.current) / 1000,
          );

          analytics.logEvent("app_backgrounded", {
            previousState: appState.current,
            newState: nextAppState,
            sessionDurationSeconds: sessionDurationSec,
          });
        }

        if (nextAppState === "active") {
          sessionStartTime.current = Date.now();
        }

        appState.current = nextAppState;
      },
    );

    return () => {
      subscription.remove();
    };
  }, []);
}
