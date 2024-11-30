import axios, {AxiosResponse} from "axios";
import authHeader from "./authHeader";
import {IJSONReaderModel} from "../types/types";
import {axiosClient} from "./axiosClient";
import {unexpectedError} from "./auth.service";

export const apiGetReaderByID = async (readerID: string) => {
    try {
        const response: AxiosResponse = await axiosClient.get<IJSONReaderModel>(
            "/readers/" + readerID,
            {headers: authHeader()}
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

