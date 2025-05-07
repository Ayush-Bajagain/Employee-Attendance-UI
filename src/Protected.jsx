import { Navigate } from "react-router-dom";
import { Provider } from "./context/ContextProvider";

const Protected = ({ children }) => {
    const { state } = Provider();
    const isLogged = sessionStorage.getItem("isLogged");

    if (!isLogged) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

export default Protected;
