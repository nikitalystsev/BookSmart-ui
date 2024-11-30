import axios, {AxiosResponse} from "axios";
import {axiosClient} from "./axiosClient";
import authHeader from "./authHeader";
import {unexpectedError} from "./auth.service";
import {IRatingInputDTO} from "../types/types";

export async function apiAddNewRating(bookID: string | undefined, ratingInputDTO: IRatingInputDTO) {
    console.log("call apiAddNewRating")
    try {
        const response: AxiosResponse = await axiosClient.post(
            "/books/" + bookID + "/ratings",
            ratingInputDTO,
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