import React from 'react';

interface SkeletonProps {
  className?: string;
  count?: number;
}

export const SkeletonLoader: React.FC<SkeletonProps> = ({
  className = 'h-24 w-full',
  count = 1,
}) => {
  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className={`bg-slate-800/60 rounded-xl shimmer-effect border border-slate-800 ${className}`}
        />
      ))}
    </>
  );
};
