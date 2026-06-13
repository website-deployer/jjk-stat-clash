// src/data/dataLoader.ts
import { Character, Ability, Entity, Pairing } from './characters';

// This file will help manage modular data loading
export interface DataLoaders {
  characters: Character[];
  abilities: Ability[];
  pairings: Pairing[];
}

// For now, we'll keep the current approach but provide a framework for future modularization
export const loadData = async (): Promise<DataLoaders> => {
  // This is where we'd implement lazy loading for large data sets
  const { characters, pairings } = await import('./characters');
  // For abilities we need to handle the type properly - they're mixed in with characters
  const abilities = characters.filter((c): c is Ability => c.category !== 'character');
  
  return {
    characters: characters.filter((c): c is Character => c.category === 'character'),
    abilities,
    pairings
  };
};

// For immediate use, we can export the data directly  
export { characters, pairings } from './characters';