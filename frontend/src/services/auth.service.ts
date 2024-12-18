import axios, {AxiosResponse} from "axios";
import {IRefreshTokenInputDTO, IRefreshTokenOutputDTO, ISignInOutput} from "../types/types";
import {axiosClient} from "./axiosClient";
import {libCardKey} from "./libCard.service";

export const userKey: string = "user";
export const unexpectedError: number = -1

export const apiSignUp = async (fio: string, age: number, phone_number: string, password: string) => {
    console.log("call apiSignUp")
    try {
        const response: AxiosResponse = await axiosClient.post(
            "/auth/sign-up",
            {
                fio,
                phone_number,
                age,
                password,
            }
        );

        return response.status
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response === undefined) return unexpectedError;

            return error.response.status;
        } else {
            console.log('unexpected error: ', error);
            return unexpectedError;
        }
    }
};

export const apiSignIn = async (phone_number: string, password: string) => {
    console.log("call apiSignIn")
    try {
        const response = await axiosClient.post<ISignInOutput>(
            "/auth/sign-in",
            {
                phone_number,
                password,
            }
        );

        if (response.data.access_token) {
            sessionStorage.setItem(userKey, JSON.stringify(response.data));
        }

        return {'response_data': response.data, 'response_status': response.status};
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response === undefined) {
                return {'response_data': null, 'response_status': unexpectedError};
            }

            return {'response_data': error.response.data, 'response_status': error.response.status};
        } else {
            console.log('unexpected error: ', error);
            return {'response_data': null, 'response_status': unexpectedError};
        }
    }
};

export const apiRefresh = async (refreshInputDTO: IRefreshTokenInputDTO) => {
    console.log("call apiRefresh")
    try {
        const response: AxiosResponse = await axiosClient.post<IRefreshTokenOutputDTO>(
            "/auth/refresh",
            refreshInputDTO
        );


        return {'response_data': response.data, 'response_status': response.status};
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response === undefined) {
                return {'response_data': null, 'response_status': unexpectedError};
            }

            return {'response_data': error.response.data, 'response_status': error.response.status};
        } else {
            console.log('unexpected error: ', error);
            return {'response_data': null, 'response_status': unexpectedError};
        }
    }
};

export const logOut = () => {
    sessionStorage.removeItem(userKey);
    sessionStorage.removeItem(libCardKey);
};

export const getCurrentUser = (): ISignInOutput | null => {
    const userStr = sessionStorage.getItem(userKey);
    if (userStr) return JSON.parse(userStr);

    return null;
};

export const updateCurrentUser = (user: ISignInOutput) => {
    sessionStorage.setItem(userKey, JSON.stringify(user));
};
