import { createContext, useContext, useState, useEffect } from 'react';
import { setToken, getToken, removeToken, getUserType, getUserInfo } from '../utils/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userType, setUserType] = useState(null);
    const [userInfo, setUserInfo] = useState(null);

    useEffect(() => {
        // Check authentication status on mount
        const token = getToken();
        if (token) {
            setIsAuthenticated(true);
            setUserType(getUserType());
            setUserInfo(getUserInfo());
        }
    }, []);

    const login = (token) => {
        setToken(token);
        setIsAuthenticated(true);
        setUserType(getUserType());
        setUserInfo(getUserInfo());
    };

    const logout = () => {
        removeToken();
        setIsAuthenticated(false);
        setUserType(null);
        setUserInfo(null);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, userType, userInfo, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};