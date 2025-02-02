import React, { ReactNode, useContext, useCallback, useState } from 'react';
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

  // Prevent function recreation on every render
  const onLoad = useCallback(() => {
    setCount((prev) => prev + 1);
  }, []);

  const offLoad = useCallback(() => {
    setCount((prev) => Math.max(0, prev - 1)); // Ensures count never goes below zero
  }, []);

  const value: LoaderContextType = { count, onLoad, offLoad };

  // Lottie options for the loading animation
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: Animations.loading,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
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
