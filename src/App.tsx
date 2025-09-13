import { useState } from 'react';
import AnimateApp from './AnimateApp';
import ExcalidrawApp from './ExcalidrawApp';

import type { AppState, BinaryFiles } from '@excalidraw/excalidraw/types';
import type { ExcalidrawElement } from '@excalidraw/excalidraw/element/types';
import { AnimationData } from './AnimateConfig';

const STORAGE_KEY = 'excalidraw-app';
const ANIMATION_STORAGE_KEY = 'excalidraw-animation-data';

const loadFromStorage = ():
  | { elements: ExcalidrawElement[]; appState: AppState; files: BinaryFiles }
  | undefined => {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '');
    data.appState.collaborators = new Map();
    data.scrollToContent = true;
    return data;
  } catch {
    return undefined;
  }
};

const saveToStorage = (
  data: {
    elements: readonly ExcalidrawElement[];
    appState: AppState;
    files: BinaryFiles;
  },
  animationData: AnimationData,
) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    localStorage.setItem(ANIMATION_STORAGE_KEY, JSON.stringify(animationData));
  } catch {
    // ignore
  }
};

const loadAnimationDataFromStorage = (): AnimationData => {
  try {
    return JSON.parse(localStorage.getItem(ANIMATION_STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
};

type ViewMode = 'animate' | 'excalidraw';

const App = () => {
  const [mode, setMode] = useState<ViewMode>('animate');
  const [animationData, setAnimationData] = useState<AnimationData>(
    loadAnimationDataFromStorage(),
  );

  const toggleMode = () => {
    setMode((prev) => (prev === 'animate' ? 'excalidraw' : 'animate'));
  };

  return (
    <div>
      <button className="app-button app-button-compact" onClick={toggleMode}>
        {mode === 'animate' ? 'Edit' : 'Animate'}
      </button>
      {mode === 'animate' ? (
        <AnimateApp
          initialData={loadFromStorage()}
          animationData={animationData}
        />
      ) : (
        <ExcalidrawApp
          initialData={loadFromStorage()}
          onChangeData={(data) => saveToStorage(data, animationData)}
          onAnimationDataChange={setAnimationData}
        />
      )}
    </div>
  );
};

export default App;
