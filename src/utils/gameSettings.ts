export interface GameSettings {
  banCount: number;
  timerEnabled: boolean;
  timerDuration: number;
}

export const defaultSettings: GameSettings = {
  banCount: 2,
  timerEnabled: false,
  timerDuration: 120,
};
