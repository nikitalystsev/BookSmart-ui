import React from 'react';
import '../css/main.css';
import mainImage from '../img/main_image.svg'
import UpperMenu from "../components/upper-menu";

function Main() {

    return (
        <div>
            <UpperMenu/>

            <div className="my-main-image-container d-flex justify-content-center position-fixed">
                <img src={mainImage} alt="Здесь должен быть мой moodboard"/>
            </div>
        </div>
    );
}

export default Main;
