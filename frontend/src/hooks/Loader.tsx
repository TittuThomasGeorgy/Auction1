import React, { ReactNode, useContext, useMemo, useState } from 'react';
import { LoaderContextType } from '../types/CommonTypes';

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
    [count],
  );

  return <LoaderContext.Provider value={value}>{props.children}</LoaderContext.Provider>;
};

export const useLoader = () => {
  const context = useContext(LoaderContext);
  if (!context) {
    throw new Error('useLoader must be used within a LoaderProvider');
  }
  return context;
};
