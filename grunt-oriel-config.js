/**
 * Custom Grunt configuration for Oriel ESP32 build
 * Strips out unnecessary modules to reduce bundle size
 */

module.exports = {
  // Modules to include
  include: [
    "src/core/**/*.js", // Core p5.js functionality
    "src/color/**/*.js", // Color utilities
    "src/math/**/*.js", // Math utilities
    "src/typography/**/*.js", // Text rendering
    "src/utilities/**/*.js", // Helper functions
    "src/events/**/*.js", // Event system
    // Exclude: webgl, dom, io, image, sound
  ],

  // Build settings
  settings: {
    minify: true,
    sourceMaps: false,
    removeComments: true,
    target: "es5", // Better QuickJS compatibility
  },
};
