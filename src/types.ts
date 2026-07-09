/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Task {
  id: string;
  name: string;
  day: string; // 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday'
  timeOfDay: 'morning' | 'evening' | 'general';
  status: 'pending' | 'completed' | 'failed';
  duration: number; // in minutes
}

export interface DayStats {
  day: string;
  completedCount: number;
  totalCount: number;
  percentage: number;
}

export interface AppSettings {
  gridColumns: number;
  universalLabels: boolean;
  theme: 'light' | 'high-contrast-light' | 'dark';
  reminders: boolean;
  streakDays: number;
  wellnessScore: string;
}

export interface SheetsSyncInfo {
  spreadsheetId: string | null;
  spreadsheetUrl: string | null;
  lastSyncedAt: string | null;
  syncing: boolean;
  error: string | null;
}
