import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '@/shared/api/client.js';
import { selectAccessToken } from '@/features/authSlice.js';

export const fetchProducts = createAsyncThunk(
    'product/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            return await api.get('/products');
        } catch (e) {
            return rejectWithValue(e.message);
        }
    }
);

export const fetchUnits = createAsyncThunk(
    'product/fetchUnits',
    async (_, { rejectWithValue }) => {
        try {
            return await api.get('/measures');
        } catch (e) {
            return rejectWithValue(e.message);
        }
    }
);

export const addProduct = createAsyncThunk(
    'product/add',
    async ({ name, imageUrl = null }, { getState, dispatch, rejectWithValue }) => {
        try {
            const token = selectAccessToken(getState());
            await api.post('/products', { name, imageUrl }, token);
            await dispatch(fetchProducts());
            return { name, imageUrl };
        } catch (e) {
            return rejectWithValue(e.message);
        }
    }
);

export const deleteProduct = createAsyncThunk(
    'product/delete',
    async (id, { getState, rejectWithValue }) => {
        try {
            const token = selectAccessToken(getState());
            await api.delete(`/products/${id}`, token);
            return id;
        } catch (e) {
            return rejectWithValue(e.message);
        }
    }
);

const productSlice = createSlice({
    name: 'product',
    initialState: { products: [], units: [], loading: false, loadingUnits: false, error: null },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchProducts.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchProducts.fulfilled, (state, { payload }) => { state.loading = false; state.products = payload; })
            .addCase(fetchProducts.rejected, (state, { payload, error }) => { state.loading = false; state.error = payload ?? error.message; })

            .addCase(fetchUnits.pending, (state) => { state.loadingUnits = true; })
            .addCase(fetchUnits.fulfilled, (state, { payload }) => { state.loadingUnits = false; state.units = payload; })
            .addCase(fetchUnits.rejected, (state) => { state.loadingUnits = false; })

            .addCase(addProduct.rejected, (state, { payload, error }) => { state.error = payload ?? error.message; })

            .addCase(deleteProduct.fulfilled, (state, { payload: id }) => { state.products = state.products.filter((p) => p.id !== id); })
            .addCase(deleteProduct.rejected, (state, { payload, error }) => { state.error = payload ?? error.message; });
    },
});

export default productSlice.reducer;

export const selectProducts = (state) => state.product.products;
export const selectUnits = (state) => state.product.units;
export const selectProductsLoading = (state) => state.product.loading;
export const selectUnitsLoading = (state) => state.product.loadingUnits;
export const selectProductById = (id) => (state) => state.product.products.find((p) => p.id === id) ?? null;