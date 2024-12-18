import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css'
import Main from "./pages/main";
import {Route, Routes} from 'react-router-dom';
import BooksCatalog from "./pages/books-catalog";
import Profile from "./pages/profile";
import SignIn from "./pages/sign-in";
import SignUp from "./pages/sign-up";
import Book from "./pages/book";
import LibCard from "./pages/lib-card";
import Reservation from "./pages/reservation";
import ReviewPage from "./pages/review";
import ReservationsCatalog from "./pages/reservations-catalog";
import {SessionProvider} from "./components/session-context";

function App() {

    return (
        <SessionProvider>
            <Routes>
                <Route path="/" element={<Main/>}></Route>
                <Route path="/auth/sign-in" element={<SignIn/>}></Route>
                <Route path="/auth/sign-up" element={<SignUp/>}></Route>
                <Route path="/profile" element={<Profile/>}></Route>
                <Route path="/books" element={<BooksCatalog/>}></Route>
                <Route path="/books/book" element={<Book/>}></Route>
                <Route path="/profile/lib-card" element={<LibCard/>}></Route>
                <Route path="/profile/reservations/reservation" element={<Reservation/>}></Route>
                <Route path="/books/book/review" element={<ReviewPage/>}></Route>
                <Route path="/profile/reservations" element={<ReservationsCatalog/>}></Route>
            </Routes>
        </SessionProvider>
    );
}

export default App;
