import Container from "react-bootstrap/Container";
import {Alert, Button, Card, Col, ListGroup, Row} from "react-bootstrap";
import '../css/lib-card.css'
import {useNavigate} from "react-router-dom";
import {getCurrentUser} from "../services/auth.service";
import {
    apiCreateLibCard,
    apiGetLibCardByReaderID,
    apiUpdateLibCard,
    getCurrentLibCard
} from "../services/libCard.service";
import {StatusCodes} from "http-status-codes";
import React, {useEffect, useState} from "react";
import {IJSONLibCardModel} from "../types/types";
import MyAlert from "./alert";

function CardLibCard() {
    const navigate = useNavigate()
    const [alertVariant, setAlertVariant] = useState("")
    const [alertMessage, setAlertMessage] = useState("")
    const [currentLibCard, setCurrentLibCard] = useState<IJSONLibCardModel | null>(null)

    const currentUser = getCurrentUser()

    useEffect(() => {
        console.log("call card lib card use effect")
        handlerGetLibCard().then()
    }, []);

    const handlerGoToProfilePage = () => {
        navigate("/profile")
    }

    const handlerGetLibCard = async () => {
        console.log("call handlerGetLibCard")

        if (currentUser === null) return

        const statusObj = await apiGetLibCardByReaderID(currentUser.reader_id)

        const statusCode = statusObj.response_status;

        const statusMapping: Record<number, { variant: string; message: string }> = {
            [StatusCodes.OK]: {variant: "", message: ""},
            [StatusCodes.BAD_REQUEST]: {variant: "danger", message: "Ошибка выполнения запроса"},
            [StatusCodes.FORBIDDEN]: {variant: "danger", message: "Нет прав доступа для выполнения данной операции"},
            [StatusCodes.NOT_FOUND]: {variant: "warning", message: "У вас нет читательского билета. Создайте его"},
            [StatusCodes.INTERNAL_SERVER_ERROR]: {variant: "danger", message: "Внутренняя ошибка сервера"},
            [StatusCodes.UNAUTHORIZED]: {
                variant: "danger",
                message: "Для просмотра читательского билета пользователя необходимо войти в систему"
            },
        };

        const {variant, message} = statusMapping[statusCode] || {variant: "danger", message: "Неизвестная ошибка"};

        setAlertVariant(variant);
        setAlertMessage(message);

        if (statusCode === StatusCodes.OK) {
            setCurrentLibCard(statusObj.response_data[0])
            console.log("data", statusObj.response_data[0])
        }
    }

    const handlerCreateLibCard = async () => {
        if (!currentUser) return

        const statusCode = await apiCreateLibCard(currentUser.reader_id)

        const statusMapping: Record<number, { variant: string; message: string }> = {
            [StatusCodes.CREATED]: {variant: "", message: ""},
            [StatusCodes.BAD_REQUEST]: {variant: "danger", message: "Ошибка выполнения запроса"},
            [StatusCodes.FORBIDDEN]: {variant: "danger", message: "Нет прав доступа для выполнения данной операции"},
            [StatusCodes.CONFLICT]: {variant: "danger", message: "У вас есть читательский билет"},
            [StatusCodes.INTERNAL_SERVER_ERROR]: {variant: "danger", message: "Внутренняя ошибка сервера"},
            [StatusCodes.UNAUTHORIZED]: {
                variant: "danger",
                message: "Для создания читательского билета пользователя необходимо войти в систему"
            },
        };

        const {variant, message} = statusMapping[statusCode] || {variant: "danger", message: "Неизвестная ошибка"};

        setAlertVariant(variant);
        setAlertMessage(message);

        if (statusCode === StatusCodes.CREATED) await handlerGetLibCard();
    }

    const handlerUpdateLibCard = async () => {
        if (currentUser === null || currentUser === undefined) return

        const statusCode = await apiUpdateLibCard(currentUser.reader_id);

        const statusMapping: Record<number, { variant: string; message: string }> = {
            [StatusCodes.OK]: {variant: "", message: ""},
            [StatusCodes.BAD_REQUEST]: {variant: "danger", message: "Ошибка выполнения запроса"},
            [StatusCodes.FORBIDDEN]: {variant: "danger", message: "Нет прав доступа для выполнения данной операции"},
            [StatusCodes.NOT_FOUND]: {variant: "danger", message: "У вас нет читательского билета"},
            [StatusCodes.CONFLICT]: {variant: "danger", message: "У вас есть действующий читательский билет"},
            [StatusCodes.INTERNAL_SERVER_ERROR]: {variant: "danger", message: "Внутренняя ошибка сервера"},
            [StatusCodes.UNAUTHORIZED]: {
                variant: "danger",
                message: "Для продления читательского билета пользователя необходимо войти в систему"
            },
        };

        const {variant, message} = statusMapping[statusCode] || {variant: "danger", message: "Неизвестная ошибка"};

        setAlertVariant(variant);
        setAlertMessage(message);

        if (statusCode === StatusCodes.OK) await handlerGetLibCard();
    };


    return (
        <Container className="container-fluid position-absolute start-50 top-50 translate-middle">
            <Row className="d-flex flex-column">
                <h1 className="mb-4 text-center">Информация о читательском билете</h1>
                <Col className="d-flex justify-content-center">
                    <Card className="my-lib-card-card col-10">
                        <MyAlert message={alertMessage} variant={alertVariant} align={" mt-3 mx-3 my-alert"}></MyAlert>
                        <ListGroup variant="flush">
                            <ListGroup.Item className="my-lib-card-list-item mt-2 mx-3">
                                Номер: <span>{currentLibCard?.lib_card_num}</span>
                            </ListGroup.Item>
                            <ListGroup.Item className="my-lib-card-list-item mx-3">Срок
                                действия: <span>{currentLibCard?.validity}</span></ListGroup.Item>
                            <ListGroup.Item className="my-lib-card-list-item mx-3">Дата
                                выдачи: <span>{currentLibCard?.issue_date}</span></ListGroup.Item>
                            <ListGroup.Item className="my-lib-card-list-item mx-3">Статус
                                действия: <span>{currentLibCard ? (currentLibCard.action_status ? "Действующий" : " Недействующий") : ""}</span></ListGroup.Item>
                        </ListGroup>
                        <Row className="m-2">
                            <Button variant="primary" className="col-4 m-1 ms-4 my-lib-card-btn"
                                    onClick={handlerGoToProfilePage}>Назад к профилю</Button>

                            <>
                                {currentLibCard ? (
                                    <></>
                                ) : (
                                    <Button variant="primary" className="col-4 m-1 my-lib-card-btn"
                                            onClick={handlerCreateLibCard}
                                    >
                                        Создать читательский билет
                                    </Button>
                                )}

                                {currentLibCard?.action_status === false ? (
                                    <Button variant="primary" className="col-4 m-1 my-lib-card-btn"
                                            onClick={handlerUpdateLibCard}
                                    >
                                        Продлить читательский билет
                                    </Button>
                                ) : (<></>
                                )}
                            </>
                        </Row>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default CardLibCard