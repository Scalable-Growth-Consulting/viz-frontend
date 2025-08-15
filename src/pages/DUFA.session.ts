// DUFA session persistence utilities
export const DUFA_SESSION_KEY = 'viz-dufa-session-v1';

export interface DUFASession {
  uploadedDatasetName?: string;
  selectedDatasets?: any[];
  forecastConfig?: any;
  forecastResults?: any[];
  bestModel?: any;
  chatMessages?: any[];
  progress?: any;
  currentStep?: number;
}

export function saveDUFASession(session: DUFASession) {
  try {
    localStorage.setItem(DUFA_SESSION_KEY, JSON.stringify(session));
  } catch (e) {
    // Ignore
  }
}

export function loadDUFASession(): DUFASession | null {
  try {
    const raw = localStorage.getItem(DUFA_SESSION_KEY);
    if (raw) return JSON.parse(raw);
    return null;
  } catch (e) {
    return null;
  }
}

export function clearDUFASession() {
  try {
    localStorage.removeItem(DUFA_SESSION_KEY);
  } catch (e) {}
}
