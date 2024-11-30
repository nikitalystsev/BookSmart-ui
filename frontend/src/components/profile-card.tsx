import {Alert, Button, Card, ListGroup, Row} from "react-bootstrap";
import '../css/profile.css'
import Container from "react-bootstrap/Container";
import React, {useEffect, useState} from "react";
import {IJSONReaderModel} from "../types/types";
import {getCurrentUser, logOut} from "../services/auth.service";
import {apiGetReaderByID} from "../services/user.service";
import {useNavigate} from "react-router-dom";
import {StatusCodes} from "http-status-codes";
import {apiGetLibCardByReaderID} from "../services/libCard.service";

function ProfileCard() {
    const navigate = useNavigate()
    const currentUser= getCurrentUser()
    const [reader, setReader] = useState<IJSONReaderModel>()
    const [alertVariant, setAlertVariant] = useState("")
    const [alertMessage, setAlertMessage] = useState("")

    useEffect(() => {
        handlerGetReaderByID().then()
    }, [])

    const handlerGetReaderByID = async () => {
        if (currentUser === null) return

        const statusObj = await apiGetReaderByID(currentUser.reader_id);
        const statusCode = statusObj.response_status;

        const statusMapping: Record<number, { variant: string; message: string }> = {
            [StatusCodes.OK]: {variant: "", message: ""},
            [StatusCodes.BAD_REQUEST]: {variant: "danger", message: "Ошибка выполнения запроса"},
            [StatusCodes.FORBIDDEN]: {variant: "danger", message: "Нет прав доступа для выполнения данной операции"},
            [StatusCodes.NOT_FOUND]: {variant: "danger", message: "Пользователь с такими данными не существует"},
            [StatusCodes.INTERNAL_SERVER_ERROR]: {variant: "danger", message: "Внутренняя ошибка сервера"},
            [StatusCodes.UNAUTHORIZED]: {
                variant: "danger",
                message: "Для просмотра профиля пользователя необходимо войти в систему"
            },
        };

        const {variant, message} = statusMapping[statusCode] || {variant: "danger", message: "Неизвестная ошибка"};

        setAlertVariant(variant);
        setAlertMessage(message);

        if (statusCode === StatusCodes.OK) setReader(statusObj.response_data);
    };


    const handlerGoToLibCardPage = async () => {
        console.log("call handlerGoToLibCardPage")
        if (!currentUser) return;

        const statusObj = await apiGetLibCardByReaderID(currentUser.reader_id); // прячет чит. билет в sessionStorage
        const statusCode = statusObj.response_status;

        const statusMapping: Record<number, { variant: string; message: string; navigateTo?: string }> = {
            [StatusCodes.OK]: {variant: "", message: "", navigateTo: "/profile/lib-card"},
            [StatusCodes.BAD_REQUEST]: {variant: "danger", message: "Ошибка выполнения запроса"},
            [StatusCodes.FORBIDDEN]: {variant: "danger", message: "Нет прав доступа для выполнения данной операции"},
            [StatusCodes.NOT_FOUND]: {variant: "", message: "", navigateTo: "/profile/lib-card"},
            [StatusCodes.INTERNAL_SERVER_ERROR]: {variant: "danger", message: "Внутренняя ошибка сервера"},
            [StatusCodes.UNAUTHORIZED]: {
                variant: "danger",
                message: "Для просмотра читательского билета пользователя необходимо войти в систему"
            },
        };

        const {variant, message, navigateTo} = statusMapping[statusCode] || {
            variant: "danger",
            message: "Неизвестная ошибка"
        };

        setAlertVariant(variant);
        setAlertMessage(message);

        if (navigateTo) navigate(navigateTo);
    };

    const handlerGoToLibReservationsCatalogPage = () => {
        navigate("/profile/reservations")
    }

    const handlerGoToBooksCatalogPage = () => {
        navigate("/books")
    }

    const handlerLogOut = () => {
        logOut()
        navigate("/")
    }

    return (
        <Container className="container-fluid position-absolute start-50 top-50 translate-middle">
            <Row className="justify-content-center">
                <h1 className="mb-4 text-center">Профиль пользователя</h1>
                <Card className="my-profile-card col-7">
                    <Card.Body>
                        <Card.Title className="text-center my-profile-card-title">{reader?.fio}
                        </Card.Title>
                    </Card.Body>
                    <Alert variant={alertVariant} className="mx-3 my-alert">{alertMessage}</Alert>
                    <ListGroup variant="flush">
                        <ListGroup.Item className="my-profile-list-item">Номер
                            телефона: <span>{reader?.phone_number}</span></ListGroup.Item>
                        <ListGroup.Item
                            className="my-profile-list-item">Возраст: <span>{reader?.age}</span></ListGroup.Item>
                    </ListGroup>
                    <Row className="m-2">
                        <Button variant="primary" className="my-profile-btn" onClick={handlerGoToLibCardPage}>Перейти
                            к
                            читательскому билету</Button>
                        <Button variant="primary" className="my-profile-btn"
                                onClick={handlerGoToLibReservationsCatalogPage}>Перейти к броням</Button>
                        <Button variant="primary" className="my-profile-btn" onClick={handlerGoToBooksCatalogPage}>Вернуться
                            к каталогу</Button>
                        <Button variant="primary" className="my-profile-btn" onClick={handlerLogOut}>Выйти</Button>
                    </Row>
                </Card>
            </Row>
        </Container>
    );
}

export default ProfileCard