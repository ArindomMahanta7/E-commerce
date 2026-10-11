import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <App />
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "rgba(17, 24, 52, 0.92)",
                border: "1px solid rgba(255, 255, 255, 0.14)",
                backdropFilter: "blur(16px)",
                color: "#e2e8f0",
                fontSize: "14px",
                borderRadius: "12px",
                boxShadow: "0 16px 48px rgba(2, 6, 23, 0.55)",
              },
              success: {
                iconTheme: { primary: "#34d399", secondary: "#0a0f1f" },
              },
              error: {
                iconTheme: { primary: "#fb7185", secondary: "#0a0f1f" },
              },
            }}
          />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
