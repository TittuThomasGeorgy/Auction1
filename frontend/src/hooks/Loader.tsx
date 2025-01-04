import React, { ReactNode, useContext, useMemo, useState } from 'react';
import { LoaderContextType } from '../types/CommonTypes';
import { Box } from '@mui/material';
import Animations from '../animations';
import Lottie from 'react-lottie';

const LoaderContext = React.createContext<LoaderContextType | undefined>(undefined);

interface LoaderProviderProps {
  children: ReactNode;
}

export const LoaderProvider = (props: LoaderProviderProps) => {
  const [count, setCount] = useState(0);

  const value = useMemo<LoaderContextType>(
    () => ({
      count,
      onLoad: () => setCount((count) => count + 1),
      offLoad: () => setCount((count) => count - 1),
    }),
    [count]
  );

  // Lottie options for the loading animation
  const defaultOptions = {
    loop: true,
    autoplay: true, // Animation will start automatically
    animationData: Animations.loading, // The Lottie JSON animation
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice', // To ensure the animation is responsive
    },
  };

  return (
    <LoaderContext.Provider value={value}>
      {props.children}
      {count > 0 && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 9999,
          }}
        >
          <Lottie options={defaultOptions} height={200} width={200} />
        </Box>
      )}
    </LoaderContext.Provider>
  );
};

export const useLoader = () => {
  const context = useContext(LoaderContext);
  if (!context) {
    throw new Error('useLoader must be used within a LoaderProvider');
  }
  return context;
};
