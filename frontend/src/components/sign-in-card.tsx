import React, {useState} from 'react';
import {Button, Container, Form, Row} from 'react-bootstrap';
import '../css/sign-in-card.css'
import {apiSignIn} from "../services/auth.service";
import {useNavigate} from "react-router-dom";
import {StatusCodes} from "http-status-codes";
import {useSession} from "./session-context";
import MyAlert from "./alert";

function SignInCard() {
    const {login} = useSession();
    const navigate = useNavigate();
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [alertVariant, setAlertVariant] = useState("")
    const [alertMessage, setAlertMessage] = useState("")

    const handlerSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const statusObj = await apiSignIn(phoneNumber, password);
        const statusCode = statusObj.response_status;

        const statusMapping: Record<number, { variant: string; message: string }> = {
            [StatusCodes.OK]: { variant: "success", message: "Вход прошел успешно" },
            [StatusCodes.BAD_REQUEST]: { variant: "danger", message: "Ошибка выполнения запроса" },
            [StatusCodes.NOT_FOUND]: { variant: "danger", message: "Пользователя с такими данными не существует" },
            [StatusCodes.CONFLICT]: { variant: "danger", message: "Неверный логин или пароль" },
            [StatusCodes.INTERNAL_SERVER_ERROR]: { variant: "danger", message: "Внутренняя ошибка сервера" },
        };

        const { variant, message } = statusMapping[statusCode] || { variant: "danger", message: "Неизвестная ошибка" };

        setAlertVariant(variant);
        setAlertMessage(message);

        if (statusCode === StatusCodes.OK) {
            login(statusObj.response_data.access_token, statusObj.response_data.refresh_token, statusObj.response_data.expired_at);
            navigate("/")
        }
    };


    const handlerGoToSignUpPage = () => {
        navigate("/auth/sign-up")
    }

    return (
        <Container
            className="my-sign-in-container container-fluid col-4 position-absolute start-50 top-50 translate-middle">
            <Row className="justify-content-center">
                <h2 className="text-center">Вход в систему</h2>
                <Form onSubmit={handlerSignIn} className="my-sign-in-form">
                    <MyAlert message={alertMessage} variant={alertVariant} align={"mx-2 my-alert"}></MyAlert>
                    <Form.Group className="mb-5 mx-2" controlId="phoneNumber">
                        <Form.Label>Номер телефона</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Введите номер телефона"
                            className="my-sign-in-form-control"
                            onChange={(e) => setPhoneNumber(e.target.value)} // Обновляем состояние
                        />
                    </Form.Group>

                    <Form.Group className="mb-5 mx-2" controlId="phoneNumber">
                        <Form.Label>Пароль</Form.Label>
                        <Form.Control
                            type="password"
                            placeholder="Введите пароль"
                            className="my-sign-in-form-control"
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </Form.Group>

                    <Row className="mx-2 my-3">
                        <Button type="submit" className="my-sign-in-btn" >
                            Войти
                        </Button>
                    </Row>

                    <Row className="justify-content-center align-items-center mb-5">
                        <div className="col-auto my-not-akk">Нет аккаунта?</div>
                        <Button variant="link"
                                className="col-auto my-sign-in-cr-akk-btn"
                                onClick={handlerGoToSignUpPage}
                        >Создайте его за минуту</Button>
                    </Row>
                </Form>
            </Row>
        </Container>
    );
}

export default SignInCard
