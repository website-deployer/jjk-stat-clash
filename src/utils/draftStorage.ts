import { DraftSelection } from '../components/PlayerCard';

const STORAGE_KEY = 'jjk-saved-drafts';
const MAX_SAVED_DRAFTS = 5;

export interface SavedDraft {
  id: string;
  name: string;
  timestamp: string;
  draft: DraftSelection;
  players?: DraftSelection[]; // For multi-player drafts
  bans?: string[][]; // For bans
}

/**
 * Get all saved drafts from localStorage
 */
export function getSavedDrafts(): SavedDraft[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to load saved drafts:', error);
    return [];
  }
}

/**
 * Save a draft to localStorage
 */
export function saveDraft(draft: DraftSelection, name?: string): boolean {
  try {
    const savedDrafts = getSavedDrafts();
    const newDraft: SavedDraft = {
      id: Date.now().toString(),
      name: name || `Draft ${savedDrafts.length + 1}`,
      timestamp: new Date().toISOString(),
      draft
    };

    // Add new draft at the beginning
    savedDrafts.unshift(newDraft);

    // Keep only the most recent drafts
    const trimmedDrafts = savedDrafts.slice(0, MAX_SAVED_DRAFTS);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedDrafts));
    return true;
  } catch (error) {
    console.error('Failed to save draft:', error);
    return false;
  }
}

/**
 * Delete a saved draft by ID
 */
export function deleteDraft(id: string): boolean {
  try {
    const savedDrafts = getSavedDrafts();
    const filtered = savedDrafts.filter(d => d.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Failed to delete draft:', error);
    return false;
  }
}

/**
 * Load a draft by ID
 */
export function loadDraft(id: string): DraftSelection | null {
  try {
    const savedDrafts = getSavedDrafts();
    const found = savedDrafts.find(d => d.id === id);
    return found ? found.draft : null;
  } catch (error) {
    console.error('Failed to load draft:', error);
    return null;
  }
}

/**
 * Save full game state with all players
 */
export function saveFullGameState(players: DraftSelection[], bans: string[][], name?: string): boolean {
  try {
    const savedDrafts = getSavedDrafts();
    const newDraft: SavedDraft = {
      id: Date.now().toString(),
      name: name || `Draft ${savedDrafts.length + 1}`,
      timestamp: new Date().toISOString(),
      draft: players[0], // Keep for backward compatibility
      players: players,
      bans: bans
    };

    // Add new draft at the beginning
    savedDrafts.unshift(newDraft);

    // Keep only the most recent drafts
    const trimmedDrafts = savedDrafts.slice(0, MAX_SAVED_DRAFTS);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedDrafts));
    return true;
  } catch (error) {
    console.error('Failed to save full game state:', error);
    return false;
  }
}

/**
 * Load full game state by ID
 */
export function loadFullGameState(id: string): { players: DraftSelection[], bans: string[][] } | null {
  try {
    const savedDrafts = getSavedDrafts();
    const found = savedDrafts.find(d => d.id === id);
    if (found && found.players && found.bans) {
      return { players: found.players, bans: found.bans };
    }
    return null;
  } catch (error) {
    console.error('Failed to load full game state:', error);
    return null;
  }
}
