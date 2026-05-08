/**
 * Escape special regex characters in user input to prevent ReDoS attacks.
 * @param {string} str - Raw user input
 * @returns {string} Escaped string safe for use in RegExp / $regex
 */
const escapeRegex = (str) => {
    if (!str || typeof str !== 'string') return '';
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

module.exports = { escapeRegex };
