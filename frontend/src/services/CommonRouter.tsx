import HomePage from "../pages/HomePage";
import { createBrowserRouter,  RouteObject, RouterProvider } from 'react-router-dom';
import ClubPage from "../pages/ClubPage";
import AuctionPage from "../pages/AuctionPage";
import PlayerPage from "../pages/PlayerPage";
import ClubView from "../pages/ClubView";
import SettingsPage from "../pages/SettingsPage";
import PlayerView from "../pages/PlayerView";

export const allModuleRoutes = [
  {
    title: 'Home',
    path: '/',
    element: <HomePage />,
  },
  {
    title: 'club',
    path: '/club',
    element: <ClubPage />,
  },
  {
    title: 'club',
    path: '/club/:id',
    element: <ClubView />,
  },
  {
    title: 'Auction',
    path: '/auction',
    element: <AuctionPage />,
  },
  {
    title: 'Player',
    path: '/player',
    element: <PlayerPage />,
  },
  {
    title: 'Player',
    path: '/player/:id',
    element: <PlayerView />,
  },
  {
    title: 'Settings',
    path: '/settings',
    element: <SettingsPage />,
  },

];
const Router = () => {


  const router = createBrowserRouter(
    ([] as RouteObject[]).concat(
      ...allModuleRoutes.map((page) =>
      ({
        path: page.path,
        element:
          page.element
        // element: page.element,
      }))));
  return <RouterProvider router={router} />;
};

export default Router;
