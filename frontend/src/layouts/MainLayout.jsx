import { Outlet } from "react-router-dom";

import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

/** Customer-facing layout: glass navbar, page content, footer, background blobs. */
export default function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Decorative background blobs for depth */}
      <div
        className="blob -left-32 top-24 h-96 w-96 bg-iris-600/50 animate-float-slow"
        aria-hidden="true"
      />
      <div
        className="blob -right-24 top-1/2 h-80 w-80 bg-glow-500/40 animate-float-slow"
        style={{ animationDelay: "2.5s" }}
        aria-hidden="true"
      />
      <div
        className="blob bottom-0 left-1/3 h-72 w-72 bg-violet-600/40 animate-float-slow"
        style={{ animationDelay: "4s" }}
        aria-hidden="true"
      />

      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-iris-600 focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to main content
      </a>

      <Navbar />

      <main id="main-content" className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
