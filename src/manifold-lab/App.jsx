import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom';
import useSceneState from '@ml/hooks/useSceneState';
import ThreeScene from '@ml/features/sceneControls/ThreeScene';
import Controls from '@ml/features/sceneControls/components/Controls/Controls';
import SaveControls from '@ml/features/sceneControls/components/SaveButton/SaveControls';
import ExitButton from '@ml/features/sceneControls/components/Controls/ExitButton/ExitButton';
import ScrambleButton from '@ml/components/ui/ScrambleButton/ScrambleButton';
import NavBar from '@ml/components/layout/NavBar/NavBar';
import { SceneProvider, useScene } from '@ml/context/SceneContext';
import { AuthProvider, useAuth } from '@ml/features/auth/context/AuthContext';
import { QuantumCursor } from '@ml/components/ui/Effects';
import Footer from '@ml/components/pages/HomePage/components/Footer/Footer';
import './cursor-override.module.scss';
import sharedStyles from '@ml/styles/shared.module.scss';

// Lazy-loaded pages for better initial load performance
const HomePage = lazy(() => import('@/components/pages/HomePage/HomePage'));
const ShowcaseGallery = lazy(() => import('@/components/pages/Showcase/ShowcaseGallery'));
const MyScenesPage = lazy(() => import('@/components/pages/MyScenesPage/MyScenesPage'));
const SignUpPage = lazy(() => import('@/features/auth/pages/SignUpPage/SignUpPage'));
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage/LoginPage'));

function GeomLab() {
  const { loadedConfig, resetScene } = useScene(); // CUSTOM HOOK: Get loaded config from context
  const { token, isAuthenticated } = useAuth(); // CUSTOM HOOK: Get auth for save functionality
  const navigate = useNavigate(); // For navigation is usNavigate
  const location = useLocation(); // Current location

  // Save prompt modal state
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [showNameInput, setShowNameInput] = useState(false);
  const [sceneName, setSceneName] = useState('');
  const [nextPath, setNextPath] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [allowNavigation, setAllowNavigation] = useState(false);

  // SCENE STATE - extracted to custom hook
  const {
    // Material properties
    // NOTE: It's NOT a Static Object. This line runs EVERY TIME App.jsx renders.
    // The ENTIRE config object is recreated every render.**
    // Where do they change?**
    // In the hook (useSceneState.js).
    // Then App.jsx creates a NEW config object with the NEW values.**
    // NOTE: ** The ENTIRE config object is recreated every render.**

    metalness,
    setMetalness,
    emissiveIntensity,
    setEmissiveIntensity,
    baseColor, // ie; Before state change: '#4a0e78'
    setBaseColor, // After user picks red and state updates: This is NOW '#ff0000'
    // ThreeScene gets { baseColor: '#ff0000' }
    wireframeIntensity,
    setWireframeIntensity,
    // Hyperframe
    hyperframeColor,
    setHyperframeColor,
    hyperframeLineColor,
    setHyperframeLineColor,
    // Scene behavior
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
    // Lighting
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
    // Animation
    scale,
    setScale,
    objectSpeed,
    setObjectSpeed,
    orbSpeed,
    setOrbSpeed,
  } = useSceneState();

  // Track changes to mark as unsaved
  useEffect(() => {
    setHasUnsavedChanges(true);
  }, [
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
  ]);

  // Intercept link clicks for navigation blocking
  useEffect(() => {
    const handleClick = (e) => {
      if (!hasUnsavedChanges || allowNavigation) return;

      const link = e.target.closest('a');
      if (link && link.href) {
        const url = new URL(link.href);
        let targetPath = url.pathname;

        // Strip the base path if present (for GitHub Pages deployment)
        const basePath = import.meta.env.BASE_URL?.replace(/\/$/, '') || '';
        if (basePath && targetPath.startsWith(basePath)) {
          targetPath = targetPath.slice(basePath.length) || '/';
        }

        // Only block internal navigation to different routes
        if (targetPath !== location.pathname && url.origin === window.location.origin) {
          e.preventDefault();
          e.stopPropagation();
          setNextPath(targetPath);
          setShowSavePrompt(true);
        }
      }
    };

    // Use capture phase to intercept before React Router
    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [hasUnsavedChanges, allowNavigation, location.pathname]);

  // Execute pending navigation after user approves
  useEffect(() => {
    if (allowNavigation && nextPath) {
      navigate(nextPath);
      setAllowNavigation(false);
      setNextPath(null);
    }
  }, [allowNavigation, nextPath, navigate]);

  // Apply loaded config when it changes
  useEffect(() => {
    if (loadedConfig) {
      // Apply material properties
      if (loadedConfig.metalness !== undefined) setMetalness(loadedConfig.metalness);
      if (loadedConfig.emissiveIntensity !== undefined)
        setEmissiveIntensity(loadedConfig.emissiveIntensity);
      if (loadedConfig.baseColor) setBaseColor(loadedConfig.baseColor);
      if (loadedConfig.wireframeIntensity !== undefined)
        setWireframeIntensity(loadedConfig.wireframeIntensity);

      // Apply hyperframe
      if (loadedConfig.hyperframeColor) setHyperframeColor(loadedConfig.hyperframeColor);
      if (loadedConfig.hyperframeLineColor)
        setHyperframeLineColor(loadedConfig.hyperframeLineColor);

      // Apply scene behavior
      if (loadedConfig.cameraView) setCameraView(loadedConfig.cameraView);
      if (loadedConfig.environment) setEnvironment(loadedConfig.environment);
      if (loadedConfig.environmentHue !== undefined) setEnvironmentHue(loadedConfig.environmentHue);
      if (loadedConfig.objectCount !== undefined) setObjectCount(loadedConfig.objectCount);
      if (loadedConfig.animationStyle) setAnimationStyle(loadedConfig.animationStyle);
      if (loadedConfig.objectType) setObjectType(loadedConfig.objectType);

      // Apply lighting
      if (loadedConfig.ambientLightColor) setAmbientLightColor(loadedConfig.ambientLightColor);
      if (loadedConfig.ambientLightIntensity !== undefined)
        setAmbientLightIntensity(loadedConfig.ambientLightIntensity);
      if (loadedConfig.directionalLightColor)
        setDirectionalLightColor(loadedConfig.directionalLightColor);
      if (loadedConfig.directionalLightIntensity !== undefined)
        setDirectionalLightIntensity(loadedConfig.directionalLightIntensity);
      if (loadedConfig.directionalLightX !== undefined)
        setDirectionalLightX(loadedConfig.directionalLightX);
      if (loadedConfig.directionalLightY !== undefined)
        setDirectionalLightY(loadedConfig.directionalLightY);
      if (loadedConfig.directionalLightZ !== undefined)
        setDirectionalLightZ(loadedConfig.directionalLightZ);
      if (loadedConfig.scale !== undefined) setScale(loadedConfig.scale);

      // Clear the loaded config so it doesn't re-apply
      // We'll do this after a short delay to ensure it's applied
      setTimeout(() => resetScene(), 100);
    }
  }, [loadedConfig]);

  // Handle browser back/forward buttons (popstate event)
  useEffect(() => {
    const handlePopState = (e) => {
      // If there are unsaved changes and we're not allowing navigation,
      // push the current location back to prevent leaving
      if (hasUnsavedChanges && !allowNavigation) {
        // Push current location back onto history to "cancel" the back action
        window.history.pushState(null, '', window.location.href);
        // Show save prompt
        setNextPath('/'); // Default to home for back navigation
        setShowSavePrompt(true);
      }
    };

    // Push initial state to enable popstate interception
    if (hasUnsavedChanges && !allowNavigation) {
      window.history.pushState(null, '', window.location.href);
    }

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [hasUnsavedChanges, allowNavigation]);

  // Prevent browser navigation (close tab, refresh, back button)
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges && !allowNavigation) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, allowNavigation]);

  // Handle save from modal
  const handleSaveFromModal = () => {
    setShowSavePrompt(false);
    setShowNameInput(true);
  };

  // Handle save scene with name
  const handleSaveScene = async () => {
    // Check authentication before saving
    if (!isAuthenticated || !token) {
      alert('Please log in to save scenes');
      navigate('/login');
      return;
    }

    if (sceneName && sceneName.trim() !== '') {
      try {
        const { saveScene } = await import('./services/sceneApi');

        const sceneData = {
          name: sceneName.trim(),
          description: '',
          config: sceneConfig,
        };

        await saveScene(sceneData, token);
        alert(`"${sceneName}" saved successfully!`);
        setHasUnsavedChanges(false); // Mark as saved
        setShowNameInput(false);
        setSceneName('');
        setAllowNavigation(true);
      } catch (error) {
        alert(`Failed to save scene: ${error.message}`);
      }
    }
  };

  // Handle cancel name input
  const handleCancelNameInput = () => {
    setShowNameInput(false);
    setSceneName('');
    setShowSavePrompt(true); // Go back to save prompt
  };

  // Handle exit without saving from modal
  const handleExitWithoutSaving = () => {
    setShowSavePrompt(false);
    setHasUnsavedChanges(false);
    // Navigate to home - nextPath should already be set by handleExit
    navigate(nextPath || '/');
    setNextPath(null);
  };

  // Handle cancel exit from modal
  const handleCancelExit = () => {
    setShowSavePrompt(false);
    setNextPath(null);
  };

  // Handle exit button click
  // these are 20 states passed down to ThreeScene as props
  // Create sceneConfig object for SaveButton (VALUES ONLY)
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

  // Handle exit with save prompt
  const handleExit = async () => {
    setShowSavePrompt(true);
    setNextPath('/');
  };

  return (
    <>
      <NavBar />
      <SaveControls sceneConfig={sceneConfig} />
      <ExitButton onClick={handleExit} />
      {/* Save Prompt Modal */}
      {showSavePrompt && (
        <div className="save-modal-overlay" onClick={handleCancelExit}>
          <div className="save-modal" onClick={(e) => e.stopPropagation()}>
            <button className="save-modal__close" onClick={handleCancelExit}>
              ✕
            </button>

            <h2 className="save-modal__title">Save Scene?</h2>

            <p className="save-modal__message">Your creation hasn't been saved yet.</p>

            <div className="save-modal__actions">
              <ScrambleButton
                onClick={handleSaveFromModal}
                variant="primary"
                className="save-modal__btn"
              >
                Save & Exit
              </ScrambleButton>

              <ScrambleButton
                onClick={handleExitWithoutSaving}
                variant="danger"
                className="save-modal__btn"
              >
                Exit Without Saving
              </ScrambleButton>

              <ScrambleButton
                onClick={handleCancelExit}
                variant="secondary"
                className="save-modal__btn"
              >
                Cancel
              </ScrambleButton>
            </div>
          </div>
        </div>
      )}
      {/* Name Input Modal */}
      {showNameInput && (
        <div className="save-modal-overlay" onClick={handleCancelNameInput}>
          <div className="save-modal" onClick={(e) => e.stopPropagation()}>
            <button className="save-modal__close" onClick={handleCancelNameInput}>
              ✕
            </button>

            <h2 className="save-modal__title">Name Your Masterpiece</h2>

            <input
              type="text"
              className={`save-modal__input holographic-input ${sharedStyles.angledCorners}`}
              placeholder="Enter scene name..."
              value={sceneName}
              onChange={(e) => setSceneName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSaveScene();
                }
              }}
              autoFocus
            />

            <div className="save-modal__actions">
              <ScrambleButton
                onClick={handleSaveScene}
                variant="primary"
                className="save-modal__btn"
                disabled={!sceneName.trim()}
              >
                Save
              </ScrambleButton>

              <ScrambleButton
                onClick={handleCancelNameInput}
                variant="secondary"
                className="save-modal__btn"
              >
                Back
              </ScrambleButton>
            </div>
          </div>
        </div>
      )}

      <ThreeScene config={sceneConfig} onScaleChange={setScale} />
      {/* ONLY NEEDS VALUE from state to call hook and update Three.js ui value */}
      <Controls
        config={sceneConfig} //Needs all VALUES from State
        onChange={{
          setScale, // Need all SETTERS from State
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

function HomePageWithNav() {
  const navigate = useNavigate();

  // Direct navigation handler
  const handleEnter = () => {
    navigate('/geom-lab');
  };

  return (
    <>
      <HomePage onEnter={handleEnter} />
    </>
  );
}

function AppContent() {
  // Get authentication status from AuthContext
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  const currentPath = location.pathname;
  const isHomePage = currentPath === '/' || currentPath === '';
  const isGeomLabPage = currentPath === '/geom-lab' || currentPath === '/geometry-lab';

  // Set cursor style and body class based on current route
  useEffect(() => {
    if (isGeomLabPage) {
      // On geom-lab, use default cursor for better control interaction
      document.body.classList.add('geom-lab-page');
    } else {
      // On all other pages, hide the default cursor to allow quantum cursor to work
      document.body.classList.remove('geom-lab-page');
    }
  }, [currentPath, isHomePage, isGeomLabPage]);

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          background: '#000',
          color: '#fff',
          fontSize: '24px',
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <SceneProvider>
      {/* Render QuantumCursor on desktop only — no mouse on touch devices */}
      {!isGeomLabPage && !('ontouchstart' in window) && <QuantumCursor />}

      {/* Footer only on homepage bottom */}
      {currentPath === '/' && <Footer />}

      <Suspense fallback={<div style={{ background: '#0a0a0a', minHeight: '100vh' }} />}>
        <Routes>
          {/* PUBLIC ROUTE - anyone can access */}
          <Route path="/" element={<HomePageWithNav />} />

          {/* PROTECTED ROUTES - redirect to login if not authenticated */}
          <Route
            path="/geom-lab"
            element={isAuthenticated ? <GeomLab /> : <Navigate to="/login" />}
          />
          <Route
            path="/geometry-lab"
            element={isAuthenticated ? <GeomLab /> : <Navigate to="/login" />}
          />
          <Route
            path="/showcase"
            element={
              isAuthenticated ? (
                <>
                  <NavBar />
                  <ShowcaseGallery />
                </>
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/scenes"
            element={isAuthenticated ? <MyScenesPage /> : <Navigate to="/login" />}
          />

          {/* PUBLIC AUTH ROUTES - anyone can access */}
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* CATCH-ALL - redirect unmatched routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </SceneProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
