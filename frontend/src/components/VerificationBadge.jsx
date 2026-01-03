import React from 'react';

const VerificationBadge = ({ size = 16 }) => {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ verticalAlign: 'middle', marginLeft: '4px' }}
            title="Verified Company"
        >
            <path
                d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
                fill="#3b82f6"
            />
            <circle cx="12" cy="12" r="10" fill="#3b82f6" />
            <path
                d="M9 12l2 2 4-4"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};

export default VerificationBadge;
