import {Button, ButtonGroup} from "react-bootstrap";
import {ChevronLeft, ChevronRight} from "react-bootstrap-icons";
import Container from "react-bootstrap/Container";
import React from "react";
import '../css/pagination.css'

interface PaginationProps {
    onClickNextPage: (event: React.MouseEvent<HTMLButtonElement>) => void;
    onClickPrevPage: (event: React.MouseEvent<HTMLButtonElement>) => void;
    currPage: number;
}

const Pagination: React.FC<PaginationProps> = ({onClickNextPage, onClickPrevPage, currPage}) => {
    return (
        <Container fluid className="d-flex flex-fill justify-content-center align-self-end">
            <ButtonGroup className="my-pagination mb-3 mt-5 align-self-end">
                <Button variant="outline-primary"
                        onClick={onClickPrevPage}
                        className="my-pagination-btns"
                >
                    <ChevronLeft/> Назад
                </Button>
                <Button variant="outline-primary" className="my-pagination-btns">{currPage}</Button>
                <Button variant="outline-primary"
                        onClick={onClickNextPage}
                        className="my-pagination-btns"
                >
                    Вперед <ChevronRight/>
                </Button>
            </ButtonGroup>
        </Container>
    );
};

export default Pagination;
