type DUFASession = {
  currentStep?: number;
  uploadedDatasetName?: string;
  selectedDatasets?: any[];
  forecastConfig?: any;
  forecastResults?: any[];
  bestModel?: any;
  chatMessages?: any[];
  progress?: {
    upload: boolean;
    dataSelection: boolean;
    forecastConfiguration: boolean;
    forecastResults: boolean;
    chatInteraction: boolean;
    pdfDownload: boolean;
  };
};

const SESSION_KEY = 'dufa_session';

/**
 * Saves the current DUFA session to localStorage
 */
export const saveDUFASession = (session: DUFASession) => {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch (error) {
    console.error('Failed to save DUFA session:', error);
  }
};

/**
 * Loads the DUFA session from localStorage
 */
export const loadDUFASession = (): DUFASession | null => {
  try {
    const session = localStorage.getItem(SESSION_KEY);
    return session ? JSON.parse(session) : null;
  } catch (error) {
    console.error('Failed to load DUFA session:', error);
    return null;
  }
};

/**
 * Clears the DUFA session from localStorage
 */
export const clearDUFASession = () => {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch (error) {
    console.error('Failed to clear DUFA session:', error);
  }
};
