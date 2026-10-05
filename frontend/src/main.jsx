import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./App.jsx";
import "./index.css";
const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "1234567890-dummy.apps.googleusercontent.com";
createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider clientId={clientId}>
    <App />
  </GoogleOAuthProvider>
);
