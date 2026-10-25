import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { JarvisProvider } from "./jarvis/JarvisContext";
import JarvisDialogs from "./jarvis/JarvisDialogs";
import { OperationsProvider } from "./jarvis/OperationsContext";
import OperationsDialog from "./jarvis/OperationsDialog";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <JarvisProvider>
      <OperationsProvider>
        <App />
        <JarvisDialogs />
        <OperationsDialog />
      </OperationsProvider>
    </JarvisProvider>
  </React.StrictMode>
);
