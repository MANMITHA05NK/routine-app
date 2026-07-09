/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Task, AppSettings } from './types';

/**
 * Searches for a spreadsheet named "Routines Tracker" in the user's Google Drive.
 * Returns the spreadsheet ID if found, otherwise null.
 */
export async function findRoutinesSpreadsheet(accessToken: string): Promise<{ id: string; name: string } | null> {
  const query = encodeURIComponent("name = 'Routines Tracker' and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false");
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to search Drive: ${response.statusText}`);
  }

  const data = await response.json();
  if (data.files && data.files.length > 0) {
    return { id: data.files[0].id, name: data.files[0].name };
  }
  return null;
}

/**
 * Creates a new spreadsheet named "Routines Tracker" in Google Sheets with "Tasks" and "Settings" tabs.
 */
export async function createRoutinesSpreadsheet(accessToken: string): Promise<{ id: string; url: string }> {
  const url = 'https://sheets.googleapis.com/v4/spreadsheets';
  const body = {
    properties: {
      title: 'Routines Tracker',
    },
    sheets: [
      {
        properties: {
          title: 'Tasks',
          gridProperties: {
            rowCount: 200,
            columnCount: 6,
            frozenRowCount: 1,
          },
        },
      },
      {
        properties: {
          title: 'Settings',
          gridProperties: {
            rowCount: 20,
            columnCount: 2,
            frozenRowCount: 1,
          },
        },
      },
    ],
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Failed to create spreadsheet: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    id: data.spreadsheetId,
    url: data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${data.spreadsheetId}`,
  };
}

/**
 * Writes tasks and settings to Google Sheets.
 */
export async function syncToSpreadsheet(
  accessToken: string,
  spreadsheetId: string,
  tasks: Task[],
  settings: AppSettings
): Promise<void> {
  // 1. Prepare "Tasks" sheet values
  const tasksHeaders = ['Task ID', 'Name', 'Day', 'Time of Day', 'Status', 'Duration (mins)'];
  const tasksRows = tasks.map(task => [
    task.id,
    task.name,
    task.day,
    task.timeOfDay,
    task.status,
    task.duration,
  ]);
  const tasksData = [tasksHeaders, ...tasksRows];

  // We write to Tasks!A1:F[N]
  const tasksRange = `Tasks!A1:F${tasksData.length}`;

  // 2. Prepare "Settings" sheet values
  const settingsData = [
    ['Key', 'Value'],
    ['Grid Columns', settings.gridColumns.toString()],
    ['Universal Labels', settings.universalLabels.toString()],
    ['Theme', settings.theme],
    ['Reminders', settings.reminders.toString()],
    ['Streak Days', settings.streakDays.toString()],
    ['Wellness Score', settings.wellnessScore],
  ];
  const settingsRange = `Settings!A1:B${settingsData.length}`;

  // Call sheets batchUpdate values endpoint
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`;
  const body = {
    valueInputOption: 'RAW',
    data: [
      {
        range: tasksRange,
        values: tasksData,
      },
      {
        range: settingsRange,
        values: settingsData,
      },
    ],
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Failed to sync to Sheets: ${response.statusText}`);
  }
}

/**
 * Reads tasks and settings from Google Sheets.
 */
export async function syncFromSpreadsheet(
  accessToken: string,
  spreadsheetId: string
): Promise<{ tasks: Task[]; settings: AppSettings }> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchGet?ranges=Tasks!A2:F200&ranges=Settings!A2:B15`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch from Sheets: ${response.statusText}`);
  }

  const data = await response.json();
  const valueRanges = data.valueRanges || [];

  // Parse Tasks (Tasks!A2:F200)
  const tasksRange = valueRanges[0];
  const tasks: Task[] = [];
  if (tasksRange && tasksRange.values) {
    tasksRange.values.forEach((row: any[]) => {
      if (row.length >= 5) {
        tasks.push({
          id: row[0] || `task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          name: row[1] || '',
          day: row[2] || 'Monday',
          timeOfDay: (row[3] as any) || 'general',
          status: (row[4] as any) || 'pending',
          duration: parseInt(row[5] || '0', 10) || 0,
        });
      }
    });
  }

  // Parse Settings (Settings!A2:B15)
  const settingsRange = valueRanges[1];
  const settings: AppSettings = {
    gridColumns: 4,
    universalLabels: true,
    theme: 'light',
    reminders: true,
    streakDays: 12,
    wellnessScore: '4/5',
  };

  if (settingsRange && settingsRange.values) {
    settingsRange.values.forEach((row: any[]) => {
      const key = row[0];
      const val = row[1];
      if (key && val) {
        if (key === 'Grid Columns') settings.gridColumns = parseInt(val, 10) || 4;
        if (key === 'Universal Labels') settings.universalLabels = val === 'true';
        if (key === 'Theme') settings.theme = val as any;
        if (key === 'Reminders') settings.reminders = val === 'true';
        if (key === 'Streak Days') settings.streakDays = parseInt(val, 10) || 12;
        if (key === 'Wellness Score') settings.wellnessScore = val;
      }
    });
  }

  return { tasks, settings };
}
