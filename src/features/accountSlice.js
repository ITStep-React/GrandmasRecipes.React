import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '@/shared/api/client.js';
import { selectAccessToken } from '@/features/authSlice.js';

export const fetchAccountById = createAsyncThunk(
    'account/fetchById',
    async (id, { getState, rejectWithValue }) => {
        try {
            const cached = getState().account.byId[id];
            if (cached) return cached;
            return await api.get(`/accounts/${id}`);
        } catch (e) {
            return rejectWithValue(e.message);
        }
    }
);

export const fetchAuthorById = createAsyncThunk(
    'account/fetchAuthorById',
    async (id, { getState, rejectWithValue }) => {
        try {
            const cached = getState().account.byId[id];
            if (cached) return cached;
            return await api.get(`/accounts/${id}`);
        } catch (e) {
            return rejectWithValue(e.message);
        }
    }
);

export const updateAccount = createAsyncThunk(
    'account/update',
    async (dto, { getState, rejectWithValue }) => {
        try {
            const token = selectAccessToken(getState());
            await api.put('/accounts', dto, token);
            return dto;
        } catch (e) {
            return rejectWithValue(e.message);
        }
    }
);

export const deleteAccount = createAsyncThunk(
    'account/delete',
    async (id, { getState, rejectWithValue }) => {
        try {
            const token = selectAccessToken(getState());
            await api.delete(`/accounts/${id}`, token);
            return id;
        } catch (e) {
            return rejectWithValue(e.message);
        }
    }
);

const accountSlice = createSlice({
    name: 'account',
    initialState: {
        byId: {},
        loading: false,
        error: null,
    },
    reducers: {
        clearAccount(state, { payload: id }) {
            delete state.byId[id];
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAccountById.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchAccountById.fulfilled, (state, { payload }) => {
                state.loading = false;
                if (payload) state.byId[payload.id] = payload;
            })
            .addCase(fetchAccountById.rejected, (state, { payload, error }) => { state.loading = false; state.error = payload ?? error.message; })

            .addCase(fetchAuthorById.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchAuthorById.fulfilled, (state, { payload }) => {
                state.loading = false;
                if (payload) state.byId[payload.id] = payload;
            })
            .addCase(fetchAuthorById.rejected, (state, { payload, error }) => { state.loading = false; state.error = payload ?? error.message; })

            .addCase(updateAccount.fulfilled, (state, { payload }) => {
                if (state.byId[payload.id]) state.byId[payload.id] = { ...state.byId[payload.id], ...payload };
            })
            .addCase(updateAccount.rejected, (state, { payload, error }) => { state.error = payload ?? error.message; })

            .addCase(deleteAccount.fulfilled, (state, { payload: id }) => { delete state.byId[id]; })
            .addCase(deleteAccount.rejected, (state, { payload, error }) => { state.error = payload ?? error.message; });
    },
});

export const { clearAccount } = accountSlice.actions;
export default accountSlice.reducer;

export const selectAccountById = (id) => (state) => state.account.byId[id] ?? null;
export const selectAuthorById = (id) => (state) => state.account.byId[id] ?? null;
export const selectAccountLoading = (state) => state.account.loading;
export const selectAccountError = (state) => state.account.error;