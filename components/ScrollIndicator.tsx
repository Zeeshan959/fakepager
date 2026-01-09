import React from 'react';

interface ScrollIndicatorProps {
  itemCount: number;
  currentIndex: number;
}

const ScrollIndicator: React.FC<ScrollIndicatorProps> = ({ itemCount, currentIndex }) => {
  return (
    <div className="flex justify-center items-center space-x-2 mt-4">
      {Array.from({ length: itemCount }).map((_, index) => (
        <div
          key={index}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            index === currentIndex ? 'w-4 bg-brand-primary' : 'w-1.5 bg-gray-300'
          }`}
        />
      ))}
    </div>
  );
};

export default ScrollIndicator;