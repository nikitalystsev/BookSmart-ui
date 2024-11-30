import UpperMenu from "../components/upper-menu";
import {Alert, Card, Col, Row} from "react-bootstrap";
import Container from "react-bootstrap/Container";
import React, {useEffect, useState} from "react";
import '../css/book.css'
import {IRatingOutputDTO} from "../types/types";
import Matrix from "../components/matrix";
import {apiGetPageReviews} from "../services/review.catalog.service";
import Pagination from "../components/pagination";
import BookCard from "../components/book-card";
import getCurrentBook from "../services/book.service";
import {StatusCodes} from "http-status-codes";

function Book() {
    const [currentReviews, setCurrentReviews] = useState<IRatingOutputDTO[]>([])
    const [currentPage, setCurrentPage] = useState<number>(1)
    const currentBook = getCurrentBook()
    const [alertVariant, setAlertVariant] = useState("")
    const [alertMessage, setAlertMessage] = useState("")

    useEffect(() => {
        getPageReviews(currentPage).then()
    }, [])

    const getPageReviews = async (page_number: number) => {
        if (currentBook === null) return

        const statusObj = await apiGetPageReviews(currentBook.id, page_number) // прячет отзывы в sessionStorage
        const statusCode = statusObj.response_status

        const statusMapping: Record<number, { variant: string; message: string }> = {
            [StatusCodes.OK]: {variant: "", message: ""},
            [StatusCodes.BAD_REQUEST]: {variant: "danger", message: "Ошибка выполнения запроса"},
            [StatusCodes.NOT_FOUND]: {variant: "info", message: "Эту книгу еще никто не оценил. Будьте первыми"},
            [StatusCodes.INTERNAL_SERVER_ERROR]: {variant: "danger", message: "Внутренняя ошибка сервера"},
        };

        const {variant, message} = statusMapping[statusCode] || {variant: "danger", message: "Неизвестная ошибка"};

        setAlertVariant(variant);
        setAlertMessage(message);

        if (statusCode === StatusCodes.OK) setCurrentReviews(statusObj.response_data)
    }

    const handlerNextPageReviews = async () => {
        const result = await getPageReviews(currentPage + 1);
        if (result !== null) setCurrentPage(currentPage + 1);
    };

    const handlerPrevPageReviews = async () => {
        if (currentPage > 1) {
            await getPageReviews(currentPage - 1);
            setCurrentPage(currentPage - 1);
        }
    };

    return (
        <div className="my-book-info-page-div d-flex flex-column justify-content-center">
            <UpperMenu/>

            <BookCard book={currentBook}/>

            <Container fluid className="d-flex flex-column align-items-center">
                <h1 className="mt-5 text-center"> Отзывы</h1>
                <Row className="col-8"><Col>
                    <hr/>
                    <Alert variant={alertVariant} className="my-alert">{alertMessage}</Alert>
                </Col></Row>
                <Matrix
                    items={currentReviews}
                    renderItem={
                        (review: IRatingOutputDTO) =>
                            <Card className="my-review-card my-2 col-12">
                                <Card.Header className="my-review-card-header">{review.reader_fio}</Card.Header>
                                <Card.Body>
                                    <Card.Title className="my-review-card-title">Рейтинг: <span>{review.rating}/5</span></Card.Title>
                                    <Card.Text className="my-review-card-text">{review.review}</Card.Text>
                                </Card.Body>
                            </Card>
                    }
                    countColumns={1}
                    rowAlign="col-8"
                    colAlign=""
                />
            </Container>

            <Pagination
                onClickNextPage={handlerNextPageReviews}
                onClickPrevPage={handlerPrevPageReviews}
                currPage={currentPage}
            />
        </div>
    )
}

export default Book