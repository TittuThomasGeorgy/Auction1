import { ReactNode, createContext, useContext, useEffect, useMemo, useState } from 'react';
import { IClub } from '../types/ClubType';

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = (props: { children: ReactNode }) => {
    const [club, setClub] = useState<IClub | null | false>(null);
    const value = useMemo<AuthContextType>(() => ({ club, setClub }), [club]);
    return <AuthContext.Provider value={value}>{props.children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within a AuthProvider');
    }
    return context;
};

interface AuthContextType {
    club: IClub | null | false;
    setClub: React.Dispatch<React.SetStateAction<IClub | null | false>>;
}
