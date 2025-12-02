import React from 'react';

export enum AppView {
  HOME = 'HOME',
  CHAT = 'CHAT',
  QURAN = 'QURAN',
  HADITH = 'HADITH',
  SUNNAH = 'SUNNAH',
  HISTORY = 'HISTORY', // New View
  FATWA = 'FATWA',
  SETTINGS = 'SETTINGS',
  CALENDAR = 'CALENDAR'
}

export type Language = 'ar' | 'en' | 'fr';

export type FontSize = 'small' | 'medium' | 'large' | 'xlarge';

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  isStreaming?: boolean;
  timestamp: number;
}

export enum QueryMode {
  GENERAL = 'general',
  FATWA = 'fatwa',
  QURAN = 'quran',
  HADITH = 'hadith',
  SUNNAH = 'sunnah',
  HISTORY = 'history' // New Mode
}

export interface TopicCardProps {
  title: string;
  icon: React.ReactNode;
  description: string;
  onClick: () => void;
}