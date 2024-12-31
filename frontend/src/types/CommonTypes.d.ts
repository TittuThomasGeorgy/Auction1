import { AxiosResponse } from "axios";

export    interface ModuleRoute {
      base: string;
      pages: {
        title: string;
        path: string;
        element: JSX.Element;
        showInDrawer?: boolean;
        icon?: React.ReactNode;
      }[];
    }
    export interface ServerResponse<T> {
      success?: boolean;
      error?: string;
      message?: string;
      data: T;
    }
     export interface LoaderContextType{
      count: number;
      onLoad: () => void;
      offLoad: () => void;
    }