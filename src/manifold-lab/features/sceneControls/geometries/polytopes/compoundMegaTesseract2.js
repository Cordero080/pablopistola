import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils';
import { createTesseractWithFaces, stableStringify } from '../../utils/geometryHelpers';

// Cache built geometries to avoid recomputing the expensive sweep on reselection.
const geometryCache = new Map();
const CACHE_LABEL = 'compoundMegaTesseractNested';

function createCacheKey(options) {
  if (!options || typeof options !== 'object') return 'default';
  try {
    const signature = stableStringify(options);
    return signature === '{}' ? 'default' : `opts:${signature}`;
  } catch (error) {
    // Failed to stringify options for cache
    return null;
  }
}

function cloneUserData(data = {}) {
  const cloned = { ...data };
  for (const key of Object.keys(cloned)) {
    const value = cloned[key];
    if (Array.isArray(value)) cloned[key] = value.slice();
  }
  return cloned;
}

function cloneWithUserData(source) {
  const geometryClone = source.clone();
  geometryClone.userData = cloneUserData(source.userData);
  return geometryClone;
}

export function createCompoundMegaTesseractNested(options = {}) {
  const cacheKey = createCacheKey(options);
  const cachedGeometry = cacheKey ? geometryCache.get(cacheKey) : null;
  if (cachedGeometry) return cloneWithUserData(cachedGeometry);

  const primaryTesseract = createTesseractWithFaces(2.0, 1.5, Math.PI / 8);
  primaryTesseract.translate(0, 0.01, 0);

  const rotatedTesseract = createTesseractWithFaces(2.0, 1.5, Math.PI / 8 + Math.PI / 4);
  rotatedTesseract.translate(0, 0.02, 0);

  const innerScale = 0.85;

  const innerPrimary = primaryTesseract.clone();
  innerPrimary.scale(innerScale, innerScale, innerScale);
  innerPrimary.translate(0, 0.03, 0);

  const innerRotated = rotatedTesseract.clone();
  innerRotated.scale(innerScale, innerScale, innerScale);
  innerRotated.translate(0, 0.04, 0);

  const mergedCompoundMega = mergeGeometries(
    [primaryTesseract, rotatedTesseract, innerPrimary, innerRotated],
    false
  );

  mergedCompoundMega.computeVertexNormals();

  mergedCompoundMega.userData.isCompound = true;
  mergedCompoundMega.userData.isCpdTesseract = true;
  mergedCompoundMega.userData.baseType = 'BoxGeometry';
  mergedCompoundMega.userData.isMegaTesseract = true;
  mergedCompoundMega.userData.isCompoundMegaTesseract = true;
  mergedCompoundMega.userData.componentCount = 4;
  mergedCompoundMega.userData.variant = 'nested';

  if (cacheKey) geometryCache.set(cacheKey, mergedCompoundMega);

  return cloneWithUserData(mergedCompoundMega);
}

export const metadata = {
  name: 'cpd-megatesseract-2',
  displayName: '💎💎 Compound Mega-Tesseract II',
  category: 'polytopes',
  description: 'Layered mega tesseract with a scaled inner pair for nested depth',
  isCompound: true,
  isSuperCompound: true,
  isUltraCompound: true,
  defaultOptions: {},
};
