import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter as Routers } from "react-router-dom";
import { ContextProvider } from "./context/ContextProvider.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Routers>
      <ContextProvider>
        <App />
      </ContextProvider>
    </Routers>
  </StrictMode>
);
