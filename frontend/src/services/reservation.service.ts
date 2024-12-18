import axios, {AxiosResponse} from "axios";
import {axiosClient} from "./axiosClient";
import authHeader from "./authHeader";
import addAuthHeader from "./authHeader";
import {unexpectedError} from "./auth.service";
import {IReservationExtentionPeriodDaysInputDTO, IReservationOutputDTO} from "../types/types";

const reservationKey: string = "curr_reservation";

export async function apiReserveBook(readerID: string | undefined, reservationInputDTO: {
    book_id: string | undefined
}) {
    console.log("call apiReserveBook")
    try {
        const response: AxiosResponse = await axiosClient.post(
            "/readers/" + readerID + "/reservations",
            reservationInputDTO,
            {headers: authHeader()}
        )

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
}

export async function apiGetReservationByID(readerID: string | undefined, reservationID: string) {
    console.log("call apiGetReservationByID")
    try {
        const response: AxiosResponse = await axiosClient.get<IReservationOutputDTO>(
            "/readers/" + readerID + "/reservations/" + reservationID,
            {headers: authHeader()}
        )

        if (response.data) {
            sessionStorage.setItem(reservationKey, JSON.stringify(response.data))
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

export async function apiUpdateReservation(
    readerID: string | undefined,
    reservationID: string,
    extentionPeriodDays: IReservationExtentionPeriodDaysInputDTO
) {
    console.log("call apiUpdateReservation")
    try {
        const response: AxiosResponse = await axiosClient.patch(
            "/readers/" + readerID + "/reservations/" + reservationID,
            extentionPeriodDays,
            {headers: addAuthHeader()}
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


export function getCurrentReservation(): IReservationOutputDTO | null {
    const reservationStr = sessionStorage.getItem(reservationKey)
    if (reservationStr) return JSON.parse(reservationStr)

    return null
}