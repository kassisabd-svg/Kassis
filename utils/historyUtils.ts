import { QueryMode } from '../types';

export interface HistoryItem {
  id: string;
  text: string;
  mode: QueryMode;
  timestamp: number;
}

const HISTORY_KEY = 'albayan_search_history';
const MAX_HISTORY_ITEMS = 10;

export const getHistory = (): HistoryItem[] => {
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
};

export const addToHistory = (text: string, mode: QueryMode) => {
  try {
    const currentHistory = getHistory();
    
    // Remove duplicates of the same text/mode
    const filtered = currentHistory.filter(item => item.text !== text);
    
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      text,
      mode,
      timestamp: Date.now()
    };

    const updated = [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save history', e);
  }
};

export const removeFromHistory = (id: string) => {
  try {
    const currentHistory = getHistory();
    const updated = currentHistory.filter(item => item.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to remove item', e);
  }
};

export const clearHistory = () => {
  localStorage.removeItem(HISTORY_KEY);
};