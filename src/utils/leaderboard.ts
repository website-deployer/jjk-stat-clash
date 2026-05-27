import { db } from './firebase';
import { collection, doc, setDoc, getDoc, updateDoc, increment, query, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';

export interface LeaderboardEntry {
  playerId: string;
  playerName: string;
  totalWins: number;
  totalMatches: number;
  winRate: number;
  lastPlayed: string;
  bestSynergy: string;
}

const LEADERBOARD_COLLECTION = 'leaderboards';

function requireDb() {
  if (!db) throw new Error('Firebase not initialized');
  return db;
}

export async function initializePlayer(playerId: string, playerName: string): Promise<void> {
  const fdb = requireDb();
  const playerRef = doc(fdb, LEADERBOARD_COLLECTION, playerId);
  const playerDoc = await getDoc(playerRef);

  if (!playerDoc.exists()) {
    await setDoc(playerRef, {
      playerId,
      playerName,
      totalWins: 0,
      totalMatches: 0,
      winRate: 0,
      lastPlayed: Timestamp.now().toDate().toISOString(),
      bestSynergy: '',
    });
  }
}

export async function recordMatchResult(
  playerId: string,
  playerName: string,
  won: boolean,
  synergyCombo?: string
): Promise<void> {
  const fdb = requireDb();
  const playerRef = doc(fdb, LEADERBOARD_COLLECTION, playerId);

  await updateDoc(playerRef, {
    totalMatches: increment(1),
    totalWins: won ? increment(1) : increment(0),
    lastPlayed: Timestamp.now().toDate().toISOString(),
    ...(synergyCombo && { bestSynergy: synergyCombo }),
  });

  const updatedDoc = await getDoc(playerRef);
  const data = updatedDoc.data();
  if (data) {
    const winRate = data.totalMatches > 0 ? (data.totalWins / data.totalMatches) * 100 : 0;
    await updateDoc(playerRef, { winRate });
  }
}

export async function getTopPlayers(limitCount: number = 100): Promise<LeaderboardEntry[]> {
  const fdb = requireDb();
  const q = query(
    collection(fdb, LEADERBOARD_COLLECTION),
    orderBy('winRate', 'desc'),
    orderBy('totalWins', 'desc'),
    limit(limitCount)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data() as LeaderboardEntry);
}

export async function getPlayerEntry(playerId: string): Promise<LeaderboardEntry | null> {
  const fdb = requireDb();
  const playerRef = doc(fdb, LEADERBOARD_COLLECTION, playerId);
  const playerDoc = await getDoc(playerRef);

  if (playerDoc.exists()) {
    return playerDoc.data() as LeaderboardEntry;
  }
  return null;
}
