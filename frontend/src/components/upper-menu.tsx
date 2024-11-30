import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import '../css/upper-menu.css'
import logo from '../img/logo.svg'
import InputButton from "./input-button";
import {useLocation, useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";

function UpperMenu() {
    const navigate = useNavigate()
    const location = useLocation()
    const [inMainPage, setMainPage] = useState(false)
    const [inBooksCatalogPage, setBooksCatalogPage] = useState(false)

    useEffect(() => {
        whereAmI()
    }, [])

    const handlerGoToMainPage = () => {
        navigate("/")
    }
    const handlerGoToBookCatalog = () => {
        navigate("/books")
    }

    function whereAmI() {
        if (location.pathname === '/') {
            setMainPage(true)
        } else if (location.pathname === '/books') {
            setBooksCatalogPage(true)
        }
    }

    return (
        <Navbar expand="lg" className="my-upper-menu-navbar bg-body-tertiary">
            <Container fluid>
                <Navbar.Brand href="#home" className="my-upper-menu-brand">
                    <img
                        alt=""
                        src={logo}
                        className="my-upper-menu-logo"
                    />{' '}
                    BookSmart
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav"/>
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link active={inMainPage} onClick={handlerGoToMainPage}>Главная</Nav.Link>
                        <Nav.Link active={inBooksCatalogPage} onClick={handlerGoToBookCatalog}>Каталог</Nav.Link>
                    </Nav>
                    <InputButton/>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default UpperMenu;