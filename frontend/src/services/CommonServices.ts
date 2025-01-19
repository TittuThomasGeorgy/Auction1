import { AxiosResponse } from "axios";
import { LoaderContextType, ServerResponse } from "../types/CommonTypes";
import { EnqueueSnackbar } from "notistack";
let loader: LoaderContextType;
let enqueueSnackbar: EnqueueSnackbar;
export default {
  setLoader: (_loader: LoaderContextType) => (loader = _loader),
  setEnqueueSnackbar: (_enqueueSnackbar: EnqueueSnackbar) => (enqueueSnackbar = _enqueueSnackbar),
};

export const getStandardResponse = <T>(
  axiosCall: Promise<AxiosResponse<any, any>>,
  responseFormatter?: ((res: any) => T) | null
): Promise<ServerResponse<T>> =>
  new Promise((resolve, reject) => {
    loader && loader.onLoad();
    axiosCall
      .then((res) => {
        let result: ServerResponse<T> = res.data;
        const parsedResponse = responseFormatter ? responseFormatter(res.data.data) : null;
        if (parsedResponse) {
          result = { ...result, data: parsedResponse };
        }
        resolve(result);
      })
      .catch((error) => {
        const parsedError = error.response && error.response.data ? error.response.data : { message: error.message };
        loader &&
          enqueueSnackbar({
            variant: "error",
            message: parsedError.message,
          });
        reject(parsedError);
      })
      .finally(() => {
        loader && loader.offLoad();
      });
  });

export const getStandardSocketResponse = <T>(
  socketEvent: (callback: (data: any) => void) => void,
  responseFormatter?: (data: any) => T | null
): Promise<ServerResponse<T>> => {
  return new Promise((resolve, reject) => {
    try {
      socketEvent((data: any) => {
        try {
          let result: ServerResponse<T> = data;
          const parsedResponse = responseFormatter ? responseFormatter(data) : null;
          if (parsedResponse) {
            result = { ...result, data: parsedResponse };
          }
          resolve(result);
        } catch (formatError) {
          reject({
            success: false,
            data: null,
            message: "Error formatting response",
          });
        }
      });
    } catch (socketError) {
      console.log("Error->"+socketError);
      reject(socketError);
    }
  });
};
