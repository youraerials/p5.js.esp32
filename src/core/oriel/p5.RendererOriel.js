/**
 * @module Rendering
 * @submodule Oriel
 * @for p5
 */

import p5 from '../main';

/**
 * Custom p5.js renderer for Oriel embedded system
 * Bypasses HTML Canvas and renders directly to Oriel.display API
 */
p5.RendererOriel = class extends p5.Renderer {
  constructor(elt, pInst, isMainCanvas) {
    super(elt, pInst, isMainCanvas);

    // Oriel display is 360x360
    this.width = 360;
    this.height = 360;

    // Drawing state
    this._drawingState = {
      fillEnabled: true,
      strokeEnabled: true,
      fillColor: '#FFFFFF',
      strokeColor: '#000000',
      strokeWeight: 1,
      textSize: 12,
      textAlign: 'left'
    };

    // p5.js checks these flags to determine if drawing should occur
    this._doFill = true;
    this._doStroke = true;

    // Drawing modes (p5.js expects these)
    this._ellipseMode = 'center';
    this._rectMode = 'corner';

    console.log('RendererOriel initialized for 360x360 display');
  }

  // Background
  background(...args) {
    const color = this._colorToHex(...args);
    Oriel.display.clearScreen(color);
  }

  // Circle
  circle(x, y, d) {
    const radius = Math.round(d / 2);

    if (this._drawingState.fillEnabled) {
      Oriel.display.drawFilledCircle(
        Math.round(x),
        Math.round(y),
        radius,
        this._drawingState.fillColor
      );
    }

    if (this._drawingState.strokeEnabled) {
      Oriel.display.drawCircle(
        Math.round(x),
        Math.round(y),
        radius,
        this._drawingState.strokeColor
      );
    }
  }

  // Ellipse (p5 passes an array: [x, y, w, h, detailX])
  ellipse(args) {
    const [x, y, w, h] = args;
    if (w === h) {
      this.circle(x, y, w);
    } else {
      // For non-circular ellipses, approximate with circle using average
      this.circle(x, y, (w + h) / 2);
    }
  }

  // Line
  line(x1, y1, x2, y2) {
    if (this._drawingState.strokeEnabled) {
      Oriel.display.drawLine(
        Math.round(x1),
        Math.round(y1),
        Math.round(x2),
        Math.round(y2),
        this._drawingState.strokeColor
      );
    }
  }

  // Rectangle (p5 passes an array: [x, y, w, h, tl, tr, br, bl])
  rect(args) {
    const x = args[0];
    const y = args[1];
    const w = args[2];
    const h = args[3];
    // Note: corner radii (args[4-7]) not supported

    if (this._drawingState.fillEnabled) {
      Oriel.display.drawFilledRect(
        Math.round(x),
        Math.round(y),
        Math.round(w),
        Math.round(h),
        this._drawingState.fillColor
      );
    }

    if (this._drawingState.strokeEnabled) {
      Oriel.display.drawRect(
        Math.round(x),
        Math.round(y),
        Math.round(w),
        Math.round(h),
        this._drawingState.strokeColor
      );
    }
  }

  // Triangle (p5 passes an array: [x1, y1, x2, y2, x3, y3])
  triangle(args) {
    const x1 = args[0];
    const y1 = args[1];
    const x2 = args[2];
    const y2 = args[3];
    const x3 = args[4];
    const y3 = args[5];

    if (this._drawingState.fillEnabled) {
      Oriel.display.drawFilledTriangle(
        Math.round(x1), Math.round(y1),
        Math.round(x2), Math.round(y2),
        Math.round(x3), Math.round(y3),
        this._drawingState.fillColor
      );
    }

    if (this._drawingState.strokeEnabled) {
      Oriel.display.drawTriangle(
        Math.round(x1), Math.round(y1),
        Math.round(x2), Math.round(y2),
        Math.round(x3), Math.round(y3),
        this._drawingState.strokeColor
      );
    }
  }

  // Text
  text(str, x, y) {
    // Convert P5.js pixel size to LovyanGFX scale factor (1x, 2x, 3x, etc.)
    // P5.js default font height is ~8px at size 1
    // Sizes: 12px->1x, 16px->2x, 24px->3x, 32px->4x
    const scaleFactor = Math.max(1, Math.round(this._drawingState.textSize / 8));

    Oriel.display.drawText(
      Math.round(x),
      Math.round(y),
      String(str),
      this._drawingState.fillColor,
      scaleFactor
    );
  }

  // Fill
  fill(...args) {
    this._drawingState.fillEnabled = true;
    this._doFill = true;
    this._drawingState.fillColor = this._colorToHex(...args);
  }

  // No fill
  noFill() {
    this._drawingState.fillEnabled = false;
    this._doFill = false;
  }

  // Stroke
  stroke(...args) {
    this._drawingState.strokeEnabled = true;
    this._doStroke = true;
    this._drawingState.strokeColor = this._colorToHex(...args);
  }

  // No stroke
  noStroke() {
    this._drawingState.strokeEnabled = false;
    this._doStroke = false;
  }

  // Stroke weight
  strokeWeight(weight) {
    this._drawingState.strokeWeight = weight;
  }

  // Text size
  textSize(size) {
    this._drawingState.textSize = size;
  }

  // Text align
  textAlign(align) {
    this._drawingState.textAlign = align;
  }

  // Helper: Convert color arguments to hex string
  _colorToHex(...args) {
    // If single argument and it's a string, return as-is
    if (args.length === 1 && typeof args[0] === 'string') {
      return args[0];
    }

    // If it's a p5.Color object
    if (args.length === 1 && args[0] && args[0].levels) {
      const r = Math.round(args[0].levels[0]);
      const g = Math.round(args[0].levels[1]);
      const b = Math.round(args[0].levels[2]);
      return '#' +
             r.toString(16).padStart(2, '0') +
             g.toString(16).padStart(2, '0') +
             b.toString(16).padStart(2, '0');
    }

    // Handle RGB arguments directly
    let r, g, b;
    if (args.length === 1) {
      // Grayscale
      r = g = b = Math.round(args[0]);
    } else if (args.length >= 3) {
      // RGB or RGBA
      r = Math.round(args[0]);
      g = Math.round(args[1]);
      b = Math.round(args[2]);
    } else {
      // Default to white
      r = g = b = 255;
    }

    return '#' +
           r.toString(16).padStart(2, '0') +
           g.toString(16).padStart(2, '0') +
           b.toString(16).padStart(2, '0');
  }

  // Resize (no-op for fixed display)
  resize(w, h) {
    // Oriel display is fixed at 360x360
    console.log('resize() called but Oriel display is fixed at 360x360');
  }

  // Clear (same as background)
  clear() {
    this.background(0);
  }

  // Transform methods (no-op stubs for 2D renderer without transforms)
  resetMatrix() {
    // No-op - we don't support transforms in this minimal renderer
  }

  applyMatrix() {
    // No-op - we don't support transforms in this minimal renderer
  }

  rotate() {
    // No-op - we don't support transforms in this minimal renderer
  }

  translate() {
    // No-op - we don't support transforms in this minimal renderer
  }

  scale() {
    // No-op - we don't support transforms in this minimal renderer
  }

  shearX() {
    // No-op - we don't support transforms in this minimal renderer
  }

  shearY() {
    // No-op - we don't support transforms in this minimal renderer
  }

  // Update method for 3D renderers (no-op for 2D)
  _update() {
    // No-op - not a 3D renderer
  }

  // Additional renderer properties that might be checked
  get isP3D() {
    return false; // We're a 2D renderer
  }
};
