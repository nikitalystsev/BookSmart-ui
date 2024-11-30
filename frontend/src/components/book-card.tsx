import {Alert, Button, Card, Col, ListGroup, Row} from "react-bootstrap";
import Container from "react-bootstrap/Container";
import React, {FC, useState} from "react";
import {IBookOutputDTO} from "../types/types";
import {getCurrentUser} from "../services/auth.service";
import '../css/book-card.css'
import {useNavigate} from "react-router-dom";
import {apiReserveBook} from "../services/reservation.service";
import {StatusCodes} from "http-status-codes";

interface BookCardProps {
    book: IBookOutputDTO | null;
}

const BookCard: FC<BookCardProps> = ({book}) => {
    const navigate = useNavigate()
    const currentUser = getCurrentUser()
    const [alertVariant, setAlertVariant] = useState("")
    const [alertMessage, setAlertMessage] = useState("")

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
    }

    const handlerGoToReviewPage = () => {
        navigate("/books/book/review")
    }

    return (
        <Container fluid className="d-flex flex-column align-items-center">
            <Row className="col-8">
                <Col>
                    <h1 className="mt-5 mb-3 text-center">Информация о книге</h1>
                    <Card className="my-book-info-card col-12">
                        <Card.Body>
                            <Card.Title className="mt-3 my-book-info-title">{book?.title}
                            </Card.Title>
                            <Card.Subtitle className="mt-3 my-book-info-subtitle">{book?.author}</Card.Subtitle>
                        </Card.Body>
                        <Alert variant={alertVariant} className="mx-3 my-alert">{alertMessage}</Alert>
                        <ListGroup variant="flush">
                            <ListGroup.Item
                                className="mx-3 my-book-info-list-item">Издатель: <span>{book?.publisher}</span></ListGroup.Item>
                            <ListGroup.Item className="mx-3 my-book-info-list-item">Количество
                                копий: <span>{book?.copies_number}</span></ListGroup.Item>
                            <ListGroup.Item
                                className="mx-3 my-book-info-list-item">Редкость: <span>{book?.rarity}</span></ListGroup.Item>
                            <ListGroup.Item
                                className="mx-3 my-book-info-list-item">Жанр: <span>{book?.genre}</span></ListGroup.Item>
                            <ListGroup.Item className="mx-3 my-book-info-list-item">Год
                                издания: <span>{book?.publishing_year}</span></ListGroup.Item>
                            <ListGroup.Item
                                className="mx-3 my-book-info-list-item">Язык: <span>{book?.language}</span></ListGroup.Item>
                            <ListGroup.Item className="mx-3 my-book-info-list-item">Возрастное
                                ограничение: <span>{book?.age_limit}</span></ListGroup.Item>
                            <ListGroup.Item className="mx-3 my-book-info-list-item">Средний
                                рейтинг: <span>{book?.avg_rating === -1 ? "Книга не оценена" : book?.avg_rating}</span></ListGroup.Item>
                        </ListGroup>
                        <Row className="m-2">
                            <Button
                                variant="primary"
                                className="col-2 m-1 my-book-info-btn"
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