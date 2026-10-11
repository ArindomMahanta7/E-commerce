import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";

import AdminSidebar from "../components/layout/AdminSidebar";

/** Admin layout: fixed sidebar on desktop, slide-in drawer on mobile. */
export default function AdminLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  return (
    <div className="flex min-h-screen">
      <div
        className="blob -left-20 top-10 h-96 w-96 bg-iris-600/40"
        aria-hidden="true"
      />
      <div
        className="blob bottom-0 right-0 h-80 w-80 bg-glow-500/30"
        aria-hidden="true"
      />

      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-white/10 bg-night-950/60 backdrop-blur-xl lg:block">
        <AdminSidebar />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
            />
            <motion.aside
              className="glass-strong fixed inset-y-0 left-0 z-50 w-72 overflow-y-auto lg:hidden"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.22 }}
            >
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="absolute right-3 top-3 rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white"
                aria-label="Close admin menu"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
              <AdminSidebar onNavigate={() => setDrawerOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-white/10 bg-night-950/60 px-4 py-3 backdrop-blur-xl lg:hidden">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="rounded-lg p-2 text-slate-300 hover:bg-white/10 hover:text-white"
            aria-label="Open admin menu"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
          <span className="text-sm font-semibold text-white">Admin Dashboard</span>
        </div>

        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
