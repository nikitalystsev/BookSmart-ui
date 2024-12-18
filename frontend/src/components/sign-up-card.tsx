import React, {useState} from 'react';
import {Alert, Button, Container, Form, Row} from 'react-bootstrap';
import '../css/sign-up-card.css'
import {apiSignUp} from "../services/auth.service";
import {useNavigate} from "react-router-dom";
import {StatusCodes} from "http-status-codes";
import MyAlert from "./alert";

function SignUpCard() {
    const navigate = useNavigate()
    const [fio, setFio] = useState('');
    const [age, setAge] = useState(0);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [alertVariant, setAlertVariant] = useState("")
    const [alertMessage, setAlertMessage] = useState("")

    const handlerSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const statusCode = await apiSignUp(fio, age, phoneNumber, password);

        const statusMapping: Record<number, { variant: string; message: string }> = {
            [StatusCodes.CREATED]: {variant: "success", message: "Регистрация прошла успешно"},
            [StatusCodes.BAD_REQUEST]: {variant: "danger", message: "Ошибка выполнения запроса"},
            [StatusCodes.CONFLICT]: {variant: "danger", message: "Пользователь с такими данными уже существует"},
            [StatusCodes.INTERNAL_SERVER_ERROR]: {variant: "danger", message: "Внутренняя ошибка сервера"},
        };

        const {variant, message} = statusMapping[statusCode] || {variant: "danger", message: "Неизвестная ошибка"};

        setAlertVariant(variant);
        setAlertMessage(message);

        if (statusCode === StatusCodes.CREATED) navigate("/");
    };


    const handlerGoToSignInPage = () => {
        navigate("/auth/sign-in")
    }

    return (
        <Container
            className="my-sign-up-container container-fluid col-4 position-absolute start-50 top-50 translate-middle">
            <Row>
                <h2 className="text-center">Регистрация</h2>
                <Form onSubmit={handlerSignUp} className="my-sign-up-form">
                    <MyAlert message={alertMessage} variant={alertVariant} align={"mx-2 my-alert"}></MyAlert>
                    <Form.Group className="mb-3 mx-2" controlId="fio">
                        <Form.Label>ФИО</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Введите ваше ФИО"
                            className="my-sign-up-form-control"
                            onChange={(e) => setFio(e.target.value)}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3 mx-2" controlId="age">
                        <Form.Label>Возраст</Form.Label>
                        <Form.Control
                            type="number"
                            placeholder="Введите ваш возраст"
                            className="my-sign-up-form-control"
                            onChange={(e) => setAge(Number(e.target.value))}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3 mx-2" controlId="phoneNumber">
                        <Form.Label>Номер телефона</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Введите номер телефона"
                            className="my-sign-up-form-control"
                            onChange={(e) => setPhoneNumber(e.target.value)}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3 mx-2" controlId="password">
                        <Form.Label>Пароль</Form.Label>
                        <Form.Control
                            type="password"
                            placeholder="Введите пароль"
                            className="my-sign-up-form-control"
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </Form.Group>

                    <Row className="mx-2 my-3">
                        <Button type="submit" className="my-sign-up-btn">
                            Зарегистрироваться
                        </Button>
                    </Row>

                    <Row className="justify-content-center align-items-center mb-5">
                        <div className="col-auto my-alr-reg">Уже зарегистрированы?</div>
                        <Button
                            variant="link"
                            className="col-auto my-sign-up-alr-reg-btn"
                            onClick={handlerGoToSignInPage}
                        >Войдите в систему</Button>
                    </Row>
                </Form>
            </Row>

        </Container>
    );
}

export default SignUpCard
