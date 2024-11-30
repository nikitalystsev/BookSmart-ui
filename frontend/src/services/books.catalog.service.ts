import axios from "axios";
import {IJSONBookModel} from "../types/types";
import {unexpectedError} from "./auth.service";
import {axiosClient} from "./axiosClient";

const bookKey: string = "books_page_";

export const apiGetPageBooks = async (
    title: string,
    author: string,
    publisher: string,
    copies_number: string,
    rarity: string,
    genre: string,
    publishing_year: string,
    language: string,
    age_limit: string,
    page_number: number
) => {
    try {
        const response = await axiosClient.get<IJSONBookModel[]>(
            "/books", {
                params: {
                    title,
                    author,
                    publisher,
                    copies_number,
                    rarity,
                    genre,
                    publishing_year,
                    language,
                    age_limit,
                    page_number
                },
            }
        );

        if (response.data.length != 0) {
            sessionStorage.setItem(bookKey + String(page_number), JSON.stringify(response.data));
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

export default function getBooksByPageNum(page_number: number) {
    const booksStr = sessionStorage.getItem(bookKey + String(page_number));
    if (booksStr) return JSON.parse(booksStr);

    return null;
};