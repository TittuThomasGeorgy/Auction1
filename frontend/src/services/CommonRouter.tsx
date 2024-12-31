import { createBrowserRouter, Navigate, RouteObject, RouterProvider } from 'react-router-dom';
import React, { useEffect } from 'react';
import HomePageRoutes from '../pages/home/services/HomeRoutes';
import Home from '../pages/Home';
import HomePage from '../pages/home/pages';

export const allModuleRoutes = [
  HomePageRoutes
];
const Router = () => {
  const router = createBrowserRouter(
    ([] as RouteObject[]).concat(
      ...allModuleRoutes.map((moduleRoute) =>
        moduleRoute.pages.map((page) => ({
          path: moduleRoute.base + page.path,
          element: <HomePage/>
          // element: page.element,
        })))));
  return <RouterProvider router={router} />;
};

export default Router;
