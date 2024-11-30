import {Button} from "react-bootstrap";
import {useEffect, useState} from "react";
import {ISignInOutput} from "../types/types";
import {getCurrentUser} from "../services/auth.service";
import {useNavigate} from "react-router-dom";
import '../css/upper-menu.css'

function InputButton() {
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState<ISignInOutput | undefined | null>(null);

    useEffect(() => {
        const user = getCurrentUser();
        if (user) setCurrentUser(user);
    }, []);

    const handlerGoToProfile = () => {
        navigate('/profile');
    };

    const handleGoToSignIn = () => {
        navigate('/auth/sign-in');
    };

    return (
        <>
            {currentUser ? (
                <Button variant="outline-primary" className="my-upper-menu-button" onClick={handlerGoToProfile}>
                    Личный кабинет
                </Button>
            ) : (
                <Button variant="outline-primary" className="my-upper-menu-button" onClick={handleGoToSignIn}>
                    Войти
                </Button>
            )}
        </>
    )
}

export default InputButton