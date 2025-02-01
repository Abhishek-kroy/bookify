import './App.css';
import "bootstrap/dist/css/bootstrap.min.css";
import { Routes, Route } from "react-router-dom";
import RegisterForm from './pages/Register';
import LoginForm from './pages/Login';
import NavbarCom from './components/Navbar';
import List from './pages/List';
import Home from './pages/Home';
import BookDetails from './pages/BookDetails';
import Footer from './components/Footer';
import BookOrders from './pages/BookOrders';
import AddToCart from './pages/AddToCart'

function App() {
  return (
    <div>

    <NavbarCom/>
        <Routes>
        <Route path='/' element={<Home/>} />
        <Route path='/login' element={<LoginForm>Login</LoginForm>} />
        <Route path='/register' element={<RegisterForm>Login</RegisterForm>} />
        <Route path='/book/list' element={<List>Login</List>} />
        <Route path='/cart/:userId' element={<AddToCart>Login</AddToCart>} />
        <Route path='/book/view/:bookId' element={<BookDetails>Login</BookDetails>} />
        <Route path='/book/order/:userId' element={<BookOrders />} />
      </Routes>
    <Footer/>
    </div>
  );
}

export default App;