import { combineReducers } from '@reduxjs/toolkit';

import authReducer from '@/features/authSlice';
import accountReducer from '@/features/accountSlice';
import recipeReducer from '@/features/recipeSlice';
import commentReducer from '@/features/commentSlice';
import categoryReducer from '@/features/categorySlice';
import cuisineReducer from '@/features/cuisineSlice';
import difficultyReducer from '@/features/difficultySlice';
import productReducer from '@/features/productSlice';
import bannerReducer from '@/features/bannerSlice.js';
import searchReducer from '@/features/searchSlice.js';

const rootReducer = combineReducers({
    auth: authReducer,
    account: accountReducer,
    recipe: recipeReducer,
    comment: commentReducer,
    category: categoryReducer,
    cuisine: cuisineReducer,
    difficulty: difficultyReducer,
    product: productReducer,
    banner: bannerReducer,
    search: searchReducer,
});

export default rootReducer;
