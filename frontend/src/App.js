import { useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "@/pages/Landing";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import DataCompliance from "@/pages/DataCompliance";
import { Toaster } from "@/components/ui/sonner";
import { PersonalizationProvider } from "@/context/PersonalizationContext";
import { Analytics } from "@vercel/analytics/react";

function App() {
  useEffect(() => {
    // Force dark mode globally (this app is dark-only by design)
    document.documentElement.classList.add("dark");
    document.documentElement.style.colorScheme = "dark";
  }, []);

  return (
    <div className="App">
      <BrowserRouter>
        <PersonalizationProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/data-compliance" element={<DataCompliance />} />
          </Routes>
        </PersonalizationProvider>
      </BrowserRouter>
      <Toaster richColors theme="dark" position="top-center" />
      <Analytics />
    </div>
  );
}

export default App;
