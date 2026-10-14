/**
 * @module Oriel
 * @submodule Integration
 * @for p5
 */

import p5 from "../main";

/**
 * Oriel Integration Layer
 * Manages p5.js lifecycle and touch input for Oriel embedded system
 */

let p5Instance = null;
let targetFrameTime = 1000 / 60; // 60 FPS target
let lastFrameTime = 0;

// Touch state
let touchX = 0;
let touchY = 0;
let isTouching = false;
let wasTouching = false;

/**
 * Initialize p5.js with user sketch and Oriel renderer
 */
function initP5Oriel(sketch) {
  console.log("Initializing p5.js with Oriel renderer (global mode)");

  // Store original createCanvas
  const originalCreateCanvas = p5.prototype.createCanvas;

  // Override createCanvas globally to use RendererOriel
  p5.prototype.createCanvas = function (w, h, renderer) {
    console.log("createCanvas called - using RendererOriel");

    // Create canvas element (dummy for compatibility)
    const canvas = document.createElement("canvas");
    canvas.width = 360;
    canvas.height = 360;

    // Create Oriel renderer
    const orielRenderer = new p5.RendererOriel(canvas, this, true);

    // Set as main renderer
    this._setProperty("_renderer", orielRenderer);
    this._setProperty("width", 360);
    this._setProperty("height", 360);

    return orielRenderer;
  };

  // Put sketch functions in global scope
  if (sketch.setup) {
    globalThis.setup = sketch.setup;
  }
  if (sketch.draw) {
    globalThis.draw = sketch.draw;
  }
  if (sketch.mousePressed) {
    globalThis.mousePressed = sketch.mousePressed;
  }
  if (sketch.mouseReleased) {
    globalThis.mouseReleased = sketch.mouseReleased;
  }

  // Create p5 instance in global mode (no parameter = global mode)
  p5Instance = new p5();

  // Disable p5's automatic draw loop - we manage it ourselves
  if (p5Instance.noLoop) {
    p5Instance.noLoop();
  }

  p5Instance._loop = false;
  p5Instance._requestAnimId = 0; // Disable animation frame tracking
  p5Instance._targetFrameRate = 30;
  p5Instance._lastFrameTime = 0;
  p5Instance.disableFriendlyErrors = true; // Skip error checking

  console.log("p5.js initialized successfully in global mode");
}

/**
 * Update touch state from Oriel touch driver
 */
function updateTouchState() {
  if (typeof Oriel === "undefined" || !Oriel.touch) {
    return;
  }

  wasTouching = isTouching;

  const touchData = Oriel.touch.read();
  if (touchData && touchData.active) {
    isTouching = true;
    touchX = touchData.x;
    touchY = touchData.y;

    // Update p5 mouse properties
    if (p5Instance) {
      p5Instance._setProperty("pmouseX", p5Instance.mouseX || touchX);
      p5Instance._setProperty("pmouseY", p5Instance.mouseY || touchY);
      p5Instance._setProperty("mouseX", touchX);
      p5Instance._setProperty("mouseY", touchY);
      p5Instance._setProperty("mouseIsPressed", true);
    }

    // Call mousePressed if touch just started (moved outside p5Instance check)
    if (!wasTouching) {
      // Debug logging
      console.log("Touch started at:", touchX, touchY);
      console.log("p5Instance exists:", !!p5Instance);
      console.log(
        "globalThis.mousePressed type:",
        typeof globalThis.mousePressed
      );

      // Make sure mouseX/mouseY are available globally for the user function
      globalThis.mouseX = touchX;
      globalThis.mouseY = touchY;
      globalThis.mouseIsPressed = true;

      // Call user's global mousePressed function if it exists
      if (typeof globalThis.mousePressed === "function") {
        console.log("Calling globalThis.mousePressed()");
        globalThis.mousePressed();
      } else {
        console.log("WARNING: globalThis.mousePressed is not a function!");
      }
    }
  } else {
    // Touch released
    if (wasTouching) {
      // Call user's global mouseReleased function if it exists
      if (typeof globalThis.mouseReleased === "function") {
        globalThis.mouseReleased();
      }
    }

    isTouching = false;

    if (p5Instance) {
      p5Instance._setProperty("mouseIsPressed", false);
    }
  }
}

/**
 * Entry point called from user sketch
 */
globalThis.startP5Sketch = function () {
  console.log(
    "startP5Sketch() called - using QuickJS render loop for optimal performance"
  );

  // Gather user's sketch functions from global scope BEFORE overwriting
  const sketch = {};

  if (typeof setup !== "undefined") {
    sketch.setup = setup;
  }

  if (typeof draw !== "undefined") {
    sketch.draw = draw;
  }

  if (typeof mousePressed !== "undefined") {
    sketch.mousePressed = mousePressed;
  }

  if (typeof mouseReleased !== "undefined") {
    sketch.mouseReleased = mouseReleased;
  }

  // Initialize p5.js
  initP5Oriel(sketch);

  // Store user's draw function for our event loop
  const userDraw = sketch.draw;

  // Create event loop function
  globalThis.p5EventLoop = function () {
    const frameStartTime = Date.now();

    // Update touch input before each frame
    updateTouchState();

    // Call user's draw via p5's redraw
    if (p5Instance && p5Instance.redraw) {
      try {
        p5Instance.redraw();
      } catch (e) {
        console.error("Error in p5 redraw():", e);
      }
    }

    // Flush display to screen
    Oriel.display.refreshDisplay();

    // Frame timing - target 30 FPS for stability
    const frameTime = Date.now() - frameStartTime;
    const targetFrameTime = 33; // ~30 FPS
    const sleepTime = Math.max(1, targetFrameTime - frameTime);

    Oriel.system.sleepMs(sleepTime);
  };

  console.log("P5.js initialized - event loop ready");
};

console.log("Oriel p5.js integration loaded - startP5Sketch() is available");
