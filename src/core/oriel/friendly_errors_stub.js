/**
 * @module Core
 * @submodule Oriel
 * @for p5
 */

import p5 from '../main';

/**
 * Stubs for p5.js features not needed on embedded
 * Provides no-op implementations to keep the library working
 */

// Stub for _checkForUserDefinedFunctions (from FES)
p5._checkForUserDefinedFunctions = function() {
  // No-op on embedded - no friendly error checking
};

// Stub for _friendlyError (from FES)
p5._friendlyError = function(msg) {
  console.error('p5.js error:', msg);
};

// Stub for _validateParameters (from FES)
p5._validateParameters = function() {
  // No-op on embedded - no parameter validation
  return true;
};

// Stub for _setupPromisePreloads (from preload.js)
p5.prototype._setupPromisePreloads = function() {
  // No-op - we don't support promise-based preloading on embedded
  this._preloadCount = 0;
};

// Stub for helpers that might be needed
p5.prototype._promisePreloads = [];
p5.prototype._preloadMethods = {};

// Stub for registerMethod (used by p5 internally)
p5.prototype.registerMethod = function(name, fn) {
  if (!this._registeredMethods) {
    this._registeredMethods = {};
  }
  if (!this._registeredMethods[name]) {
    this._registeredMethods[name] = [];
  }
  this._registeredMethods[name].push(fn);
};

// Stub for callRegisteredHooksFor - always override to ensure it works
p5.prototype.callRegisteredHooksFor = function(name) {
  if (this._registeredMethods && this._registeredMethods[name]) {
    for (const fn of this._registeredMethods[name]) {
      fn.call(this);
    }
  }
};

// Stub event handlers (from events modules we're not including)
// These are called automatically by p5 constructor but we don't need them
// IMPORTANT: These MUST be defined or p5 constructor will fail
/* @__PURE__ */ p5.prototype._onmousemove = function(e) { /* no-op */ };
/* @__PURE__ */ p5.prototype._onmousedown = function(e) { /* no-op */ };
/* @__PURE__ */ p5.prototype._onmouseup = function(e) { /* no-op */ };
/* @__PURE__ */ p5.prototype._ondragend = function(e) { /* no-op */ };
/* @__PURE__ */ p5.prototype._ondragover = function(e) { /* no-op */ };
/* @__PURE__ */ p5.prototype._onclick = function(e) { /* no-op */ };
/* @__PURE__ */ p5.prototype._ondblclick = function(e) { /* no-op */ };
/* @__PURE__ */ p5.prototype._onmouseover = function(e) { /* no-op */ };
/* @__PURE__ */ p5.prototype._onmouseout = function(e) { /* no-op */ };
/* @__PURE__ */ p5.prototype._onkeydown = function(e) { /* no-op */ };
/* @__PURE__ */ p5.prototype._onkeyup = function(e) { /* no-op */ };
/* @__PURE__ */ p5.prototype._onkeypress = function(e) { /* no-op */ };
/* @__PURE__ */ p5.prototype._ontouchstart = function(e) { /* no-op */ };
/* @__PURE__ */ p5.prototype._ontouchmove = function(e) { /* no-op */ };
/* @__PURE__ */ p5.prototype._ontouchend = function(e) { /* no-op */ };
/* @__PURE__ */ p5.prototype._onblur = function(e) { /* no-op */ };
// _onresize is defined in environment.js which we include

// Stub for mouse coordinate updates (from events/mouse.js)
/* @__PURE__ */ p5.prototype._updateMouseCoords = function() { /* no-op */ };

// Stub for accessibility outputs (we don't support screen readers on embedded)
/* @__PURE__ */ p5.prototype._updateAccsOutput = function() { /* no-op */ };

// Mouse and keyboard state variables (normally from events modules)
p5.prototype.mouseX = 0;
p5.prototype.mouseY = 0;
p5.prototype.pmouseX = 0;
p5.prototype.pmouseY = 0;
p5.prototype.winMouseX = 0;
p5.prototype.winMouseY = 0;
p5.prototype.pwinMouseX = 0;
p5.prototype.pwinMouseY = 0;
p5.prototype.mouseButton = 0;
p5.prototype.mouseIsPressed = false;
p5.prototype.keyIsPressed = false;
p5.prototype.key = '';
p5.prototype.keyCode = 0;

// Transform method stubs (we don't support transforms on embedded)
/* @__PURE__ */ p5.prototype.resetMatrix = function() { /* no-op */ };
/* @__PURE__ */ p5.prototype.applyMatrix = function() { /* no-op */ };
/* @__PURE__ */ p5.prototype.rotate = function() { /* no-op */ };
/* @__PURE__ */ p5.prototype.rotateX = function() { /* no-op */ };
/* @__PURE__ */ p5.prototype.rotateY = function() { /* no-op */ };
/* @__PURE__ */ p5.prototype.rotateZ = function() { /* no-op */ };
/* @__PURE__ */ p5.prototype.translate = function() { /* no-op */ };
/* @__PURE__ */ p5.prototype.scale = function() { /* no-op */ };
/* @__PURE__ */ p5.prototype.shearX = function() { /* no-op */ };
/* @__PURE__ */ p5.prototype.shearY = function() { /* no-op */ };

// Disable friendly errors flag
p5.disableFriendlyErrors = true;

console.log('Core stubs loaded (FES, preloads, and events disabled for embedded)');
