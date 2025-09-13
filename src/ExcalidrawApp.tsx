import { useState } from 'react';
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
import { updateAnimationData } from './AnimateConfig';

const ExcalidrawApp = ({
  initialData,
  onChangeData,
  animationData,
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
  animationData: AnimationData;
  onAnimationDataChange: (data: AnimationData) => void;
}) => {

  const [drawing, setDrawing] = useState<Drawing | undefined>(initialData);
  const [excalidrawAPI, setExcalidrawAPI] =
    useState<ExcalidrawImperativeAPI | null>(null);
  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      <Excalidraw
        excalidrawAPI={(api) => {
          setExcalidrawAPI(api)
        }}
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
          onAnimationDataChange(
            ((prev) => {
              const newAnimationData: AnimationData = { ...prev };
              let changed = false;
              elements.forEach((ele) => {
                if (ele.isDeleted) {
                  if (ele.id in newAnimationData) {
                    delete newAnimationData[ele.id];
                    changed = true;
                  }
                } else if (!(ele.id in newAnimationData)) {
                  newAnimationData[ele.id] = {
                    ...newAnimationData[ele.id],
                    animateOrder: newAnimationData[ele.id]?.animateOrder ?? 0,
                  };
                  changed = true;
                }
              });
              return changed ? newAnimationData : prev;
            })(animationData),
          );
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
                onAnimationDataChange={onAnimationDataChange}
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
