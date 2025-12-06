import React from 'react';

export enum AppView {
  HOME = 'HOME',
  CHAT = 'CHAT',
  QURAN = 'QURAN',
  HADITH = 'HADITH',
  SUNNAH = 'SUNNAH',
  HISTORY = 'HISTORY',
  FATWA = 'FATWA',
  SETTINGS = 'SETTINGS',
  SCHOLARS = 'SCHOLARS' // Replaces CALENDAR
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
  HISTORY = 'history',
  SCHOLARS = 'scholars' // New Mode
}

export interface TopicCardProps {
  title: string;
  icon: React.ReactNode;
  description: string;
  onClick: () => void;
}