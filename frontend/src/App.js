import Body from "./components/layouts/body/Body";
import Footer from "./components/layouts/footer/Footer";
import Header from "./components/layouts/header/Header";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BrowserRouter } from "react-router-dom";
import { useState } from "react";

function App() {
  const [isAuthenticated,setIsAuthenticated]=useState(!!localStorage.getItem("token"))

  return (
    <BrowserRouter>
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar={false} />
      <Header isAuthenticated={[isAuthenticated,setIsAuthenticated]}/>
      <Body isAuthenticated={[isAuthenticated,setIsAuthenticated]}/>
      <Footer />
    </BrowserRouter>


  );
}

export default App;
