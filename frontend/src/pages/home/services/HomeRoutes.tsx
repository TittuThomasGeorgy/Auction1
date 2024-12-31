import { ModuleRoute } from '../../../types/CommonTypes';
import HomePage from '../pages';
import HomeIcon from '@mui/icons-material/Home';

const HomePageRoutes: ModuleRoute = {
    base: '',
    pages: [
        {
            title: 'Home',
            path: '/',
            element: <HomePage />,
            showInDrawer: true,
            icon: <HomeIcon />,
        },
        
    ],
};
export default HomePageRoutes;
