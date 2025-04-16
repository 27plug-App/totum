import React from 'react';
import LoadingPlaceholder from './LoadingPlaceholder';

interface LoadingTableProps {
  rows?: number;
  columns?: number;
}

export default function LoadingTable({ rows = 5, columns = 4 }: LoadingTableProps) {
  return (
    <div className="w-full">
      <div className="border border-gray-200 rounded-lg overflow-hidden" aria-busy="true" aria-live="polite">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
          <div className={`grid grid-cols-${columns} gap-4`}>
            {Array.from({ length: columns }).map((_, i) => (
              <LoadingPlaceholder key={i} height="1.5rem" />
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="divide-y divide-gray-200">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={rowIndex} className="px-6 py-4">
              <div className={`grid grid-cols-${columns} gap-4`}>
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <LoadingPlaceholder key={colIndex} height="1rem" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}