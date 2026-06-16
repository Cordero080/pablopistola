// Text scrambling utilities for button effects

const SCRAMBLE_CHARS = '!@#$%^&*()_+-={}[]|;:,.<>?/~`0123456789';

/**
 * Scrambles text by replacing characters with random symbols
 * @param {string} text - The text to scramble
 * @returns {string} - The scrambled text
 */
export const scrambleText = (text) => {
  return text
    .split('')
    .map((char) => {
      if (char === ' ') return ' ';
      return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
    })
    .join('');
};
