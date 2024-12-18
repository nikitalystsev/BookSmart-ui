import Container from "react-bootstrap/Container";
import {Button, Card, Col, ListGroup, Row} from "react-bootstrap";
import '../css/reservation-card.css'
import {useNavigate} from "react-router-dom";
import {apiGetReservationByID, apiUpdateReservation, getCurrentReservation} from "../services/reservation.service";
import {StatusCodes} from "http-status-codes";
import React, {useEffect, useState} from "react";
import {getCurrentUser} from "../services/auth.service";
import MyAlert from "./alert";
import {IReservationOutputDTO} from "../types/types";

function ReservationCard() {
    const navigate = useNavigate()
    const [alertVariant, setAlertVariant] = useState("")
    const [alertMessage, setAlertMessage] = useState("")

    const [currentReservation, setCurrentReservation] = useState<IReservationOutputDTO | null>(null)
    const currReservation = getCurrentReservation()
    const currentUser = getCurrentUser()

    useEffect(() => {
        console.log("call reservation card use effect")
        handlerGetReservation().then()
    }, []);

    const handlerGoToReservationsCatalog = () => {
        navigate("/profile/reservations")
    }

    const stateProcess: Record<string, string> = {
        ["Issued"]: "Выдана",
        ["Expired"]: "Просрочена",
        ["Extended"]: "Продлена",
        ["Closed"]: "Закрыта",
    }

    const handlerGetReservation = async () => {
        if (currentUser === null || !currReservation) return;

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

        if (statusCode == StatusCodes.OK) setCurrentReservation(statusObj.response_data)
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
                    <Card className="my-reservation-card-card col-10">
                        <MyAlert message={alertMessage} variant={alertVariant} align={"mt-3 mx-3 my-alert"}></MyAlert>
                        <ListGroup variant="flush">
                            <ListGroup.Item
                                className="my-reservation-list-item  mt-2 mx-3">Название и автор
                                книги: <span>{currentReservation?.book_title_and_author}</span></ListGroup.Item>
                            <ListGroup.Item className="my-reservation-list-item mx-3">Дата
                                выдачи: <span>{currentReservation?.issue_date}</span></ListGroup.Item>
                            <ListGroup.Item className="my-reservation-list-item mx-3">Дата
                                возврата: <span>{currentReservation?.return_date}</span></ListGroup.Item>
                            <ListGroup.Item className="my-reservation-list-item mx-3">Статус
                                действия: <span>{currentReservation?.state ? stateProcess[currentReservation?.state] : currentReservation?.state}</span></ListGroup.Item>
                        </ListGroup>
                        <Row className="m-2">
                            <Button variant="primary" className="col-4 m-1 ms-4 my-lib-card-btn"
                                    onClick={handlerGoToReservationsCatalog}>Назад к списку
                                броней</Button>
                            {currentReservation?.state === "Issued" ? (
                                <Button variant="primary" className="col-4 m-1 my-lib-card-btn"
                                        onClick={handlerUpdateReservation}
                                >Продлить бронь</Button>

                            ) : null}
                        </Row>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default ReservationCard