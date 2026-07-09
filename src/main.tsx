import React from "react";
import ReactDOM from "react-dom/client";
import { PosterEditor } from "./components/PosterEditor";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <PosterEditor />
  </React.StrictMode>,
);
