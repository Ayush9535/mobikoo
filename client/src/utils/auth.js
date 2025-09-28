// Token management utilities

export const setToken = (token) => {
    sessionStorage.setItem('token', token);
};

export const getToken = () => {
    return sessionStorage.getItem('token');
};

export const removeToken = () => {
    sessionStorage.removeItem('token');
};

export const isAuthenticated = () => {
    const token = getToken();
    return !!token;
};

export const getUserInfo = () => {
    const token = getToken();
    if (!token) return null;
    
    try {
        // JWT tokens are split into three parts by dots
        const payload = token.split('.')[1];
        // Decode the base64 payload
        const decodedPayload = JSON.parse(atob(payload));
        return decodedPayload;
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
};

export const getUserType = () => {
    const userInfo = getUserInfo();
    return userInfo ? userInfo.role : null;
    }