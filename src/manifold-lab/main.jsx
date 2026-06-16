import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import ErrorBoundary from '@ml/components/ui/ErrorBoundary/ErrorBoundary';
import { portalWorldsBright } from '@ml/data/portalWorlds';
import quantumCollapse from '@ml/utils/quantumCollapse';
import './index.css';

// Capacitor imports
import { Capacitor } from '@capacitor/core';
import { Camera } from '@capacitor/camera';
import { PushNotifications } from '@capacitor/push-notifications';
import { Preferences } from '@capacitor/preferences';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';

function updateGlobalPortalColors() {
  const newPortal = quantumCollapse(portalWorldsBright);
  document.documentElement.style.setProperty('--portal-color-0', newPortal.colors[0]);
  document.documentElement.style.setProperty('--portal-color-1', newPortal.colors[1]);
  document.documentElement.style.setProperty('--portal-color-2', newPortal.colors[2]);
}

// Initialize with random colors
updateGlobalPortalColors();

// Change colors on click globally
document.addEventListener('click', updateGlobalPortalColors);

ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <App />
    </BrowserRouter>
  </ErrorBoundary>
);

// ============================================
// Capacitor Plugin Initialization
// ============================================

/**
 * Initialize Capacitor plugins when running on native platforms
 * This runs after the React app has been mounted
 */
async function initCapacitorPlugins() {
  // Only initialize on native platforms (iOS/Android)
  if (!Capacitor.isNativePlatform()) {
    console.log('Running in web mode - Capacitor plugins not initialized');
    return;
  }

  console.log('Initializing Capacitor plugins for native platform...');

  try {
    // Initialize Status Bar with app theme
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: '#0a0a0f' });
    console.log('StatusBar initialized');

    // Hide splash screen after app is ready
    await SplashScreen.hide();
    console.log('SplashScreen hidden');

    // Request camera permissions (will prompt user when needed)
    const cameraPermissions = await Camera.checkPermissions();
    console.log('Camera permissions status:', cameraPermissions);

    // Initialize Push Notifications
    await initPushNotifications();

    // Initialize Preferences storage
    await initPreferencesStorage();

    console.log('All Capacitor plugins initialized successfully');
  } catch (error) {
    console.error('Error initializing Capacitor plugins:', error);
  }
}

/**
 * Initialize Push Notifications with listeners
 */
async function initPushNotifications() {
  // Request permission for push notifications
  const permStatus = await PushNotifications.checkPermissions();

  if (permStatus.receive === 'prompt') {
    const result = await PushNotifications.requestPermissions();
    if (result.receive !== 'granted') {
      console.log('Push notification permission not granted');
      return;
    }
  }

  if (permStatus.receive !== 'granted') {
    console.log('Push notification permission not granted');
    return;
  }

  // Register for push notifications
  await PushNotifications.register();

  // Add listeners for push notification events
  PushNotifications.addListener('registration', (token) => {
    console.log('Push registration success, token:', token.value);
    // Store token for later use (e.g., send to backend)
    Preferences.set({ key: 'pushToken', value: token.value });
  });

  PushNotifications.addListener('registrationError', (error) => {
    console.error('Error on push registration:', error);
  });

  PushNotifications.addListener('pushNotificationReceived', (notification) => {
    console.log('Push notification received:', notification);
  });

  PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
    console.log('Push notification action performed:', notification);
  });

  console.log('PushNotifications initialized');
}

/**
 * Initialize Preferences storage and restore user settings
 */
async function initPreferencesStorage() {
  try {
    // Check if this is first launch
    const { value: hasLaunched } = await Preferences.get({ key: 'hasLaunched' });

    if (!hasLaunched) {
      // First launch - set default preferences
      await Preferences.set({ key: 'hasLaunched', value: 'true' });
      await Preferences.set({ key: 'theme', value: 'dark' });
      console.log('First launch - default preferences set');
    } else {
      // Restore saved preferences
      const { value: savedTheme } = await Preferences.get({ key: 'theme' });
      console.log('Restored preferences - theme:', savedTheme);
    }

    console.log('Preferences storage initialized');
  } catch (error) {
    console.error('Error initializing Preferences:', error);
  }
}

// Initialize Capacitor plugins after DOM is ready
if (document.readyState === 'complete') {
  initCapacitorPlugins();
} else {
  window.addEventListener('load', initCapacitorPlugins);
}
