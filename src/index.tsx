import './input.css';
import * as React from "react";
import WebApp from './WebApp';
import { createRoot } from "react-dom/client";

const root = createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <WebApp/>
  </React.StrictMode>
);