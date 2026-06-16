import React, { createContext, useContext, useState, useCallback } from 'react';

/**
 * Scene Context - Manages scene state across the application
 *
 * Tracks:
 * - Current scene ID and ownership
 * - Scene metadata (name, description, isPublic)
 * - Scene mode: fresh, loaded, or remixed
 *
 * Provides:
 * - loadScene() - Load scene into editor
 * - deleteScene() - Delete a scene
 * - resetScene() - Reset to fresh state
 */

const SceneContext = createContext(null);

export function SceneProvider({ children }) {
  // Scene state
  const [currentSceneId, setCurrentSceneId] = useState(null);
  const [sceneOwner, setSceneOwner] = useState(null); // User ID who owns the scene
  const [sceneName, setSceneName] = useState('');
  const [loadedConfig, setLoadedConfig] = useState(null); // Store loaded scene config

  // Scene mode: 'fresh', 'loaded', 'remixed'
  const [sceneMode, setSceneMode] = useState('fresh');

  /**
   * Determine if current user owns the loaded scene
   * @param {string} currentUserId - ID of logged-in user
   * @returns {boolean}
   */
  const isOwnScene = useCallback(
    (currentUserId) => {
      return sceneOwner && sceneOwner === currentUserId;
    },
    [sceneOwner]
  );

  /**
   * Load scene into editor
   * @param {Object} scene - Scene data from API
   * @param {string} currentUserId - ID of logged-in user (null if not logged in)
   * @returns {Object} - The scene config to be applied
   */
  const loadScene = useCallback((scene, currentUserId = null) => {
    setCurrentSceneId(scene.id || scene._id); // scene.id if from saveScene, scene._id if from API
    setSceneOwner(scene.userId);
    setSceneName(scene.name);
    setLoadedConfig(scene.config); // Store the config!

    // Determine scene mode
    if (currentUserId && scene.userId === currentUserId) {
      setSceneMode('loaded'); // User is editing their own scene
    } else {
      setSceneMode('remixed'); // User is remixing someone else's scene
    }

    // Return the config so caller can apply it
    return scene.config || {};
  }, []);

  /**
   * Delete scene
   * @param {string} sceneId - ID of scene to delete
   * @param {string} token - JWT auth token
   * @returns {Promise<void>}
   */
  const deleteScene = useCallback(
    async (sceneId, token) => {
      // Import the deleteScene API function at the top of the file
      const { deleteScene: deleteSceneAPI } = await import('../services/sceneApi');

      // Call the real API
      await deleteSceneAPI(sceneId, token);

      // If deleting current scene, reset context
      if (sceneId === currentSceneId) {
        resetScene();
      }
    },
    [currentSceneId]
  );

  /**
   * Reset to fresh state (new scene)
   */
  const resetScene = useCallback(() => {
    // what is use callback? in simple terms it memoizes the function so it doesnt get recreated on every render, meaning if you pass it as a prop to a child component that uses React.memo it wont trigger a re render unless its dependencies change
    //dependencies can be simply defined as variables or states used inside the function that if changed should recreate the function, an example of a dependency is currentSceneId in the deleteScene function above
    setCurrentSceneId(null);
    setSceneOwner(null);
    setSceneName('');
    setLoadedConfig(null);
    setSceneMode('fresh');
  }, []);

  const value = {
    // State
    currentSceneId,
    sceneOwner,
    sceneName,
    sceneMode,
    loadedConfig,

    // Computed
    isOwnScene,

    // Actions
    loadScene,
    deleteScene,
    resetScene,

    // Setters
    setSceneName,
  };

  return <SceneContext.Provider value={value}>{children}</SceneContext.Provider>;
}

/**
 * Hook to use Scene Context
 */
export function useScene() {
  const context = useContext(SceneContext);
  if (!context) {
    throw new Error('useScene must be used within a SceneProvider');
  }
  return context;
}
