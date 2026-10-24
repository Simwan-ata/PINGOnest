/**
 * PingoNest Pro - Python API Integration Service
 * Communicates with the Python SQLite / FastAPI backend (`server.py`).
 * Automatically falls back to localStorage (`StorageService`) if server is offline.
 */

import { EnterpriseBackup, StorageService } from './storageService';

export interface BackendStatus {
  online: boolean;
  engine?: string;
  database?: string;
  timestamp?: string;
}

const API_BASE = '/api';

export class ApiService {
  /**
   * Check if Python server is online
   */
  static async checkStatus(): Promise<BackendStatus> {
    try {
      const res = await fetch(`${API_BASE}/health`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        return {
          online: true,
          engine: data.engine || data.framework || 'Python 3 Backend',
          database: data.database || 'SQLite3',
          timestamp: data.timestamp
        };
      }
    } catch {
      // Offline or network error
    }
    return { online: false };
  }

  /**
   * Load organizational state from Python SQLite or localStorage fallback
   */
  static async loadOrgData(): Promise<{ source: 'server' | 'local' | 'default'; data: EnterpriseBackup | null }> {
    try {
      const res = await fetch(`${API_BASE}/org`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        const serverData = await res.json();
        if (serverData && serverData.people && serverData.people.length > 0) {
          return { source: 'server', data: serverData };
        }
      }
    } catch {
      // Offline fallback
    }

    // Fallback to local storage
    const local = StorageService.loadMainData();
    if (local && local.people && local.people.length > 0) {
      return { source: 'local', data: local };
    }

    return { source: 'default', data: null };
  }

  /**
   * Save organizational state to both Python backend and local storage
   */
  static async saveOrgData(backup: EnterpriseBackup): Promise<{ serverSaved: boolean; localSaved: boolean }> {
    // 1. Always save locally first for instantaneous responsiveness & offline resilience
    const localSaved = StorageService.saveMainData(backup);

    // 2. Sync to Python SQLite backend
    let serverSaved = false;
    try {
      const res = await fetch(`${API_BASE}/org`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(backup)
      });
      serverSaved = res.ok;
    } catch {
      serverSaved = false;
    }

    return { serverSaved, localSaved };
  }
}
