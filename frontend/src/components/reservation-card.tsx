import Container from "react-bootstrap/Container";
import {Alert, Button, Card, Col, ListGroup, Row} from "react-bootstrap";
import '../css/reservation-card.css'
import {useNavigate} from "react-router-dom";
import {apiGetReservationByID, apiUpdateReservation, getCurrentReservation} from "../services/reservation.service";
import {StatusCodes} from "http-status-codes";
import React, {useState} from "react";
import {getCurrentUser} from "../services/auth.service";

function ReservationCard() {
    const navigate = useNavigate()
    const currReservation = getCurrentReservation()
    const currentUser = getCurrentUser()
    const [alertVariant, setAlertVariant] = useState("")
    const [alertMessage, setAlertMessage] = useState("")


    const handlerGoToReservationsCatalog = () => {
        navigate("/profile/reservations")
    }

    const stateProcess: Record<string, string> = {
        ["Issued"]: "Выдана",
        ["Expired"]: "Просрочена",
        ["Extended"]: "Продлена",
        ["Closed"]: "Закрыта",
    }

    currReservation.state = stateProcess[currReservation.state]

    const handlerGetReservation = async () => {
        if (currentUser === null) return;

        const statusObj = await apiGetReservationByID(currentUser.reader_id, currReservation.id);
        const statusCode = statusObj.response_status;

        const statusMapping: Record<number, { variant: string; message: string }> = {
            [StatusCodes.OK]: {variant: "", message: ""},
            [StatusCodes.BAD_REQUEST]: {variant: "danger", message: "Ошибка выполнения запроса"},
            [StatusCodes.FORBIDDEN]: {variant: "danger", message: "Нет прав доступа для выполнения данной операции"},
            [StatusCodes.NOT_FOUND]: {variant: "danger", message: "Бронь не найдена"},
            [StatusCodes.INTERNAL_SERVER_ERROR]: {variant: "danger", message: "Внутренняя ошибка сервера"},
        };

        const {variant, message} = statusMapping[statusCode] || {variant: "danger", message: "Неизвестная ошибка"};

        setAlertVariant(variant);
        setAlertMessage(message);

        currReservation.state = stateProcess[currReservation.state]
    };

    const handlerUpdateReservation = async () => {
        if (currentUser === null || currReservation === null) return;

        const statusCode = await apiUpdateReservation(
            currentUser.reader_id,
            currReservation.id,
            {extention_period_days: 5}
        );

        const statusMapping: Record<number, { variant: string; message: string }> = {
            [StatusCodes.OK]: {variant: "", message: ""},
            [StatusCodes.BAD_REQUEST]: {variant: "danger", message: "Ошибка выполнения запроса"},
            [StatusCodes.FORBIDDEN]: {variant: "danger", message: "Нет прав для выполнения данной операции"},
            [StatusCodes.NOT_FOUND]: {variant: "danger", message: "Что-то не найдено..."},
            [StatusCodes.CONFLICT]: {variant: "danger", message: "Бронь нельзя продлить"},
            [StatusCodes.INTERNAL_SERVER_ERROR]: {variant: "danger", message: "Внутренняя ошибка сервера"},
            [StatusCodes.UNAUTHORIZED]: {
                variant: "danger",
                message: "Для бронирования книги необходимо войти в систему"
            },
        };

        const {variant, message} = statusMapping[statusCode] || {variant: "danger", message: "Неизвестная ошибка"};

        setAlertVariant(variant);
        setAlertMessage(message);

        if (statusCode === StatusCodes.OK) await handlerGetReservation();
    };

    return (
        <Container className="container-fluid position-absolute start-50 top-50 translate-middle">
            <Row className="d-flex flex-column">
                <h1 className="mb-4 text-center">Информация о брони</h1>
                <Col className="d-flex justify-content-center">
                    <Card className="my-reservation-card col-10">
                        <Alert variant={alertVariant} className="mt-3 mx-3 my-alert">{alertMessage}</Alert>
                        <ListGroup variant="flush">
                            <ListGroup.Item
                                className="my-reservation-list-item  mx-3">Название и автор
                                книги: <span>{currReservation.book_title_and_author}</span></ListGroup.Item>
                            <ListGroup.Item className="my-reservation-list-item mx-3">Дата
                                выдачи: <span>{currReservation.issue_date}</span></ListGroup.Item>
                            <ListGroup.Item className="my-reservation-list-item mx-3">Дата
                                возврата: <span>{currReservation.return_date}</span></ListGroup.Item>
                            <ListGroup.Item className="my-reservation-list-item mx-3">Статус
                                действия: <span>{currReservation.state}</span></ListGroup.Item>
                        </ListGroup>
                        <Row className="m-2">
                            <Button variant="primary" className="col-4 m-1 my-lib-card-btn"
                                    onClick={handlerGoToReservationsCatalog}>Назад к списку
                                броней</Button>
                            <Button variant="primary" className="col-4 m-1 my-lib-card-btn"
                                    onClick={handlerUpdateReservation}
                            >Продлить бронь</Button>
                        </Row>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default ReservationCard