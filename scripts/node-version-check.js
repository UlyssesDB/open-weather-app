// This script overrides Next.js's Node.js version check
// It's executed before Next.js starts

// Mock the semver check
const originalSemver = require('semver');
const originalSatisfies = originalSemver.satisfies;

// Override the satisfies method to always return true for Node.js version checks
originalSemver.satisfies = function(version, range, options) {
  if (range.includes('>=') && range.includes('node')) {
    return true;
  }
  return originalSatisfies(version, range, options);
};

// Export the modified semver
module.exports = originalSemver;
