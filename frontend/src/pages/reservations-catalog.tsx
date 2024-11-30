import UpperMenu from "../components/upper-menu";
import {Alert, Button, Card, Container} from "react-bootstrap";
import React, {useEffect, useState} from "react";
import {apiGetPageReservations} from "../services/reservation.catalog.service";
import {IReservationOutputDTO} from "../types/types";
import {useNavigate} from "react-router-dom";
import Pagination from "../components/pagination";
import Matrix from "../components/matrix";
import '../css/reservations-catalog.css'
import {StatusCodes} from "http-status-codes";
import {apiGetReservationByID} from "../services/reservation.service";
import {getCurrentUser} from "../services/auth.service";

function ReservationsCatalog() {
    const navigate = useNavigate();
    const currentUser = getCurrentUser()
    const [currPage, setCurrPage] = useState(1)
    const [reservations, setReservations] = useState<IReservationOutputDTO[]>([])
    const [alertVariant, setAlertVariant] = useState("")
    const [alertMessage, setAlertMessage] = useState("")

    useEffect(() => {
        getPageReservations(currPage).then()
    }, []);

    const getPageReservations = async (page_number: number) => {
        if (currentUser === null) return;

        const statusObj = await apiGetPageReservations(currentUser.reader_id, page_number);
        const statusCode = statusObj.response_status;

        const statusMapping: Record<number, { variant: string; message: string }> = {
            [StatusCodes.OK]: {variant: "", message: ""},
            [StatusCodes.BAD_REQUEST]: {variant: "danger", message: "Ошибка выполнения запроса"},
            [StatusCodes.FORBIDDEN]: {variant: "danger", message: "Нет прав доступа для выполнения данной операции"},
            [StatusCodes.NOT_FOUND]: {variant: "info", message: "Вы еще ничего не бронировали"},
            [StatusCodes.INTERNAL_SERVER_ERROR]: {variant: "danger", message: "Внутренняя ошибка сервера"},
            [StatusCodes.UNAUTHORIZED]: {
                variant: "danger",
                message: "Для просмотра каталога броней необходимо войти в систему"
            },
        };

        const {variant, message} = statusMapping[statusCode] || {variant: "danger", message: "Неизвестная ошибка"};

        setAlertVariant(variant);
        setAlertMessage(message);

        const stateFromRusToEngl: Record<string, string> = {
            ["Issued"]: "Выдана",
            ["Expired"]: "Просрочена",
            ["Extended"]: "Продлена",
            ["Closed"]: "Закрыта",
        }


        if (statusCode === StatusCodes.OK) {
            const updatedReservations = statusObj.response_data.map((reservation: IReservationOutputDTO) => {
                return {
                    ...reservation,
                    state: stateFromRusToEngl[reservation.state] || reservation.state,
                };
            });

            setReservations(updatedReservations);
        }
    };

    const handlerNextPageReservations = async () => {
        const result = await getPageReservations(currPage + 1);
        if (result !== null) {
            setCurrPage(currPage + 1);
        }
    };

    const handlerPrevPageReservations = async () => {
        if (currPage > 1) {
            await getPageReservations(currPage - 1);
            setCurrPage(currPage - 1);
        }
    };

    const handlerGetReservationInfo = async (reservation: IReservationOutputDTO) => {
        if (currentUser === null) return;

        const statusObj = await apiGetReservationByID(currentUser.reader_id, reservation.id);
        const statusCode = statusObj.response_status;

        const statusMapping: Record<number, { variant: string; message: string }> = {
            [StatusCodes.OK]: {variant: "", message: ""},
            [StatusCodes.BAD_REQUEST]: {variant: "danger", message: "Ошибка выполнения запроса"},
            [StatusCodes.FORBIDDEN]: {variant: "danger", message: "Нет прав доступа для выполнения данной операции"},
            [StatusCodes.NOT_FOUND]: {variant: "danger", message: "Бронь не найдена"},
            [StatusCodes.INTERNAL_SERVER_ERROR]: {variant: "danger", message: "Внутренняя ошибка сервера"},
            [StatusCodes.UNAUTHORIZED]: {
                variant: "danger",
                message: "Для просмотра списка броней необходимо войти в систему"
            },
        };

        const {variant, message} = statusMapping[statusCode] || {variant: "danger", message: "Неизвестная ошибка"};

        setAlertVariant(variant);
        setAlertMessage(message);

        if (statusCode === StatusCodes.OK) navigate("/profile/reservations/reservation");
    };


    const handlerGoToProfilePage = () => {
        navigate("/profile")
    }

    return (
        <div className="d-flex min-vh-100 flex-column justify-content-between">
            <UpperMenu/>

            <Container fluid>
                <h1 className="mt-4">Список броней</h1>
                <Button className="my-catalog-btn" onClick={handlerGoToProfilePage}>Назад к профилю</Button>
                <hr/>
                <Alert variant={alertVariant} className="my-alert">{alertMessage}</Alert>
                <Matrix
                    items={reservations}
                    renderItem={
                        (reservation: IReservationOutputDTO) =>
                            <Card className="my-reservation-card h-100">
                                <Card.Header
                                    className="my-reservation-card-header">{reservation.book_title_and_author}</Card.Header>
                                <Card.Body className="d-flex flex-column justify-content-between">
                                    <Card.Title className="my-reservation-card-title">{reservation.state}</Card.Title>
                                    <Button
                                        variant="primary"
                                        className="my-catalog-btn col-2"
                                        onClick={() => handlerGetReservationInfo(reservation)}
                                    >Подробнее</Button>
                                </Card.Body>
                            </Card>
                    }
                    countColumns={2}
                    rowAlign="my-3 h-100"
                    colAlign="col-6"
                />
            </Container>

            <Pagination
                onClickNextPage={handlerNextPageReservations}
                onClickPrevPage={handlerPrevPageReservations}
                currPage={currPage}
            />
        </div>
    )
}

export default ReservationsCatalog