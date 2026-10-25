import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { JarvisProvider } from "./jarvis/JarvisContext";
import JarvisDialogs from "./jarvis/JarvisDialogs";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <JarvisProvider>
      <App />
      <JarvisDialogs />
    </JarvisProvider>
  </React.StrictMode>
);
