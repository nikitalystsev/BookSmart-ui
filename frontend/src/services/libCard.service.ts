import {axiosClient} from "./axiosClient";
import addAuthHeader from "./authHeader";
import {IJSONLibCardModel} from "../types/types";
import axios from "axios";
import {unexpectedError} from "./auth.service";

const libCardKey: string = "lib_card";

export async function apiGetLibCardByReaderID(readerID: string) {
    try {
        const response = await axiosClient.get<IJSONLibCardModel[]>(
            "/readers/" + readerID + "/lib_cards", {
                headers: addAuthHeader()
            }
        )

        if (response.data) {
            sessionStorage.setItem(libCardKey, JSON.stringify(response.data))
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
}

export async function apiCreateLibCard(readerID: string) {
    try {
        const response = await axiosClient.post(
            "/readers/" + readerID + "/lib_cards", {}, {
                headers: addAuthHeader()
            }
        )

        return response.status;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response === undefined) return unexpectedError;

            return error.response.status;
        } else {
            console.log('unexpected error: ', error);
            return unexpectedError;
        }
    }
}

export async function apiUpdateLibCard(readerID: string) {
    try {
        const response = await axiosClient.put(
            "/readers/" + readerID + "/lib_cards", {}, {
                headers: addAuthHeader()
            }
        )

        return response.status;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response === undefined) return unexpectedError;

            return error.response.status;
        } else {
            console.log('unexpected error: ', error);
            return unexpectedError;
        }
    }
}

export function getCurrentLibCard() {
    const libCardStr = sessionStorage.getItem(libCardKey)
    if (libCardStr) return JSON.parse(libCardStr)[0]

    return null
}