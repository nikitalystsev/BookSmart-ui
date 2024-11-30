import React, {useState} from 'react';
import {Alert, Button, Container, Form, Row} from 'react-bootstrap';
import '../css/review.css'
import {useNavigate} from "react-router-dom";
import {StatusCodes} from "http-status-codes";
import {apiAddNewRating} from "../services/review.service";
import getCurrentBook from "../services/book.service";
import {getCurrentUser} from "../services/auth.service";

const ReviewForm = () => {
    const navigate = useNavigate();
    const [reviewParams, setReviewParams] = useState({
        review: "",
        rating: 0
    });
    const [alertVariant, setAlertVariant] = useState("")
    const [alertMessage, setAlertMessage] = useState("")
    const currentUser = getCurrentUser()
    const currentBook = getCurrentBook()

    const onFieldChange = (event: any) => {
        let value = event.target.value;
        if (event.target.type === "number") {
            setReviewParams({...reviewParams, [event.target.id]: Number(value)});
            return
        }

        setReviewParams({...reviewParams, [event.target.id]: value});
    };

    const handlerReview = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (currentUser === null || currentBook == null) return;

        const statusCode = await apiAddNewRating(
            currentBook.id, {
                reader_id: currentUser.reader_id,
                review: reviewParams.review,
                rating: reviewParams.rating
            }
        );

        const statusMapping: Record<number, { variant: string; message: string }> = {
            [StatusCodes.CREATED]: {variant: "success", message: "Отзыв на книгу был успешно добавлен"},
            [StatusCodes.BAD_REQUEST]: {variant: "danger", message: "Ошибка выполнения запроса"},
            [StatusCodes.FORBIDDEN]: {variant: "danger", message: "Нет прав для выполнения данной операции"},
            [StatusCodes.CONFLICT]: {variant: "danger", message: "Вы уже оценивали эту книгу"},
            [StatusCodes.NOT_FOUND]: {variant: "danger", message: "Вы ни разу не бронировали эту книгу"},
            [StatusCodes.INTERNAL_SERVER_ERROR]: {variant: "danger", message: "Внутренняя ошибка сервера"},
            [StatusCodes.UNAUTHORIZED]: {
                variant: "danger",
                message: "Для добавления отзыва необходимо войти в систему"
            },
        };

        const {variant, message} = statusMapping[statusCode] || {variant: "danger", message: "Неизвестная ошибка"};

        setAlertVariant(variant);
        setAlertMessage(message);
    };


    const handlerGoToBookInfoPage = () => {
        navigate("/books/book")
    }

    return (
        <Container
            className="my-review-container container-fluid col-6 position-absolute start-50 top-50 translate-middle">
            <Row className="justify-content-center">
                <h2 className="text-center">Добавить новый отзыв</h2>
                <Form onSubmit={handlerReview} className="my-review-form">
                    <Alert variant={alertVariant} className="mx-2 my-alert">{alertMessage}</Alert>
                    <Form.Group className="mb-5 mx-2" controlId="phoneNumber">
                        <Form.Label>Отзыв</Form.Label>
                        <Form.Control
                            id="review"
                            type="text"
                            placeholder="Введите ваш отзыв"
                            className="my-review-form-control"
                            onChange={onFieldChange}
                        />
                    </Form.Group>

                    <Form.Group className="mb-5 mx-2" controlId="phoneNumber">
                        <Form.Label>Оценка</Form.Label>
                        <Form.Control
                            id="rating"
                            type="number"
                            placeholder="Введите оценку от 1 до 5"
                            className="my-review-form-control"
                            onChange={onFieldChange}
                        />
                    </Form.Group>

                    <Row className="mx-2 my-3">
                        <Button type="submit" className="my-sign-in-btn">
                            Добавить отзыв
                        </Button>
                    </Row>

                    <Row className="justify-content-center align-items-center mb-5">
                        <Button variant="link" className="col-auto my-go-to-book" onClick={handlerGoToBookInfoPage}>Вернуться
                            к книге</Button>
                    </Row>
                </Form>
            </Row>
        </Container>
    );
}

export default ReviewForm;
