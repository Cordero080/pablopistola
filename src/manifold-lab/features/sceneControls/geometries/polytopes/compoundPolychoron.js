// Compound Polychoron Geometry Generator
// This is a placeholder for the actual compound polychoron construction logic.
// Replace the geometry logic below with your specific polychoron algorithm.

import * as THREE from 'three';

/**
 * Create a compound polychoron geometry (customize as needed)
 * @param {Object} options - Options for the polychoron (size, detail, etc.)
 * @returns {THREE.BufferGeometry}
 */
export function createCompoundPolychoron(options = {}) {
  // Example: create a group of intersecting 4D polytopes projected to 3D
  // Replace this with your actual compound polychoron logic
  const group = new THREE.Group();

  // Example: add two tesseracts at different orientations
  const tesseract1 = new THREE.BoxGeometry(1, 1, 1);
  const tesseract2 = new THREE.BoxGeometry(1, 1, 1);
  tesseract2.rotateX(Math.PI / 4);
  tesseract2.rotateY(Math.PI / 4);

  const mesh1 = new THREE.Mesh(tesseract1);
  const mesh2 = new THREE.Mesh(tesseract2);
  group.add(mesh1);
  group.add(mesh2);

  // Merge geometries for a single BufferGeometry output
  const geometries = [mesh1.geometry, mesh2.geometry];
  const merged = THREE.BufferGeometryUtils.mergeBufferGeometries(geometries);
  merged.userData.isCompoundPolychoron = true;
  return merged;
}
