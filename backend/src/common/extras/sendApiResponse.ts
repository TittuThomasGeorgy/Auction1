import { Response } from 'express';
import { HTTP_STATUS_CODE_TYPE } from './CommonTypes';

interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data?: T;
}

/**
 * A reusable function to send a standard API response from the backend.
 * @param res - The Express response object.
 * @param statusCode - The HTTP status code to send.
 * @param data - The data to include in the response.
 * @param message - Optional message to include in the response.
 */
const sendApiResponse = <T>(
    res: Response,
    statusCode: HTTP_STATUS_CODE_TYPE,
    data?: T,
    message?: string
): void => {
    const response: ApiResponse<T> = {
        success: HTTP[statusCode] >= 200 && HTTP[statusCode] < 300,
        message,
        data,   
    };

    res.status(HTTP[statusCode]).json(response);
};
const HTTP = {
    'OK': 200,
    'CREATED': 201,
    'PROCESSING': 202,
    'BAD REQUEST': 400,
    'UNAUTHORIZED': 401,
    'FORBIDDEN': 403,
    'NOT FOUND': 404,
    'CONFLICT': 409,
    'UNSUPPORTED MEDIA TYPE': 415,
    'INTERNAL SERVER ERROR': 500,
    'NOT IMPLEMENTED': 501,
    'SERVICE UNAVAILABLE': 503,
  };
  
export default sendApiResponse;
