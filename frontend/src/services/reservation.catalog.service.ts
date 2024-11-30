import {IReservationOutputDTO} from "../types/types";
import {axiosClient} from "./axiosClient";
import authHeader from "./authHeader";
import axios from "axios";
import {unexpectedError} from "./auth.service";

export const reservationKey = "reservations_page_"
export const apiGetPageReservations = async (readerID: string | undefined, page_number: number
) => {
    console.log("call apiGetPageReservations")
    try {
        const response = await axiosClient.get<IReservationOutputDTO[]>(
            "/readers/" + readerID + "/reservations", {
                headers: authHeader(),
                params: {
                    page_number
                },
            });

        if (response.data.length != 0) {
            sessionStorage.setItem(reservationKey + String(page_number), JSON.stringify(response.data));
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

export default function getReservationsByPageNum(page_number: number) {
    const reviewsStr = sessionStorage.getItem(reservationKey + String(page_number));
    if (reviewsStr) return JSON.parse(reviewsStr);

    return null;
};