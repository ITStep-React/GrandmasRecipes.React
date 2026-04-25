import { Routes, Route } from 'react-router';

import HomePage from '@/pages/HomePage/HomePage.jsx';
import RecipePage from '@/pages/RecipePage/RecipePage.jsx';
import AccountPage from '@/pages/AccountPage/AccountPage.jsx';
import RecipeEditor from '@/pages/RecipeEditor/RecipeEditor.jsx';
import SearchPage from '@/pages/SearchPage/SearchPage.jsx';
import LikedPage from '@/pages/LikedPage/LikedPage.jsx';

function AppRouter() {
    return (
        <Routes>
            <Route path='/' element={<HomePage />} />
            <Route path='/recipe/:id' element={<RecipePage />} />
            <Route path='/account' element={<AccountPage />} />
            <Route path='/account/:id' element={<AccountPage />} />
            <Route path='/editor' element={<RecipeEditor />} />
            <Route path='/editor/:id' element={<RecipeEditor />} />
            <Route path='/search' element={<SearchPage />} />
            <Route path='/liked' element={<LikedPage />} />
        </Routes>
    );
}

export default AppRouter;
