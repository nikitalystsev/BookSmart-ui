import {Alert, Button, Card, Col, ListGroup, Row} from "react-bootstrap";
import Container from "react-bootstrap/Container";
import React, {FC, useEffect, useState} from "react";
import {IBookOutputDTO, IJSONBookModel, IJSONLibCardModel, ISignInOutput} from "../types/types";
import {getCurrentUser} from "../services/auth.service";
import '../css/book-card.css'
import {useNavigate} from "react-router-dom";
import {apiReserveBook} from "../services/reservation.service";
import {StatusCodes} from "http-status-codes";
import MyAlert from "./alert";
import {apiGetBookByID} from "../services/book.service";

interface BookCardProps {
    book: IBookOutputDTO | null;
}

const BookCard: FC<BookCardProps> = ({book}) => {
    const navigate = useNavigate()
    const [alertVariant, setAlertVariant] = useState("")
    const [alertMessage, setAlertMessage] = useState("")
    const [currentBook, setCurrentBook] = useState<IBookOutputDTO | null>(null)

    const currentUser = getCurrentUser()

    useEffect(() => {
        console.log("call book card use effect")
        handlerGetBookInfo().then()
    }, [])

    const handlerGoToBookCatalog = () => {
        navigate("/books")
    }

    const handlerReserveBook = async () => {
        if (currentUser === null || book === null) return

        const statusCode = await apiReserveBook(
            currentUser.reader_id,
            {
                book_id: book.id
            }
        )

        const codes: Record<number, string> = {
            [StatusCodes.CREATED]: "Книга была успешно забронирована",
            [StatusCodes.BAD_REQUEST]: "Ошибка выполнения запроса",
            [StatusCodes.FORBIDDEN]: "Нет прав доступа для выполнения данной операции",
            [StatusCodes.NOT_FOUND]: "Что то не найдено...",
            [StatusCodes.CONFLICT]: "Книгу нельзя забронировать",
            [StatusCodes.INTERNAL_SERVER_ERROR]: "Внутренняя ошибка сервера",
            [StatusCodes.UNAUTHORIZED]: "Для бронирования книги необходимо войти в систему",
        }

        const msg = codes[statusCode]
        if (msg === undefined || msg === null) setAlertMessage("Неизвестная ошибка")
        else setAlertMessage(msg)
        if (statusCode === StatusCodes.CREATED) setAlertVariant("success")
        else setAlertVariant("danger")

        if (statusCode === StatusCodes.CREATED) await handlerGetBookInfo()
    }

    const handlerGetBookInfo = async () => {
        if (!book) return

        const statusObj = await apiGetBookByID(book.id); // прячет книгу в sessionStorage
        const statusCode: number = statusObj.response_status;

        if (statusCode === StatusCodes.OK) setCurrentBook(statusObj.response_data)
    };

    const handlerGoToReviewPage = () => {
        navigate("/books/book/review")
    }

    return (
        <Container fluid className="d-flex flex-column align-items-center">
            <Row className="col-8">
                <Col>
                    <h1 className="mt-5 mb-3 text-center">Информация о книге</h1>
                    <Card className="my-book-info-card col-12">
                        <MyAlert message={alertMessage} variant={alertVariant} align={"mx-3 mt-3 my-alert"}></MyAlert>
                        <Card.Body>
                            <Card.Title className="mx-3 mt-3 my-book-info-title">{currentBook?.title}
                            </Card.Title>
                            <Card.Subtitle
                                className="mt-3 mx-3 my-book-info-subtitle">{currentBook?.author}</Card.Subtitle>
                        </Card.Body>
                        <ListGroup variant="flush">
                            <ListGroup.Item
                                className="mx-3 my-book-info-list-item">Издатель: <span>{currentBook?.publisher}</span></ListGroup.Item>
                            <ListGroup.Item className="mx-3 my-book-info-list-item">Количество
                                копий: <span>{currentBook?.copies_number}</span></ListGroup.Item>
                            <ListGroup.Item
                                className="mx-3 my-book-info-list-item">Редкость: <span>{currentBook?.rarity}</span></ListGroup.Item>
                            <ListGroup.Item
                                className="mx-3 my-book-info-list-item">Жанр: <span>{currentBook?.genre}</span></ListGroup.Item>
                            <ListGroup.Item className="mx-3 my-book-info-list-item">Год
                                издания: <span>{currentBook?.publishing_year}</span></ListGroup.Item>
                            <ListGroup.Item
                                className="mx-3 my-book-info-list-item">Язык: <span>{currentBook?.language}</span></ListGroup.Item>
                            <ListGroup.Item className="mx-3 my-book-info-list-item">Возрастное
                                ограничение: <span>{currentBook?.age_limit}</span></ListGroup.Item>
                            <ListGroup.Item className="mx-3 my-book-info-list-item">Средний
                                рейтинг: <span>{currentBook?.avg_rating === -1 ? "Книга не оценена" : currentBook?.avg_rating}</span></ListGroup.Item>
                        </ListGroup>
                        <Row className="m-2">
                            <Button
                                variant="primary"
                                className="col-2 m-1 ms-4 my-book-info-btn"
                                onClick={handlerGoToBookCatalog}
                            >Назад к каталогу</Button>
                            {currentUser ? (
                                <>
                                    <Button
                                        variant="primary"
                                        className="col-2 m-1 my-book-info-btn"
                                        onClick={handlerReserveBook}
                                    >Забронировать</Button>
                                    <Button
                                        variant="primary"
                                        className="col-2 m-1 my-book-info-btn"
                                        onClick={handlerGoToReviewPage}
                                    >Добавить отзыв</Button>
                                </>
                            ) : null}
                        </Row>
                    </Card>
                </Col>
            </Row>
        </Container>
    )
}

export default BookCard