import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '@/shared/api/client.js';
import { selectAccessToken } from '@/features/authSlice.js';

export const fetchMeasures = createAsyncThunk(
    'measure/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            return await api.get('/measures');
        } catch (e) {
            return rejectWithValue(e.message);
        }
    }
);

export const fetchMeasureById = createAsyncThunk(
    'measure/fetchById',
    async (id, { rejectWithValue }) => {
        try {
            return await api.get(`/measures/${id}`);
        } catch (e) {
            return rejectWithValue(e.message);
        }
    }
);

export const addMeasure = createAsyncThunk(
    'measure/add',
    async (dto, { getState, dispatch, rejectWithValue }) => {
        try {
            const token = selectAccessToken(getState());
            await api.post('/measures', dto, token);
            await dispatch(fetchMeasures());
            return dto;
        } catch (e) {
            return rejectWithValue(e.message);
        }
    }
);

export const updateMeasure = createAsyncThunk(
    'measure/update',
    async (dto, { getState, rejectWithValue }) => {
        try {
            const token = selectAccessToken(getState());
            await api.put('/measures', dto, token);
            return dto;
        } catch (e) {
            return rejectWithValue(e.message);
        }
    }
);

export const deleteMeasure = createAsyncThunk(
    'measure/delete',
    async (id, { getState, rejectWithValue }) => {
        try {
            const token = selectAccessToken(getState());
            await api.delete(`/measures/${id}`, token);
            return id;
        } catch (e) {
            return rejectWithValue(e.message);
        }
    }
);

const measureSlice = createSlice({
    name: 'measure',
    initialState: { items: [], loading: false, error: null },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchMeasures.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchMeasures.fulfilled, (state, { payload }) => { state.loading = false; state.items = payload; })
            .addCase(fetchMeasures.rejected, (state, { payload, error }) => { state.loading = false; state.error = payload ?? error.message; })

            .addCase(fetchMeasureById.fulfilled, (state, { payload }) => {
                const idx = state.items.findIndex((m) => m.id === payload.id);
                if (idx !== -1) state.items[idx] = payload;
                else state.items.push(payload);
            })
            .addCase(fetchMeasureById.rejected, (state, { payload, error }) => { state.error = payload ?? error.message; })

            .addCase(updateMeasure.fulfilled, (state, { payload }) => {
                const idx = state.items.findIndex((m) => m.id === payload.id);
                if (idx !== -1) state.items[idx] = { ...state.items[idx], ...payload };
            })
            .addCase(updateMeasure.rejected, (state, { payload, error }) => { state.error = payload ?? error.message; })

            .addCase(deleteMeasure.fulfilled, (state, { payload: id }) => { state.items = state.items.filter((m) => m.id !== id); })
            .addCase(deleteMeasure.rejected, (state, { payload, error }) => { state.error = payload ?? error.message; });
    },
});

export default measureSlice.reducer;

export const selectMeasures = (state) => state.measure.items;
export const selectMeasuresLoading = (state) => state.measure.loading;
export const selectMeasureById = (id) => (state) => state.measure.items.find((m) => m.id === id) ?? null;