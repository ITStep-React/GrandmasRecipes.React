import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import AppRouter from '@/routes/router';
import Navbar from '@/widgets/Navbar/Navbar';
import Sidebar from '@/widgets/Sidebar/Sidebar';
import { fetchCategories } from '@/features/categorySlice';
import { fetchCuisines }   from '@/features/cuisineSlice';
import { fetchDifficulties } from '@/features/difficultySlice';
import { fetchProducts }   from '@/features/productSlice';

function App() {
    const dispatch = useDispatch();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        dispatch(fetchCategories());
        dispatch(fetchCuisines());
        dispatch(fetchDifficulties());
        dispatch(fetchProducts());
    }, [dispatch]);

    const toggleSidebar = () => {
        setIsSidebarOpen(prev => !prev);
    };
    
    return <>
        <Navbar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar}/>
        <main>
            <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} />
            <AppRouter />
        </main>
    </>
}

export default App;