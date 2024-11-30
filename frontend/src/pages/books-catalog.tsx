import Container from "react-bootstrap/Container";
import {Alert, Button, Card, Col, Form, Row} from "react-bootstrap";
import Matrix from "../components/matrix";
import {IJSONBookModel} from "../types/types";
import React, {FormEvent, useState} from "react";
import {apiGetPageBooks} from "../services/books.catalog.service";
import '../css/books-catalog.css'
import UpperMenu from "../components/upper-menu";
import BookParam from "../components/book-param";
import {apiGetBookByID} from "../services/book.service";
import {useNavigate} from "react-router-dom";
import Pagination from "../components/pagination";
import {StatusCodes} from "http-status-codes";

const bookParams = [
    {id: 'title', type: 'text', placeholder: 'Название'},
    {id: 'author', type: 'text', placeholder: 'Автор'},
    {id: 'publisher', type: 'text', placeholder: 'Издательство'},
    {id: 'copies_number', type: 'number', placeholder: 'Число экземпляров'},
    {
        id: 'rarity', type: 'select', placeholder: 'Редкость', options: [
            {value: '', label: 'Редкость'},
            {value: 'Обычная', label: 'Обычная'},
            {value: 'Редкая', label: 'Редкая'},
            {value: 'Уникальная', label: 'Уникальная'}
        ]
    },
    {id: 'genre', type: 'text', placeholder: 'Жанр'},
    {id: 'publishing_year', type: 'number', placeholder: 'Год издания'},
    {id: 'language', type: 'text', placeholder: 'Язык'},
    {
        id: 'age_limit', type: 'select', placeholder: 'Цензура', options: [
            {value: '', label: 'Цензура'},
            {value: '0', label: '0+'},
            {value: '6', label: '6+'},
            {value: '12', label: '12+'},
            {value: '16', label: '16+'},
            {value: '18', label: '18+'},
            {value: '21', label: '21+'}
        ]
    }
];

function BooksCatalog() {
    const navigate = useNavigate()
    const [currentPageBooks, setCurrentPageBooks] = useState<IJSONBookModel[]>([])
    const [currentBookParams, setCurrentBookParams] = useState({
        title: "",
        author: "",
        publisher: "",
        copies_number: "",
        rarity: "",
        genre: "",
        publishing_year: "",
        language: "",
        age_limit: ""
    });
    const [currentPage, setCurrPage] = useState(1)
    const [alertVariant, setAlertVariant] = useState("")
    const [alertMessage, setAlertMessage] = useState("")


    const onFieldChange = (event: any) => {
        let value = event.target.value;
        if (event.target.type === 'number') {
            setCurrentBookParams({...currentBookParams, [event.target.id]: Number(value)});
            return
        }

        setCurrentBookParams({...currentBookParams, [event.target.id]: value});
    };

    const getPageBooks = async (page_number: number) => {
        const rarityRusToEngl: Record<string, string> = {
            ["Обычная"]: "Common",
            ["Редкая"]: "Rare",
            ["Уникальная"]: "Unique",
        }

        const statusObj = await apiGetPageBooks(
            currentBookParams.title,
            currentBookParams.author,
            currentBookParams.publisher,
            currentBookParams.copies_number,
            rarityRusToEngl[currentBookParams.rarity],
            currentBookParams.genre,
            currentBookParams.publishing_year,
            currentBookParams.language,
            currentBookParams.age_limit,
            page_number,
        );

        const statusCode: number = statusObj.response_status;

        const statusMapping: Record<number, { variant: string; message: string }> = {
            [StatusCodes.OK]: {variant: "", message: ""},
            [StatusCodes.BAD_REQUEST]: {variant: "danger", message: "Ошибка выполнения запроса"},
            [StatusCodes.NOT_FOUND]: {
                variant: "danger",
                message: "Книг, удовлетворяющих условиям поиска найдено не было"
            },
            [StatusCodes.INTERNAL_SERVER_ERROR]: {variant: "danger", message: "Внутренняя ошибка сервера"},
        };

        const {variant, message} = statusMapping[statusCode] || {variant: "danger", message: "Неизвестная ошибка"};

        setAlertVariant(variant);
        setAlertMessage(message);

        setCurrentPageBooks(statusObj.response_data);
    };


    const handlerGetPageBooks = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        await getPageBooks(1);
        setCurrPage(1);
    };

    const handlerNextPageBooks = async () => {
        const result = await getPageBooks(currentPage + 1);
        if (result !== null) {
            setCurrPage(currentPage + 1);
        }
    };

    const handlerPrevPageBooks = async () => {
        if (currentPage > 1) {
            await getPageBooks(currentPage - 1);
            setCurrPage(currentPage - 1);
        }
    };

    const handlerGetBookInfo = async (book: IJSONBookModel) => {
        const statusObj = await apiGetBookByID(book.id); // прячет книгу в sessionStorage
        const statusCode: number = statusObj.response_status;

        const statusMapping: Record<number, { variant: string; message: string }> = {
            [StatusCodes.OK]: {variant: "", message: ""},
            [StatusCodes.BAD_REQUEST]: {variant: "danger", message: "Ошибка выполнения запроса"},
            [StatusCodes.NOT_FOUND]: {variant: "danger", message: "Книга не найдена"},
            [StatusCodes.INTERNAL_SERVER_ERROR]: {variant: "danger", message: "Внутренняя ошибка сервера"},
        };

        const {variant, message} = statusMapping[statusCode] || {variant: "danger", message: "Неизвестная ошибка"};

        setAlertVariant(variant);
        setAlertMessage(message);

        if (statusCode === StatusCodes.OK) navigate("/books/book");
    };


    return (
        <div className="my-catalog-page-div d-flex flex-column justify-content-start">
            <UpperMenu/>

            <Container fluid>
                <h1 className="mt-4">Параметры поиска</h1>
                <hr></hr>
                <Form onSubmit={handlerGetPageBooks}>
                    <Row>
                        {bookParams.slice(0, 4).map(field => (
                            <Col className="col-3 my-0">
                                <BookParam id={field.id} type={field.type} placeholder={field.placeholder}
                                           options={field.options} onChange={onFieldChange}
                                />
                            </Col>
                        ))}
                    </Row>
                    <Row>
                        {bookParams.slice(4, 8).map(field => (
                            <Col className="col-3 my-0">
                                <BookParam
                                    id={field.id}
                                    type={field.type}
                                    placeholder={field.placeholder}
                                    options={field.options}
                                    onChange={onFieldChange}/>
                            </Col>
                        ))}
                    </Row>
                    <Row>
                        <Col className="col-3 my-0">
                            <BookParam
                                id={bookParams[8].id}
                                type={bookParams[8].type}
                                placeholder={bookParams[8].placeholder}
                                options={bookParams[8].options}
                                onChange={onFieldChange}/>
                        </Col>
                        <Col className="col-3 my-1">
                            <Button
                                type="submit"
                                variant="primary"
                                className="my-catalog-btn col-12"
                            >Поиск</Button>
                        </Col>
                    </Row>
                </Form>
            </Container>

            <Container fluid>
                <h1 className="mt-5"> Каталог</h1>
                <hr></hr>
                <Alert variant={alertVariant} className="mt-3 my-alert">{alertMessage}</Alert>
                <Matrix
                    items={currentPageBooks}
                    renderItem={
                        (book: IJSONBookModel) =>
                            <Card className="my-book-card h-100">
                                <Card.Header className="my-book-card-header">{book.title}</Card.Header>
                                <Card.Body className="d-flex flex-column justify-content-between">
                                    <Card.Title className="my-book-card-title">{book.author}</Card.Title>
                                    <Button
                                        variant="primary"
                                        className="my-catalog-btn col-3"
                                        onClick={() => handlerGetBookInfo(book)}
                                    >Подробнее</Button>
                                </Card.Body>
                            </Card>
                    }
                    countColumns={3}
                    rowAlign="my-3 h-100"
                    colAlign="col-4"
                />
            </Container>

            <Pagination
                onClickNextPage={handlerNextPageBooks}
                onClickPrevPage={handlerPrevPageBooks}
                currPage={currentPage}
            />
        </div>

    )
}

export default BooksCatalog