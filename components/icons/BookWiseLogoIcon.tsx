import React from 'react';

// Updated the logo to a minimalist, abstract book shape based on the user's latest image.
// This design replaces the previous, more detailed icon with a modern, geometric representation.
export const PagerloLogoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <circle cx="20" cy="20" r="20" fill="#4F46E5"/>
    <path d="M10 25 L30 25 L30 15 L20 19 L10 15 Z" fill="white"/>
  </svg>
);