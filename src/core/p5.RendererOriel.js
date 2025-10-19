/**
 * @module Rendering
 * @submodule Rendering
 * @for p5
 */

/**
 * p5.RendererOriel
 * Custom renderer for Oriel ESP32-S3 embedded system
 *
 * This renderer replaces the standard Canvas2D renderer with direct
 * calls to the Oriel.display JavaScript API, enabling p5.js sketches
 * to run on embedded hardware without HTML canvas.
 */

import * as constants from './constants';
import p5 from './main';

/**
 * RendererOriel class
 * Main renderer for Oriel ESP32 platform
 */
p5.RendererOriel = class extends p5.Renderer {
  constructor(elt, pInst, isMainCanvas) {
    super(elt, pInst, isMainCanvas);

    // Renderer state
    this._drawingState = {
      fillColor: '#FFFFFF',
      strokeColor: '#000000',
      fillEnabled: true,
      strokeEnabled: true,
      strokeWeight: 1,
      textSize: 12,
      textFont: null,
      textAlign: constants.LEFT,
      textBaseline: constants.TOP,
      backgroundColor: '#000000'
    };

    // Screen dimensions (Oriel is 360x360)
    this.width = 360;
    this.height = 360;

    // Initialize display
    this._initDisplay();

    console.log('RendererOriel initialized');
    return this;
  }

  _initDisplay() {
    // Set reasonable backlight level
    if (typeof Oriel !== 'undefined' && Oriel.display) {
      Oriel.display.setBacklight(90);
    }
  }

  //////////////////////////////////////////////
  // BACKGROUND & CLEAR
  //////////////////////////////////////////////

  background(...args) {
    const color = this.color(...args);
    this._drawingState.backgroundColor = this._colorToHex(color);
    if (typeof Oriel !== 'undefined' && Oriel.display) {
      Oriel.display.clearScreen(this._drawingState.backgroundColor);
    }
  }

  clear() {
    this.background(0);
  }

  //////////////////////////////////////////////
  // COLOR STATE
  //////////////////////////////////////////////

  fill(...args) {
    const color = this.color(...args);
    this._drawingState.fillColor = this._colorToHex(color);
    this._drawingState.fillEnabled = true;
  }

  noFill() {
    this._drawingState.fillEnabled = false;
  }

  stroke(...args) {
    const color = this.color(...args);
    this._drawingState.strokeColor = this._colorToHex(color);
    this._drawingState.strokeEnabled = true;
  }

  noStroke() {
    this._drawingState.strokeEnabled = false;
  }

  strokeWeight(weight) {
    this._drawingState.strokeWeight = weight;
  }

  //////////////////////////////////////////////
  // 2D PRIMITIVES - POINT & LINE
  //////////////////////////////////////////////

  point(x, y) {
    if (!this._drawingState.strokeEnabled) return;

    // Draw a small circle or rectangle for the point
    const w = Math.max(1, this._drawingState.strokeWeight);
    if (typeof Oriel !== 'undefined' && Oriel.display) {
      if (w === 1) {
        // Single pixel - draw as 1x1 rect
        Oriel.display.drawRect(Math.round(x), Math.round(y), 1, 1, this._drawingState.strokeColor);
      } else {
        // Larger point
        Oriel.display.drawFilledCircle(
          Math.round(x),
          Math.round(y),
          Math.round(w / 2),
          this._drawingState.strokeColor
        );
      }
    }
  }

  line(x1, y1, x2, y2) {
    if (!this._drawingState.strokeEnabled) return;

    if (typeof Oriel !== 'undefined' && Oriel.display) {
      // For now, simple line drawing
      // TODO: Handle strokeWeight > 1 by drawing multiple lines or thick line
      Oriel.display.drawLine(
        Math.round(x1),
        Math.round(y1),
        Math.round(x2),
        Math.round(y2),
        this._drawingState.strokeColor
      );
    }
  }

  //////////////////////////////////////////////
  // 2D PRIMITIVES - RECTANGLES
  //////////////////////////////////////////////

  rect(x, y, w, h) {
    // Fill first, then stroke on top
    if (this._drawingState.fillEnabled && typeof Oriel !== 'undefined' && Oriel.display) {
      Oriel.display.drawFilledRect(
        Math.round(x),
        Math.round(y),
        Math.round(w),
        Math.round(h),
        this._drawingState.fillColor
      );
    }

    if (this._drawingState.strokeEnabled && typeof Oriel !== 'undefined' && Oriel.display) {
      Oriel.display.drawRect(
        Math.round(x),
        Math.round(y),
        Math.round(w),
        Math.round(h),
        this._drawingState.strokeColor
      );
    }
  }

  square(x, y, s) {
    return this.rect(x, y, s, s);
  }

  //////////////////////////////////////////////
  // 2D PRIMITIVES - ELLIPSE & CIRCLE
  //////////////////////////////////////////////

  ellipse(x, y, w, h) {
    // For now, treat as circle using average of w and h
    // TODO: Add true ellipse support if OrielGfx supports it
    const radius = Math.round((w + h) / 4);
    return this.circle(x, y, radius * 2);
  }

  circle(x, y, d) {
    const radius = Math.round(d / 2);

    if (this._drawingState.fillEnabled && typeof Oriel !== 'undefined' && Oriel.display) {
      Oriel.display.drawFilledCircle(
        Math.round(x),
        Math.round(y),
        radius,
        this._drawingState.fillColor
      );
    }

    if (this._drawingState.strokeEnabled && typeof Oriel !== 'undefined' && Oriel.display) {
      Oriel.display.drawCircle(
        Math.round(x),
        Math.round(y),
        radius,
        this._drawingState.strokeColor
      );
    }
  }

  //////////////////////////////////////////////
  // 2D PRIMITIVES - TRIANGLE
  //////////////////////////////////////////////

  triangle(x1, y1, x2, y2, x3, y3) {
    // Draw using line segments for now
    // TODO: Add filled triangle support when available
    if (this._drawingState.strokeEnabled && typeof Oriel !== 'undefined' && Oriel.display) {
      Oriel.display.drawLine(Math.round(x1), Math.round(y1), Math.round(x2), Math.round(y2), this._drawingState.strokeColor);
      Oriel.display.drawLine(Math.round(x2), Math.round(y2), Math.round(x3), Math.round(y3), this._drawingState.strokeColor);
      Oriel.display.drawLine(Math.round(x3), Math.round(y3), Math.round(x1), Math.round(y1), this._drawingState.strokeColor);
    }
  }

  //////////////////////////////////////////////
  // 2D PRIMITIVES - ARC
  //////////////////////////////////////////////

  arc(x, y, w, h, start, stop, mode) {
    // Simplified arc - draw as circle segment with lines
    // TODO: Implement proper arc drawing
    console.log('arc() not fully implemented yet');
  }

  //////////////////////////////////////////////
  // TYPOGRAPHY
  //////////////////////////////////////////////

  textSize(size) {
    this._drawingState.textSize = size;
  }

  textAlign(horizAlign, vertAlign) {
    if (horizAlign) {
      this._drawingState.textAlign = horizAlign;
    }
    if (vertAlign) {
      this._drawingState.textBaseline = vertAlign;
    }
  }

  text(str, x, y, maxWidth, maxHeight) {
    if (!this._drawingState.fillEnabled) return;

    const textStr = String(str);

    // Calculate text positioning based on alignment
    let drawX = x;
    let drawY = y;

    // Approximate text width (6 pixels per character for size 1)
    const charWidth = 6 * Math.max(1, Math.round(this._drawingState.textSize / 12));
    const textWidth = textStr.length * charWidth;

    if (this._drawingState.textAlign === constants.CENTER) {
      drawX = x - textWidth / 2;
    } else if (this._drawingState.textAlign === constants.RIGHT) {
      drawX = x - textWidth;
    }

    if (typeof Oriel !== 'undefined' && Oriel.display) {
      // Map textSize to Oriel size (1-4 scale)
      const orielSize = Math.max(1, Math.min(4, Math.round(this._drawingState.textSize / 12)));

      Oriel.display.drawText(
        Math.round(drawX),
        Math.round(drawY),
        textStr,
        this._drawingState.fillColor,
        orielSize
      );
    }
  }

  //////////////////////////////////////////////
  // DISPLAY REFRESH
  //////////////////////////////////////////////

  _refresh() {
    // Called at the end of each draw cycle
    if (typeof Oriel !== 'undefined' && Oriel.display) {
      Oriel.display.refreshDisplay();
    }
  }

  //////////////////////////////////////////////
  // HELPER METHODS
  //////////////////////////////////////////////

  /**
   * Convert p5.Color to hex string for Oriel
   */
  _colorToHex(color) {
    if (typeof color === 'string') {
      return color;
    }

    // Extract RGB values from p5.Color object
    const r = Math.round(color.levels[0]);
    const g = Math.round(color.levels[1]);
    const b = Math.round(color.levels[2]);

    // Convert to hex string
    return '#' +
      r.toString(16).padStart(2, '0') +
      g.toString(16).padStart(2, '0') +
      b.toString(16).padStart(2, '0');
  }

  /**
   * Reset renderer state
   */
  resetMatrix() {
    // No-op for now, transforms not implemented yet
  }

  push() {
    // Save state - implement when we add transforms
  }

  pop() {
    // Restore state - implement when we add transforms
  }
};

export default p5.RendererOriel;
