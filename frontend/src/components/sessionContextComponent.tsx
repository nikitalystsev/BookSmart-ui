import React, {createContext, ReactNode, useContext} from 'react';
import {apiRefresh, getCurrentUser, updateCurrentUser, userKey} from "../services/auth.service";
import {useNavigate} from "react-router-dom";
import {StatusCodes} from "http-status-codes";

interface SessionContextType {
    login: (accessToken: string, refreshToken: string, expiresAt: number) => void;
    logout: () => void;
}

interface SessionProviderProps {
    children: ReactNode;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider: React.FC<SessionProviderProps> = ({children}) => {
    const navigate = useNavigate()
    let timeoutLogOutID: string | number | NodeJS.Timeout | undefined, timeoutRefreshID: NodeJS.Timeout
    let accessToken, refreshToken: string
    let expiresAt: number

    const logout = () => {
        sessionStorage.removeItem(userKey);
        navigate('/')
    };

    const refreshAccessToken = async () => {
        if (!refreshToken) return logout();

        const statusObj = await apiRefresh(
            {refresh_token: refreshToken}
        )
        const statusCode = statusObj.response_status

        if (statusCode !== StatusCodes.OK) return logout()


        let user = getCurrentUser()
        if (user === null) return logout()

        user.access_token = statusObj.response_data.access_token
        user.refresh_token = statusObj.response_data.refresh_token
        user.expired_at = statusObj.response_data.expired_at
        updateCurrentUser(user)

        accessToken = statusObj.response_data.access_token;
        refreshToken = statusObj.response_data.refresh_token;
        expiresAt = statusObj.response_data.expired_at
        startSessionTimer();
    };

    const startSessionTimer = () => {
        if (timeoutLogOutID) clearTimeout(timeoutLogOutID);

        const timeToExpiration = expiresAt ? expiresAt - Date.now() : 0;
        timeoutLogOutID = setTimeout(() => {
            logout();
        }, timeToExpiration > 0 ? timeToExpiration : 0)

        if (timeToExpiration > timeToExpiration / 2) {
            timeoutRefreshID = setTimeout(async () => {
                await refreshAccessToken();
            }, timeToExpiration - timeToExpiration / 2);
        }
    };

    const login = (token: string, refresh: string, expiresAtMillis: number) => {
        accessToken = token
        refreshToken = refresh
        expiresAt = expiresAtMillis
        startSessionTimer(); // Запускаем таймер при входе
    };

    return (
        <SessionContext.Provider value={{login, logout}}>
            {children}
        </SessionContext.Provider>
    );
};

export const useSession = () => {
    const context = useContext(SessionContext);
    if (!context) {
        throw new Error("useSession must be used within a SessionProvider");
    }
    return context;
};
