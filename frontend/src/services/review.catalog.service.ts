import axios from "axios";
import {IRatingOutputDTO} from "../types/types";
import {unexpectedError} from "./auth.service";
import {axiosClient} from "./axiosClient";


export const reviewKey = "reviews_page_"

export const apiGetPageReviews = async (bookID: string | undefined, page_number: number
) => {
    try {
        const response = await axiosClient.get<IRatingOutputDTO[]>("/books/" + bookID + "/ratings", {
            params: {
                page_number
            },
        });

        if (response.data.length != 0) {
            sessionStorage.setItem(reviewKey + String(page_number), JSON.stringify(response.data));
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

export default function getReviewsByPageNum(page_number: number) {
    const reviewsStr = sessionStorage.getItem(reviewKey + String(page_number));
    if (reviewsStr) return JSON.parse(reviewsStr);

    return null;
};