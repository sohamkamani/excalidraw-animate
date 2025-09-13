import { useEffect, useRef, useState } from 'react';
import { Excalidraw, Footer, Sidebar } from '@excalidraw/excalidraw';
import type {
  AppState,
  BinaryFiles,
  ExcalidrawImperativeAPI,
} from '@excalidraw/excalidraw/types';
import type { ExcalidrawElement } from '@excalidraw/excalidraw/element/types';

// eslint-disable-next-line import/no-unresolved
import '@excalidraw/excalidraw/index.css';

import { AnimateConfig } from './AnimateConfig';
import type { Drawing, AnimationData } from './AnimateConfig';

const ExcalidrawApp = ({
  initialData,
  onChangeData,
  onAnimationDataChange,
}: {
  initialData:
  | { elements: ExcalidrawElement[]; appState: AppState; files: BinaryFiles }
  | undefined;
  onChangeData: (data: {
    elements: readonly ExcalidrawElement[];
    appState: AppState;
    files: BinaryFiles;
  }) => void;
  onAnimationDataChange: (data: AnimationData) => void;
}) => {
  const [drawing, setDrawing] = useState<Drawing | undefined>(initialData);
  const [animationData, setAnimationData] = useState<AnimationData>({});
  const [excalidrawAPI, setExcalidrawAPI] =
    useState<ExcalidrawImperativeAPI | null>(null);
  const initialized = useRef(false);
  useEffect(() => {
    if (initialized.current || !drawing) {
      return;
    }
    initialized.current = true;
    const newAnimationData: AnimationData = {};
    drawing.elements.forEach((ele) => {
      newAnimationData[ele.id] = {
        ...newAnimationData[ele.id],
        animateOrder: newAnimationData[ele.id]?.animateOrder ?? 0,
      };
    });
    setAnimationData((prev) => ({
      ...newAnimationData,
      ...prev,
    }));
  }, [drawing]);
  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      <Excalidraw
        excalidrawAPI={(api) => setExcalidrawAPI(api)}
        initialData={initialData}
        onChange={(elements, appState, files) => {
          setDrawing((prev) => {
            if (
              prev &&
              prev.elements === elements &&
              prev.appState === appState &&
              prev.files === files
            ) {
              return prev;
            }
            return { elements, appState, files };
          });
          onChangeData({ elements, appState, files });
        }}
      >
        <Sidebar name="custom" docked={true}>
          <Sidebar.Header />
          <div style={{ padding: '1rem' }}>
            {drawing && excalidrawAPI ? (
              <AnimateConfig
                drawing={drawing}
                api={excalidrawAPI}
                animationData={animationData}
                onAnimationDataChange={(data) => {
                  setAnimationData(data);
                  onAnimationDataChange(data);
                }}
              />
            ) : (
              <p>Loading...</p>
            )}
          </div>
        </Sidebar>
        <Footer>
          <Sidebar.Trigger
            name="custom"
            style={{
              marginLeft: '0.5rem',
            }}
          >
            Toggle Animate Panel
          </Sidebar.Trigger>
        </Footer>
      </Excalidraw>
    </div>
  );
};

export default ExcalidrawApp;
