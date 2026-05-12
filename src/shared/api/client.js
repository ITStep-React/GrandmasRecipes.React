const BASE_URL = import.meta.env.VITE_API_URL;

async function request(endpoint, options = {}, token = null) {
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(error.message ?? response.statusText);
    }

    if (response.status === 204) return null;

    const text = await response.text();
    if (!text) return null;
    try {
        return JSON.parse(text);
    } catch {
        return null;
    }
}

export const api = {
    get:    (endpoint, token)         => request(endpoint, { method: 'GET' }, token),
    post:   (endpoint, body, token)   => request(endpoint, { method: 'POST',   body: JSON.stringify(body) }, token),
    put:    (endpoint, body, token)   => request(endpoint, { method: 'PUT',    body: JSON.stringify(body) }, token),
    delete: (endpoint, token)         => request(endpoint, { method: 'DELETE' }, token),
};