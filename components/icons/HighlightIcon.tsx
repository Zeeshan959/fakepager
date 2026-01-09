import React from 'react';

export const HighlightIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <path d="m14.7 11.7-1.4-1.4" />
    <path d="M13 13 5 21" />
    <path d="M22 10 12 22" />
    <path d="M7 13.3 2.7 9 15 2.7Z" />
  </svg>
);
