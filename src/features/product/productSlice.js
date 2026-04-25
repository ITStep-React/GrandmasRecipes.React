import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

let MOCK_PRODUCTS = [
    { id: 1, name: 'Tomato' }, { id: 2, name: 'Onion' },
    { id: 3, name: 'Garlic' }, { id: 4, name: 'Chicken Breast' },
    { id: 5, name: 'Beef' }, { id: 6, name: 'Pasta' },
    { id: 7, name: 'Rice' }, { id: 8, name: 'Mozzarella' },
    { id: 9, name: 'Milk' }, { id: 10, name: 'Egg' },
    { id: 11, name: 'Wheat Flour' }, { id: 12, name: 'Sugar' },
    { id: 13, name: 'Olive Oil' }, { id: 14, name: 'Butter' },
    { id: 15, name: 'Potato' }, { id: 16, name: 'Carrot' },
    { id: 17, name: 'Broccoli' }, { id: 18, name: 'Spinach' },
    { id: 19, name: 'Lemon' }, { id: 20, name: 'Avocado' },
    { id: 21, name: 'Bell Pepper' }, { id: 22, name: 'Mushroom' },
    { id: 23, name: 'Salmon' }, { id: 24, name: 'Shrimp' },
    { id: 25, name: 'Basil' }, { id: 26, name: 'Oregano' },
    { id: 27, name: 'Black Pepper' }, { id: 28, name: 'Salt' },
    { id: 29, name: 'Pancetta' }, { id: 30, name: 'Pecorino Romano' },
];

const MOCK_UNITS = [
    { name: 'kg' }, { name: 'g' }, { name: 'l' },
    { name: 'ml' }, { name: 'tsp' }, { name: 'tbsp' },
    { name: 'cup' }, { name: 'pcs' }, { name: 'bunch' },
    { name: 'pinch' }, { name: 'slice' }, { name: 'sheet' },
];

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));

export const fetchProducts = createAsyncThunk('product/fetchAll', async () => {
    await delay();
    return [...MOCK_PRODUCTS];
});

export const fetchUnits = createAsyncThunk('product/fetchUnits', async () => {
    await delay(100);
    return [...MOCK_UNITS];
});

export const addProduct = createAsyncThunk(
    'product/add',
    async ({ name }, { getState, rejectWithValue }) => {
        if (getState().auth.user?.status !== 'admin')
            return rejectWithValue('Forbidden: admins only');
        if (MOCK_PRODUCTS.find((p) => p.name.toLowerCase() === name.toLowerCase()))
            return rejectWithValue('Product already exists');
        await delay();
        const item = { id: Date.now(), name };
        MOCK_PRODUCTS.push(item);
        return item;
    }
);

export const updateProduct = createAsyncThunk(
    'product/update',
    async ({ id, name }, { getState, rejectWithValue }) => {
        if (getState().auth.user?.status !== 'admin')
            return rejectWithValue('Forbidden: admins only');
        const idx = MOCK_PRODUCTS.findIndex((p) => p.id === id);
        if (idx === -1) return rejectWithValue('Product not found');
        await delay();
        MOCK_PRODUCTS[idx] = { ...MOCK_PRODUCTS[idx], name };
        return MOCK_PRODUCTS[idx];
    }
);

export const deleteProduct = createAsyncThunk(
    'product/delete',
    async (id, { getState, rejectWithValue }) => {
        if (getState().auth.user?.status !== 'admin')
            return rejectWithValue('Forbidden: admins only');
        const idx = MOCK_PRODUCTS.findIndex((p) => p.id === id);
        if (idx === -1) return rejectWithValue('Product not found');
        await delay();
        MOCK_PRODUCTS.splice(idx, 1);
        return id;
    }
);

const productSlice = createSlice({
    name: 'product',
    initialState: {
        products: [],
        units: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchProducts.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchProducts.fulfilled, (state, { payload }) => { state.loading = false; state.products = payload; })
            .addCase(fetchProducts.rejected, (state, { error }) => { state.loading = false; state.error = error.message; })

            .addCase(fetchUnits.fulfilled, (state, { payload }) => { state.units = payload; })

            .addCase(addProduct.fulfilled, (state, { payload }) => { state.products.push(payload); })
            .addCase(addProduct.rejected, (state, { payload, error }) => { state.error = payload ?? error.message; })

            .addCase(updateProduct.fulfilled, (state, { payload }) => {
                const idx = state.products.findIndex((p) => p.id === payload.id);
                if (idx !== -1) state.products[idx] = payload;
            })
            .addCase(updateProduct.rejected, (state, { payload, error }) => { state.error = payload ?? error.message; })

            .addCase(deleteProduct.fulfilled, (state, { payload: id }) => {
                state.products = state.products.filter((p) => p.id !== id);
            })
            .addCase(deleteProduct.rejected, (state, { payload, error }) => { state.error = payload ?? error.message; });
    },
});

export default productSlice.reducer;

export const selectProducts = (state) => state.product.products;
export const selectUnits = (state) => state.product.units;
export const selectProductsLoading = (state) => state.product.loading;
export const selectProductById = (id) => (state) => state.product.products.find((p) => p.id === id) ?? null;
