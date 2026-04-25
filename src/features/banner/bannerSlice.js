import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const MOCK_BANNERS = [
    { 
        id: 1, 
        href: '/', 
        imageUrl: 'https://images.unsplash.com/photo-1543353071-873f17a7a088?w=1400&q=80', 
        title: 'Italian Classics', 
        desc: 'Discover the taste of authentic Italian cuisine', 
        cta: 'Explore Recipes' 
    },
    { 
        id: 2, 
        href: '/', 
        imageUrl: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1400&q=80', 
        title: 'Quick & Easy Meals', 
        desc: 'Delicious dishes ready in no time', 
        cta: 'Start Cooking' 
    },
    { 
        id: 3, 
        href: '/', 
        imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1400&q=80', 
        title: 'Healthy Choices', 
        desc: 'Nutritious recipes for a balanced lifestyle', 
        cta: 'Learn More' 
    },
];

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));

export const fetchBanners = createAsyncThunk('banner/fetchAll', async () => {
    await delay();
    return MOCK_BANNERS;
});

const bannerSlice = createSlice({
    name: 'banner',
    initialState: { items: [], loading: false, error: null },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchBanners.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchBanners.fulfilled, (state, { payload }) => { state.loading = false; state.items = payload; })
            .addCase(fetchBanners.rejected, (state, { error }) => { state.loading = false; state.error = error.message; });
    },
});

export default bannerSlice.reducer;

export const selectBanners = (state) => state.banner.items;
export const selectBannersLoading = (state) => state.banner.loading;
