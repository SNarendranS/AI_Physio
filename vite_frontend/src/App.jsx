import Body from "./Layouts//Body";
import Footer from "./Layouts/Footer";
import Header from "./Layouts/Header";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BrowserRouter } from "react-router-dom";
import { useState } from "react";
import ScrollToTop from "./utils/ScrollToTop"; 

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));

  return (
    <BrowserRouter>
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar={false} />
      <ScrollToTop />
      <Header AuthenticatedState={[isAuthenticated, setIsAuthenticated]} />
    <Body AuthenticatedState={[isAuthenticated, setIsAuthenticated]} />
        <Footer />
    </BrowserRouter>
  );
}

export default App;