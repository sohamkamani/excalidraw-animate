import type { ChangeEvent } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import type {
  AppState,
  BinaryFiles,
  ExcalidrawImperativeAPI,
} from '@excalidraw/excalidraw/types';
import type { ExcalidrawElement } from '@excalidraw/excalidraw/element/types';
import { SortableList } from './SortableList';

export type AnimationData = {
  [id: string]: {
    animateOrder?: number;
    animateDuration?: number;
  };
};
export type Drawing = {
  elements: readonly ExcalidrawElement[];
  appState: AppState;
  files: BinaryFiles | null;
};

const loadAnimateOptions = (): {
  pointerImg: string | undefined;
  pointerWidth: string | undefined;
  pointerHeight: string | undefined;
} => {
  const hash = window.location.hash.slice(1);
  const searchParams = new URLSearchParams(hash);
  return {
    pointerImg: searchParams.get('pointerImg') || undefined,
    pointerWidth: searchParams.get('pointerWidth') || undefined,
    pointerHeight: searchParams.get('pointerHeight') || undefined,
  };
};

const saveAnimateOption = (
  name: 'pointerImg' | 'pointerWidth' | 'pointerHeight',
  value: string,
) => {
  const hash = window.location.hash.slice(1);
  const searchParams = new URLSearchParams(hash);
  searchParams.set(name, value);
  window.location.hash = searchParams.toString();
};

export const updateAnimationData = (
  base: AnimationData,
  ids: string[],
  key: 'animateOrder' | 'animateDuration',
  value: number,
): AnimationData => {
  const newAnimationData: AnimationData = { ...base };
  ids.forEach((id) => {
    newAnimationData[id] = {
      ...newAnimationData[id],
      [key]: value,
    };
  });
  return newAnimationData;
};

export const AnimateConfig = ({
  drawing,
  animationData,
  onAnimationDataChange,
  api,
}: {
  drawing: Drawing;
  animationData: AnimationData;
  onAnimationDataChange: (data: AnimationData) => void;
  api: ExcalidrawImperativeAPI;
}) => {
  const defaultAnimateOptions = loadAnimateOptions();
  const selectedIds = Object.keys(
    drawing.appState.selectedElementIds ?? {},
  ).filter(
    (id) =>
      drawing.appState.selectedElementIds[id] &&
      drawing.elements.some((element) => element.id === id),
  );

  const onSortEnd = (sortedIds: string[]) => {
    const newAnimationData = { ...animationData };
    sortedIds.forEach((id, index) => {
      newAnimationData[id] = {
        ...newAnimationData[id],
        animateOrder: index,
      };
    });
    onAnimationDataChange(newAnimationData);
  };

  const animateDurationSet = new Set<number | undefined>();
  selectedIds.forEach((id) => {
    animateDurationSet.add(animationData[id]?.animateDuration);
  });
  const onChangeAnimateDuration = (e: ChangeEvent<HTMLInputElement>) => {
    const value = Math.floor(Number(e.target.value));
    if (Number.isFinite(value)) {
      onAnimationDataChange(
        updateAnimationData(
          animationData,
          selectedIds,
          'animateDuration',
          value,
        ),
      );
    }
  };
  const animateDurationDisabled = !animateDurationSet.size;

  const onChangeAnimatePointerText = (e: ChangeEvent<HTMLInputElement>) => {
    saveAnimateOption('pointerImg', e.target.value);
  };

  const onChangeAnimatePointerFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        saveAnimateOption('pointerImg', reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const onChangeAnimatePointerWidth = (e: ChangeEvent<HTMLInputElement>) => {
    saveAnimateOption('pointerWidth', e.target.value);
  };

  const nonDeletedElements = drawing.elements
    .filter((e) => !e.isDeleted)
  const elementMap: Record<string, ExcalidrawElement> = {};
  nonDeletedElements.forEach((elem) => {
    elementMap[elem.id] = elem;
  });
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        fontSize: 14,
      }}
    >
      {/* Animation Section */}
      <div style={{ fontWeight: 'bold', marginBottom: 4 }}>Animation</div>

      <div>
        Order:{' '}
        <div style={{ maxHeight: 600, overflowY: 'auto' }}>
          <DndProvider backend={HTML5Backend}>
            <SortableList
              selectedIds={Object.fromEntries(
                selectedIds.map((id) => [id, true]),
              )}
              items={nonDeletedElements
                .filter(
                  (e) =>
                    e.type !== 'selection' &&
                    !e.containerId &&
                    animationData[e.id]?.animateOrder !== undefined,
                )
                .sort(
                  (a, b) =>
                    (animationData[a.id]?.animateOrder ?? 0) -
                    (animationData[b.id]?.animateOrder ?? 0),
                )
                .map((element) => {
                  console.log(element)
                  return ({
                    id: element.id,
                    text:
                      `#${animationData[element.id]?.animateOrder} ${element.type
                      } [${element.id.slice(0, 3)}...] [${getElementText(element, elementMap)}]` || '',
                  })
                })}
              setItems={(items) => onSortEnd(items.map((item) => item.id))}
            />
          </DndProvider>
        </div>
      </div>

      <div style={{ opacity: animateDurationDisabled ? 0.3 : 1.0 }}>
        Duration:{' '}
        {animateDurationSet.size > 1 ? (
          <span style={{ opacity: 0.5 }}>(Mixed values – cannot edit)</span>
        ) : (
          <>
            <input
              className="app-input"
              disabled={animateDurationDisabled}
              value={
                (animateDurationSet.size === 1 &&
                  animateDurationSet.values().next().value) ||
                ''
              }
              onChange={onChangeAnimateDuration}
              placeholder="Default"
              style={{ width: 50, minWidth: 50 }}
            />{' '}
            ms
          </>
        )}
      </div>

    </div>
  );
};

function getElementText(
  elem: ExcalidrawElement,
  elementMap: Record<string, ExcalidrawElement>,
) {
  let text = '';
  elem.boundElements?.forEach((e) => {
    if (e.type === 'text') {
      const textElement = elementMap[e.id];
      if (textElement && 'text' in textElement) {
        text = textElement.text;
      }
    }
  });
  return text;
}