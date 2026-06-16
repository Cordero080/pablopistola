import React from "react";
import { createRoot } from "react-dom/client";
import { AuthProvider } from "@ml/features/auth/context/AuthContext";
import { SceneProvider } from "@ml/context/SceneContext";
import LabEntry from "@ml/LabEntry";
import "@ml/index.css";

createRoot(document.getElementById("manifold-root")).render(
  <AuthProvider>
    <SceneProvider>
      <LabEntry />
    </SceneProvider>
  </AuthProvider>,
);
