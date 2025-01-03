import { ReactNode, createContext, useContext, useEffect, useMemo, useState } from 'react';
import { ITeam } from '../types/TeamType';

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = (props: { children: ReactNode }) => {
    const [team, setTeam] = useState<ITeam | null | false>(null);
    const value = useMemo<AuthContextType>(() => ({ team, setTeam }), [team]);
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
    team: ITeam | null | false;
    setTeam: React.Dispatch<React.SetStateAction<ITeam | null | false>>;
}
