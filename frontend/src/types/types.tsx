export interface ISignInOutput {
    reader_id: string,
    access_token: string,
    refresh_token: string,
    expired_at: bigint
}

export interface IRefreshTokenOutputDTO {
    access_token: string,
    refresh_token: string,
    expired_at: bigint
}

export interface IRefreshTokenInputDTO {
    refresh_token: string,
}

export interface IJSONBookModel {
    id: string;
    title: string,
    author: string,
    publisher: string,
    copies_number: number,
    rarity: string,
    genre: string,
    publishing_year: number,
    language: string,
    age_limit: number
}

export interface IBookOutputDTO {
    id: string;
    title: string,
    author: string,
    publisher: string,
    copies_number: number,
    rarity: string,
    genre: string,
    publishing_year: number,
    language: string,
    age_limit: number
    avg_rating: number
}

export interface IJSONReaderModel {
    id: string;
    fio: string,
    phone_number: string,
    age: number,
    password: string,
    role: string
}

export interface IRatingOutputDTO {
    reader_fio: string;
    review: string,
    rating: number
}

export interface IReservationInputDTO {
    book_id: string
}

export interface IReservationOutputDTO {
    id: string,
    book_title_and_author: string,
    issue_date: string,
    return_date: string
    state: string
}

export interface IRatingInputDTO {
    reader_id: string;
    review: string,
    rating: number
}

export interface IJSONLibCardModel {
    id: string,
    reader_id: string,
    lib_card_num: string,
    validity: number
    issue_date: string,
    action_status: boolean
}

export interface IReservationExtentionPeriodDaysInputDTO {
    extention_period_days: number
}

export interface IBookParams {
    title: string,
    author: string,
    publisher: string,
    copies_number: number,
    rarity: string,
    genre: string,
    publishing_year: number,
    language: string,
    age_limit: number
}

export interface IErrorResponse {
    errorMessage: string,
    errorCode: number,
}