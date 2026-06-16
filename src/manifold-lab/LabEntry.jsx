import React from "react";
import { useScene } from "@ml/context/SceneContext";
import useSceneState from "@ml/hooks/useSceneState";
import ThreeScene from "@ml/features/sceneControls/ThreeScene";
import Controls from "@ml/features/sceneControls/components/Controls/Controls";

export default function LabEntry() {
  const { loadedConfig } = useScene();

  const {
    metalness,
    setMetalness,
    emissiveIntensity,
    setEmissiveIntensity,
    baseColor,
    setBaseColor,
    wireframeIntensity,
    setWireframeIntensity,
    hyperframeColor,
    setHyperframeColor,
    hyperframeLineColor,
    setHyperframeLineColor,
    cameraView,
    setCameraView,
    environment,
    setEnvironment,
    environmentHue,
    setEnvironmentHue,
    objectCount,
    setObjectCount,
    animationStyle,
    setAnimationStyle,
    objectType,
    setObjectType,
    ambientLightColor,
    setAmbientLightColor,
    ambientLightIntensity,
    setAmbientLightIntensity,
    directionalLightColor,
    setDirectionalLightColor,
    directionalLightIntensity,
    setDirectionalLightIntensity,
    directionalLightX,
    setDirectionalLightX,
    directionalLightY,
    setDirectionalLightY,
    directionalLightZ,
    setDirectionalLightZ,
    scale,
    setScale,
    objectSpeed,
    setObjectSpeed,
    orbSpeed,
    setOrbSpeed,
  } = useSceneState();

  const sceneConfig = {
    metalness,
    emissiveIntensity,
    baseColor,
    wireframeIntensity,
    hyperframeColor,
    hyperframeLineColor,
    cameraView,
    environment,
    environmentHue,
    objectCount,
    animationStyle,
    objectType,
    ambientLightColor,
    ambientLightIntensity,
    directionalLightColor,
    directionalLightIntensity,
    directionalLightX,
    directionalLightY,
    directionalLightZ,
    scale,
    objectSpeed,
    orbSpeed,
  };

  return (
    <>
      <a
        href="/lab"
        style={{
          position: "fixed",
          top: 16,
          left: 16,
          zIndex: 9999,
          fontFamily: "monospace",
          fontSize: "0.65rem",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "rgba(0,255,247,0.65)",
          textDecoration: "none",
          padding: "6px 12px",
          border: "1px solid rgba(0,255,247,0.2)",
          borderRadius: "4px",
          background: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(8px)",
        }}
      >
        ← Lab
      </a>
      <ThreeScene config={sceneConfig} onScaleChange={setScale} />
      <Controls
        config={sceneConfig}
        onChange={{
          setScale,
          setMetalness,
          setEmissiveIntensity,
          setBaseColor,
          setWireframeIntensity,
          setHyperframeColor,
          setHyperframeLineColor,
          setCameraView,
          setEnvironment,
          setEnvironmentHue,
          setObjectCount,
          setAnimationStyle,
          setObjectType,
          setAmbientLightColor,
          setAmbientLightIntensity,
          setDirectionalLightColor,
          setDirectionalLightIntensity,
          setDirectionalLightX,
          setDirectionalLightY,
          setDirectionalLightZ,
          setObjectSpeed,
          setOrbSpeed,
        }}
      />
    </>
  );
}
