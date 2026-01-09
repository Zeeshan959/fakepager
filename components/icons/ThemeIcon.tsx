import React from 'react';

export const ThemeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 2a7 7 0 1 0 10 10" />
    <path d="M12 22a7 7 0 1 0 0-14 7 7 0 0 0 0 14z" />
    <path d="M12 2v20" />
  </svg>
);
