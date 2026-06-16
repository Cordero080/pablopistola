// Showcase utility functions

export function getCardPosition(index) {
  const positions = ['center', 'left', 'right'];
  return positions[index % positions.length];
}
