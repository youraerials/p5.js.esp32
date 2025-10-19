/**
 * @module Oriel
 * @submodule Integration
 * @for p5
 */

import p5 from '../main';

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
  console.log('Initializing p5.js with Oriel renderer (global mode)');

  // Store original createCanvas
  const originalCreateCanvas = p5.prototype.createCanvas;

  // Override createCanvas globally to use RendererOriel
  p5.prototype.createCanvas = function(w, h, renderer) {
    console.log('createCanvas called - using RendererOriel');

    // Create canvas element (dummy for compatibility)
    const canvas = document.createElement('canvas');
    canvas.width = 360;
    canvas.height = 360;

    // Create Oriel renderer
    const orielRenderer = new p5.RendererOriel(canvas, this, true);

    // Set as main renderer
    this._setProperty('_renderer', orielRenderer);
    this._setProperty('width', 360);
    this._setProperty('height', 360);

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

  console.log('p5.js initialized successfully in global mode');
}

/**
 * Update touch state from Oriel touch driver
 */
function updateTouchState() {
  if (typeof Oriel === 'undefined' || !Oriel.touch) {
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
      p5Instance._setProperty('pmouseX', p5Instance.mouseX || touchX);
      p5Instance._setProperty('pmouseY', p5Instance.mouseY || touchY);
      p5Instance._setProperty('mouseX', touchX);
      p5Instance._setProperty('mouseY', touchY);
      p5Instance._setProperty('mouseIsPressed', true);

      // Call mousePressed if touch just started
      if (!wasTouching && p5Instance.mousePressed) {
        p5Instance.mousePressed();
      }
    }
  } else {
    // Touch released
    if (wasTouching && p5Instance && p5Instance.mouseReleased) {
      p5Instance.mouseReleased();
    }

    isTouching = false;

    if (p5Instance) {
      p5Instance._setProperty('mouseIsPressed', false);
    }
  }
}

/**
 * Main event loop for p5.js on Oriel
 */
function p5OrielEventLoop() {
  console.log('Starting p5.js event loop');

  while (true) {
    const frameStart = Date.now();

    // Update touch input
    updateTouchState();

    // Call p5's redraw to trigger the draw cycle
    if (p5Instance && p5Instance.redraw) {
      try {
        p5Instance.redraw();
      } catch (e) {
        console.error('Error in redraw():', e);
      }
    }

    // Manually refresh display since we're managing our own loop
    // (The "automatic" refresh only works if using Oriel's render loop)
    if (typeof Oriel !== 'undefined' && Oriel.display && Oriel.display.refreshDisplay) {
      Oriel.display.refreshDisplay();
    }

    // Frame timing
    const frameEnd = Date.now();
    const frameTime = frameEnd - frameStart;
    const sleepTime = Math.max(1, targetFrameTime - frameTime);

    // Sleep to maintain frame rate
    Oriel.system.sleepMs(Math.round(sleepTime));

    lastFrameTime = frameTime;
  }
}

/**
 * Entry point called from user sketch
 */
globalThis.startP5Sketch = function() {
  console.log('startP5Sketch() called');

  // Gather user's sketch functions from global scope
  const sketch = {};

  if (typeof setup !== 'undefined') {
    sketch.setup = setup;
  }

  if (typeof draw !== 'undefined') {
    sketch.draw = draw;
  }

  if (typeof mousePressed !== 'undefined') {
    sketch.mousePressed = mousePressed;
  }

  if (typeof mouseReleased !== 'undefined') {
    sketch.mouseReleased = mouseReleased;
  }

  // Initialize p5.js
  initP5Oriel(sketch);

  // Start event loop
  p5OrielEventLoop();
};

console.log('Oriel p5.js integration loaded - startP5Sketch() is available');
