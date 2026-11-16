import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboard";
import AnalyzeReview from "./pages/AnalyzeReview";
import BatchAnalysis from "./pages/BatchAnalysis";
import Analytics from "./pages/Analytics";
import ModelInfo from "./pages/ModelInfo";
import About from "./pages/About";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="analyze" element={<AnalyzeReview />} />
          <Route path="batch" element={<BatchAnalysis />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="model-info" element={<ModelInfo />} />
          <Route path="about" element={<About />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
