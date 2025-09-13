import React, { type FC } from 'react';
import { useDrag, useDrop } from 'react-dnd';

const ItemTypes = {
  CARD: 'card',
};

export interface Item {
  id: string;
  text: string;
}

interface SortableItemProps {
  id: any;
  text: string;
  index: number;
  moveCard: (dragIndex: number, hoverIndex: number) => void;
  selected?: boolean;
}

const SortableItem: FC<SortableItemProps> = ({
  id,
  text,
  index,
  moveCard,
  selected,
}) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [, drop] = useDrop({
    accept: ItemTypes.CARD,
    hover(item: { index: number }) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) {
        return;
      }
      moveCard(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.CARD,
    item: { id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const opacity = isDragging ? 0 : 1;
  drag(drop(ref));

  return (
    <div
      ref={ref}
      style={{
        border: '1px solid gray',
        padding: '0.5rem 1rem',
        marginBottom: '.5rem',
        cursor: 'move',
        opacity,
        backgroundColor: selected ? 'red' : 'white',
        color: selected ? 'white' : 'black',
      }}
    >
      {text}
    </div>
  );
};

interface SortableListProps {
  items: Item[];
  setItems: (items: Item[]) => void;
  selectedIds: Record<string, boolean>;
};

export const SortableList: FC<SortableListProps> = ({
  items,
  setItems,
  selectedIds,
}) => {
  const moveCard = (dragIndex: number, hoverIndex: number) => {
    const dragItem = items[dragIndex];
    if (dragItem) {
      const newItems = [...items];
      newItems.splice(dragIndex, 1);
      newItems.splice(hoverIndex, 0, dragItem);
      setItems(newItems);
    }
  };

  return (
    <div>
      {items.map((item, i) => (
        <SortableItem
          key={item.id}
          index={i}
          id={item.id}
          text={item.text}
          moveCard={moveCard}
          selected={!!selectedIds[item.id]}
        />
      ))}
    </div>
  );
};