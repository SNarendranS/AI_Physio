import Body from "./components/layouts/body/Body";
import Footer from "./components/layouts/footer/Footer";
import Header from "./components/layouts/header/Header";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BrowserRouter } from "react-router-dom";
import { useState } from "react";
import ScrollToTop from "./utils/ScrollToTop"; // adjust path

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