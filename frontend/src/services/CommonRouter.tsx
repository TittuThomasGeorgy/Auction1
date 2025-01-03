import HomePage from "../pages/HomePage";
import { createBrowserRouter,  RouteObject, RouterProvider } from 'react-router-dom';
import TeamPage from "../pages/TeamPage";
import AuctionPage from "../pages/AuctionPage";
import PlayerPage from "../pages/PlayerPage";
import TeamView from "../pages/TeamView";

export const allModuleRoutes = [
  {
    title: 'Home',
    path: '/',
    element: <HomePage />,
  },
  {
    title: 'Team',
    path: '/team',
    element: <TeamPage />,
  },
  {
    title: 'Team',
    path: '/team/:id',
    element: <TeamView />,
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
