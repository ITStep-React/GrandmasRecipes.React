import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '@/shared/api/client.js';

const STORAGE_KEY = 'auth';

function loadFromStorage() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        return JSON.parse(raw);
    } catch { return null; }
}

function saveToStorage(data) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {}
}

function clearStorage() {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch {}
}

const stored = loadFromStorage();

export const register = createAsyncThunk(
    'auth/register',
    async ({ nickname, email, password }, { rejectWithValue }) => {
        try {
            return await api.post('/auth/register', { nickname, email, password });
        } catch (e) {
            return rejectWithValue(e.message);
        }
    }
);

export const login = createAsyncThunk(
    'auth/login',
    async ({ email, password }, { rejectWithValue }) => {
        try {
            return await api.post('/auth/login', { email, password });
        } catch (e) {
            return rejectWithValue(e.message);
        }
    }
);

export const refreshToken = createAsyncThunk(
    'auth/refresh',
    async (_, { getState, rejectWithValue }) => {
        try {
            const token = getState().auth.refreshToken;
            if (!token) return rejectWithValue('No refresh token');
            return await api.post('/auth/refresh', { refreshToken: token });
        } catch (e) {
            return rejectWithValue(e.message);
        }
    }
);

export const logout = createAsyncThunk(
    'auth/logout',
    async (_, { getState, rejectWithValue }) => {
        try {
            const token = getState().auth.refreshToken;
            if (token) await api.post('/auth/logout', { refreshToken: token });
        } catch (e) {
            return rejectWithValue(e.message);
        }
    }
);

export const bootstrapAuth = createAsyncThunk(
    'auth/bootstrap',
    async (_, { dispatch, getState }) => {
        const refresh = getState().auth.refreshToken;
        if (!refresh) return null;
        await dispatch(refreshToken());
        return null;
    }
);

export const updateProfile = createAsyncThunk(
    'auth/updateProfile',
    async (dto, { getState, rejectWithValue }) => {
        try {
            const state = getState();
            const token = state.auth.accessToken ?? null;
            const id = state.auth.user?.id ?? null;
            if (!id) return rejectWithValue('Not authenticated');
            await api.put('/accounts', { id, ...dto }, token);
            return dto;
        } catch (e) {
            return rejectWithValue(e.message);
        }
    }
);

const onAuthPending = (state) => { state.status = 'loading'; state.error = null; };

const onAuthSuccess = (state, { payload }) => {
    state.status = 'authenticated';
    state.accessToken = payload.accessToken;
    state.refreshToken = payload.refreshToken;
    state.user = {
        id: payload.accountId,
        nickname: payload.nickname,
    };
    state.error = null;
    saveToStorage({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
    });
};

const onAuthFailed = (state, action) => {
    state.status = 'unauthenticated';
    state.user = null;
    state.accessToken = null;
    state.refreshToken = null;
    state.error = action.payload ?? action.error.message;
    clearStorage();
};

const onSignOut = (state) => {
    state.status = 'unauthenticated';
    state.user = null;
    state.accessToken = null;
    state.refreshToken = null;
    clearStorage();
};

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: stored?.user ?? null,
        accessToken: stored?.accessToken ?? null,
        refreshToken: stored?.refreshToken ?? null,
        status: stored?.refreshToken ? 'authenticated' : 'idle',
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(register.pending, onAuthPending)
            .addCase(register.fulfilled, onAuthSuccess)
            .addCase(register.rejected, onAuthFailed)

            .addCase(login.pending, onAuthPending)
            .addCase(login.fulfilled, onAuthSuccess)
            .addCase(login.rejected, onAuthFailed)

            .addCase(refreshToken.pending, (state) => { state.error = null; })
            .addCase(refreshToken.fulfilled, onAuthSuccess)
            .addCase(refreshToken.rejected, onSignOut)

            .addCase(logout.fulfilled, onSignOut)
            .addCase(logout.rejected, onSignOut)

            .addCase(updateProfile.fulfilled, (state, { payload }) => {
                if (state.user) {
                    if (payload.nickname) state.user.nickname = payload.nickname;
                    if (payload.imageUrl !== undefined) state.user.imageUrl = payload.imageUrl;
                    saveToStorage({
                        accessToken: state.accessToken,
                        refreshToken: state.refreshToken,
                        user: state.user,
                    });
                }
            });
    },
});

export default authSlice.reducer;

export const selectAuthUser = (state) => state.auth.user;
export const selectAuthStatus = (state) => state.auth.status;
export const selectIsAuthenticated = (state) => state.auth.status === 'authenticated';
export const selectAccessToken = (state) => state.auth.accessToken ?? null;
export const selectRefreshToken = (state) => state.auth.refreshToken ?? null;
export const selectMyId = (state) => state.auth.user?.id ?? null;
export const selectMyNickname = (state) => state.auth.user?.nickname ?? null;
export const selectAuthError = (state) => state.auth.error;