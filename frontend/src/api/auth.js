const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
};

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const login = async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    const resData = await response.json();
    if (!response.ok) throw new Error(resData.error || 'Login failed');
    return {
        token: resData.data.accessToken,
        user: resData.data.user,
        refreshToken: resData.data.refreshToken
    };
};

export const register = async (name, email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
    });
    const resData = await response.json();
    if (!response.ok) throw new Error(resData.error || 'Registration failed');
    return {
        token: resData.data.accessToken,
        user: resData.data.user,
        refreshToken: resData.data.refreshToken
    };
};

export const logout = async () => {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: getAuthHeaders()
    });
    return response.json();
};
