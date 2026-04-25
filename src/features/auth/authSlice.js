import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

let MOCK_USERS = [
    {
        id: 1,
        username: 'chefalex',
        email: 'chefalex@gmail.com',
        password: '123',
        avatarUrl: 'https://i.pravatar.cc/80?img=5',
        likes: 100,
        published: 20,
        status: 'admin',
        accessToken: 'mock-token-1',
    },
    {
        id: 2,
        username: 'marco_cooks',
        email: 'marco@gmail.com',
        password: '123',
        avatarUrl: 'https://i.pravatar.cc/80?img=8',
        likes: 540,
        published: 8,
        status: 'user',
        accessToken: 'mock-token-2',
    },
];

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));
const toPublic = ({ password, ...rest }) => rest;

export const register = createAsyncThunk(
    'auth/register',
    async ({ username, email, password }, { rejectWithValue }) => {
        await delay();
        if (MOCK_USERS.find((u) => u.username === username))
            return rejectWithValue('Username already taken');
        if (MOCK_USERS.find((u) => u.email === email))
            return rejectWithValue('Email already registered');

        const newUser = {
            id: Date.now(),
            username, email, password,
            avatarUrl: null,
            likes: 0,
            published: 0,
            status: 'user',
            accessToken: `mock-token-${Date.now()}`,
        };
        MOCK_USERS.push(newUser);
        return toPublic(newUser);
    }
);

export const login = createAsyncThunk(
    'auth/login',
    async ({ username, password }, { rejectWithValue }) => {
        await delay();
        const user = MOCK_USERS.find(
            (u) => u.username === username && u.password === password
        );
        if (!user) return rejectWithValue('Invalid username or password');
        return toPublic(user);
    }
);

export const logout = createAsyncThunk('auth/logout', async () => {
    await delay(200);
});

export const refreshToken = createAsyncThunk(
    'auth/refresh',
    async (_, { rejectWithValue }) => {
        await delay(300);
        return rejectWithValue('No session');
    }
);


export const updateProfile = createAsyncThunk(
    'auth/updateProfile',
    async ({ username, password, avatarUrl }, { getState, rejectWithValue }) => {
        await delay();
        const myId = getState().auth.user?.id;
        const idx = MOCK_USERS.findIndex((u) => u.id === myId);
        if (idx === -1) return rejectWithValue('Not authenticated');

        if (username && MOCK_USERS.some((u) => u.username === username && u.id !== myId))
            return rejectWithValue('Username already taken');

        MOCK_USERS[idx] = {
            ...MOCK_USERS[idx],
            ...(username && { username }),
            ...(password && { password }),
            ...(avatarUrl !== undefined && { avatarUrl }),
        };
        return toPublic(MOCK_USERS[idx]);
    }
);


export const uploadAvatar = createAsyncThunk(
    'auth/uploadAvatar',
    async (file) => {
        await delay(800);
        // In production: POST /upload/avatar (multipart/form-data) → { url }
        return { url: URL.createObjectURL(file) };
    }
);

const onAuthPending = (state) => { state.status = 'loading'; state.error = null; };
const onAuthSuccess = (state, { payload }) => { state.status = 'authenticated'; state.user = payload; state.error = null; };
const onAuthFailed = (state, action) => { state.status = 'unauthenticated'; state.user = null; state.error = action.payload ?? action.error.message; };

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null,
        status: 'idle',
        uploadingAvatar: false,
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

            .addCase(refreshToken.pending, onAuthPending)
            .addCase(refreshToken.fulfilled, onAuthSuccess)
            .addCase(refreshToken.rejected, (state) => { state.status = 'unauthenticated'; state.user = null; })

            .addCase(logout.fulfilled, (state) => { state.status = 'unauthenticated'; state.user = null; })

            .addCase(updateProfile.fulfilled, (state, { payload }) => { state.user = payload; })
            .addCase(updateProfile.rejected, (state, action) => { state.error = action.payload ?? action.error.message; })

            .addCase(uploadAvatar.pending, (state) => { state.uploadingAvatar = true; })
            .addCase(uploadAvatar.fulfilled, (state) => { state.uploadingAvatar = false; })
            .addCase(uploadAvatar.rejected, (state) => { state.uploadingAvatar = false; });
    },
});

export default authSlice.reducer;

export const selectAuthUser = (state) => state.auth.user;
export const selectAuthStatus = (state) => state.auth.status;
export const selectIsAuthenticated = (state) => state.auth.status === 'authenticated';
export const selectIsAdmin = (state) => state.auth.user?.status === 'admin';
export const selectAccessToken = (state) => state.auth.user?.accessToken ?? null;
export const selectMyId = (state) => state.auth.user?.id ?? null;
export const selectMyUsername = (state) => state.auth.user?.username ?? null;
export const selectUploadingAvatar = (state) => state.auth.uploadingAvatar;
export const selectAuthError = (state) => state.auth.error;
