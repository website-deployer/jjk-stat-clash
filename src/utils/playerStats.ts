export interface MatchRecord {
  date: string;
  mode: string;
  playerCount: number;
  won: boolean;
  playerName: string;
  score: number;
  opponentScore: number;
  pairingsUsed: string[];
}

const STATS_KEY = 'jjk-player-stats';

export function getMatchHistory(): MatchRecord[] {
  try {
    const stored = localStorage.getItem(STATS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function addMatchRecord(record: MatchRecord): void {
  const history = getMatchHistory();
  history.unshift(record);
  localStorage.setItem(STATS_KEY, JSON.stringify(history.slice(0, 100)));
}

export function getPlayerStats() {
  const history = getMatchHistory();
  const totalMatches = history.length;
  const totalWins = history.filter(m => m.won).length;
  const winRate = totalMatches > 0 ? (totalWins / totalMatches) * 100 : 0;
  const bestScore = history.length > 0 ? Math.max(...history.map(m => m.score)) : 0;
  return { totalMatches, totalWins, totalLosses: totalMatches - totalWins, winRate, bestScore };
}
