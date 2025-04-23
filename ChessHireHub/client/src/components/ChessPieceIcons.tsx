import React from 'react';

export const ChessPiece: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="w-10 h-10 flex items-center justify-center text-amber-900">
      {children}
    </div>
  );
};

export const Pawn: React.FC = () => {
  return (
    <ChessPiece>
      <svg viewBox="0 0 45 45" width="100%" height="100%">
        <path
          d="M22 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38-1.95 1.12-3.28 3.21-3.28 5.62 0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z"
          fill="#fff"
          stroke="#000"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </ChessPiece>
  );
};

export const Rook: React.FC = () => {
  return (
    <ChessPiece>
      <svg viewBox="0 0 45 45" width="100%" height="100%">
        <g
          fill="#fff"
          fillRule="evenodd"
          stroke="#000"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path
            d="M9 39h27v-3H9v3zM12 36v-4h21v4H12zM11 14V9h4v2h5V9h5v2h5V9h4v5"
            strokeLinecap="butt"
          />
          <path d="M34 14l-3 3H14l-3-3" />
          <path
            d="M31 17v12.5H14V17"
            strokeLinecap="butt"
            strokeLinejoin="miter"
          />
          <path d="M31 29.5l1.5 2.5h-20l1.5-2.5" />
          <path
            d="M11 14h23"
            fill="none"
            strokeLinecap="butt"
            strokeLinejoin="miter"
          />
        </g>
      </svg>
    </ChessPiece>
  );
};

export const Knight: React.FC = () => {
  return (
    <ChessPiece>
      <svg viewBox="0 0 45 45" width="100%" height="100%">
        <g
          fill="none"
          fillRule="evenodd"
          stroke="#000"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path
            d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21"
            fill="#fff"
          />
          <path
            d="M24 18c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.042-.94 1.41-3.04 0-3-1 0 .19 1.23-1 2-1 0-4.003 1-4-4 0-2 6-12 6-12s1.89-1.9 2-3.5c-.73-.994-.5-2-.5-3 1-1 3 2.5 3 2.5h2s.78-1.992 2.5-3c1 0 1 3 1 3"
            fill="#fff"
          />
          <path
            d="M9.5 25.5a.5.5 0 1 1-1 0 .5.5 0 1 1 1 0z"
            fill="#000"
            stroke="#000"
          />
          <path
            d="M14.933 15.75a.5 1.5 30 1 1-.866-.5.5 1.5 30 1 1 .866.5z"
            fill="#000"
            stroke="#000"
          />
        </g>
      </svg>
    </ChessPiece>
  );
};

export const Bishop: React.FC = () => {
  return (
    <ChessPiece>
      <svg viewBox="0 0 45 45" width="100%" height="100%">
        <g
          fill="none"
          fillRule="evenodd"
          stroke="#000"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <g fill="#fff" strokeLinecap="butt">
            <path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.354.49-2.323.47-3-.5 1.354-1.94 3-2 3-2z" />
            <path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z" />
            <path d="M25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0z" />
          </g>
          <path
            d="M17.5 26h10M15 30h15m-7.5-14.5v5M20 18h5"
            strokeLinejoin="miter"
          />
        </g>
      </svg>
    </ChessPiece>
  );
};

export const Queen: React.FC = () => {
  return (
    <ChessPiece>
      <svg viewBox="0 0 45 45" width="100%" height="100%">
        <g
          fill="#fff"
          fillRule="evenodd"
          stroke="#000"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path
            d="M8 12a2 2 0 1 1 4 0 2 2 0 1 1-4 0zm16.5-4.5a2 2 0 1 1 4 0 2 2 0 1 1-4 0zM41 12a2 2 0 1 1 4 0 2 2 0 1 1-4 0zM39 32h-2v-2h2v2zm-24-2h-2v2h2v-2zm24-18h-2v2h2v-2zm-24 2h-2v-2h2v2zm8 16h-2v2h2v-2zm0-16h-2v2h2v-2zm8 0h-2v2h2v-2zm8 16h-2v2h2v-2zm-8 0h-2v2h2v-2z"
            opacity=".6"
          />
          <path
            d="M9 26c8.5-1.5 21-1.5 27 0l2.5-12.5L31 25l-.3-14.1-5.2 13.6-3-14.5-3 14.5-5.2-13.6L14 25 6.5 13.5 9 26z"
            strokeLinecap="butt"
          />
          <path
            d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 1.5-1 0-2.5 0 0 .5-1.5-1-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z"
            strokeLinecap="butt"
          />
          <path
            d="M11 38.5a35 35 1 0 0 23 0"
            fill="none"
            strokeLinecap="butt"
          />
          <path
            d="M11 29a35 35 1 0 1 23 0m-21.5 2.5h20m-21 3a35 35 1 0 0 22 0m-23 3a35 35 1 0 0 24 0"
            fill="none"
            stroke="#000"
          />
        </g>
      </svg>
    </ChessPiece>
  );
};

export const King: React.FC = () => {
  return (
    <ChessPiece>
      <svg viewBox="0 0 45 45" width="100%" height="100%">
        <g
          fill="none"
          fillRule="evenodd"
          stroke="#000"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path
            d="M22.5 11.63V6M20 8h5"
            strokeLinejoin="miter"
          />
          <path
            d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5"
            fill="#fff"
            strokeLinecap="butt"
            strokeLinejoin="miter"
          />
          <path
            d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V27v-3.5c-3.5-7.5-13-10.5-16-4-3 6 5 10 5 10V37z"
            fill="#fff"
          />
          <path
            d="M11.5 30c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0"
          />
        </g>
      </svg>
    </ChessPiece>
  );
};