import React, { useEffect, useState } from 'react';

export interface ElectronAPI {
  getHomeDirectory: () => Promise<string>;
  getAppPath: () => Promise<string>;
  openFile: (options: any) => Promise<any>;
  writeFile: (filepath: string, data: any) => Promise<any>;
  readFile: (filepath: string) => Promise<any>;
  platform: string;
  arch: string;
  appVersion: string;
  on: (channel: string, func: (...args: any[]) => void) => void;
  off: (channel: string, func: (...args: any[]) => void) => void;
  send: (channel: string, ...args: any[]) => void;
  invoke: (channel: string, ...args: any[]) => Promise<any>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export function useElectron() {
  const [electron, setElectron] = useState<ElectronAPI | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.electronAPI) {
      setElectron(window.electronAPI);
    }
  }, []);

  return electron;
}

export function useFileOperations() {
  const electron = useElectron();

  return {
    openFile: electron?.openFile || null,
    writeFile: electron?.writeFile || null,
    readFile: electron?.readFile || null,
    getHomeDirectory: electron?.getHomeDirectory || null,
  };
}
