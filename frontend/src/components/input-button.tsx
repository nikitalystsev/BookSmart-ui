import {Button} from "react-bootstrap";
import {useEffect, useState} from "react";
import {ISignInOutput} from "../types/types";
import {getCurrentUser} from "../services/auth.service";
import {useNavigate} from "react-router-dom";
import '../css/upper-menu.css'

function InputButton() {
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState<ISignInOutput | null>(null);

    useEffect(() => {
        // console.log("call input button use effect")
        const user = getCurrentUser()
        if (user) setCurrentUser(user)
    }, []);

    const handlerGoToProfilePage = () => {
        navigate('/profile')
    };

    const handleGoToSignInPage = () => {
        navigate('/auth/sign-in')
    };

    return (
        <>
            {currentUser ? (
                <Button variant="outline-primary" className="my-upper-menu-button" onClick={handlerGoToProfilePage}>
                    Личный кабинет
                </Button>
            ) : (
                <Button variant="outline-primary" className="my-upper-menu-button" onClick={handleGoToSignInPage}>
                    Войти
                </Button>
            )}
        </>
    )
}

export default InputButton