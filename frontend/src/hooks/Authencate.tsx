import { ReactNode, createContext, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = (props: { children: ReactNode }) => {
    const [school, setSchool] = useState< null | false>(null);
    const value = useMemo<AuthContextType>(() => ({ school, setSchool }), [school]);
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
    school:  null | false;
    setSchool: React.Dispatch<React.SetStateAction< null | false>>;
}
