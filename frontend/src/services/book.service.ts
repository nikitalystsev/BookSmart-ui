import {IBookOutputDTO} from "../types/types";
import axios from "axios";
import {unexpectedError} from "./auth.service";
import {axiosClient} from "./axiosClient";

export const bookKey = "curr_book"

export const apiGetBookByID = async (bookID: string) => {

    try {
        const response = await axiosClient.get<IBookOutputDTO>(
            "/books/" + bookID, {}
        );

        if (response.data) {
            sessionStorage.setItem(bookKey, JSON.stringify(response.data));
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

export default function getCurrentBook(): IBookOutputDTO | null {
    const bookStr = sessionStorage.getItem(bookKey);
    if (bookStr) return JSON.parse(bookStr);

    return null;
};