// Minimal p5.js for Oriel embedded system
// Only includes core rendering primitives needed for basic sketches

// Core engine
import p5 from './core/main';
import './core/constants';
import './core/environment';
import './core/oriel/friendly_errors_stub';  // Must come before structure
import './core/structure';
import './core/p5.Element';
import './core/p5.Graphics';
import './core/p5.Renderer';
import './core/p5.Renderer2D';
import './core/rendering';
// Transform omitted - not supported on embedded (stubs in RendererOriel)

// Essential shape primitives only
import './core/shape/2d_primitives';
import './core/shape/attributes';

// Essential color support
import './color/creating_reading';
import './color/setting';

// Math utilities
import './math/calculation';
import './math/random';
import './math/noise';
import './math/trigonometry';

// Minimal typography
import './typography/attributes';
import './typography/loading_displaying';

// Oriel custom renderer and integration
import './core/oriel/p5.RendererOriel';
import './core/oriel/integration';

// Export
export default p5;
