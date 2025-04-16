import React, { memo } from 'react';
import { List, AutoSizer, WindowScroller, ListRowProps } from 'react-virtualized';

interface VirtualListProps<T> {
  items: T[];
  rowHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  overscanRowCount?: number;
}

function VirtualList<T>({
  items,
  rowHeight,
  renderItem,
  className = '',
  overscanRowCount = 10
}: VirtualListProps<T>) {
  const rowRenderer = ({ index, key, style }: ListRowProps) => {
    const item = items[index];
    return (
      <div key={key} style={style} role="listitem">
        {renderItem(item, index)}
      </div>
    );
  };

  return (
    <WindowScroller>
      {({ height, isScrolling, onChildScroll, scrollTop }) => (
        <AutoSizer disableHeight>
          {({ width }) => (
            <List
              autoHeight
              height={height}
              width={width}
              isScrolling={isScrolling}
              onScroll={onChildScroll}
              scrollTop={scrollTop}
              rowCount={items.length}
              rowHeight={rowHeight}
              rowRenderer={rowRenderer}
              overscanRowCount={overscanRowCount}
              className={className}
              role="list"
            />
          )}
        </AutoSizer>
      )}
    </WindowScroller>
  );
}

export default memo(VirtualList) as typeof VirtualList;