import HomePage from "../pages/HomePage";
import { createBrowserRouter, RouteObject, RouterProvider } from 'react-router-dom';
import ClubPage from "../pages/ClubPage";
import AuctionPage from "../pages/AuctionPage";
import PlayerPage from "../pages/PlayerPage";
import ClubView from "../pages/ClubView";
import SettingsPage from "../pages/SettingsPage";
import PlayerView from "../pages/PlayerView";
import { useEffect } from "react";
import { useAuth } from "../hooks/Authenticate";
import useClub from "./ClubService";
import { IClub } from "../types/ClubType";
import LoginPage from "../pages/Loginpage";
import LoadingPage from "../pages/LoadingPage";

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
    path: '/players/',
    element: <PlayerPage />,
  },
  {
    title: 'Player',
    path: '/players/view/:id',
    element: <PlayerView />,
  },
  {
    title: 'Settings',
    path: '/settings',
    element: <SettingsPage />,
  },

];
const Router = () => {

  const { club, setClub } = useAuth();
  const clubServ = useClub();

  useEffect(() => {
    const storedClub = localStorage.getItem('curClub');
    const _club: IClub = storedClub ? JSON.parse(storedClub) : null; 

    setClub(false);
    if (_club) {
      clubServ.getMe(_club["_id"])
        .then((res) => {
          setClub(res.data);
        })
      // .catch((error) => {
      //   setClub(false);
      // });
    }
    // else setClub(false);
  }, [])


  const router = createBrowserRouter(
    ([] as RouteObject[]).concat(
      ...allModuleRoutes.map((page) =>
      ({
        path: page.path,
        element: club === null ?
          <LoadingPage /> :
          club == false ?
            <LoginPage /> :
            page.element
        // element: page.element,
        // element: page.element,
      }))));
  return <RouterProvider router={router} />;
};

export default Router;
