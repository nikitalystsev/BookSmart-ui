import React, {FC} from "react";
import {Alert} from "react-bootstrap";

interface AlertProps {
    message: string;
    variant: string;
    align: string;
}

const MyAlert: FC<AlertProps> = ({message, variant, align}) => {
    return (
        <>
            {message !== "" ? (
                <Alert variant={variant} className={align}>{message}</Alert>
            ) : null}
        </>
    )
}

export default MyAlert