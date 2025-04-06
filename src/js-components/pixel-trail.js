import * as THREE from 'three';

class PixelTrail extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    // Default properties
    this.gridSize = 40;
    this.trailSize = 0.1;
    this.maxAge = 250;
    this.interpolate = 5;
    this.color = '#ffffff';
    this.gooeyFilterEnabled = false;
    this.gooeyFilterId = 'goo-filter';
    this.gooeyFilterStrength = 10;
    
    // Internal state
    this.mouseTrailTexture = null;
    this.trailPositions = [];
    this.lastMousePosition = { x: 0, y: 0 };
    this.animationFrameId = null;
    
    // Bind methods
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.render = this.render.bind(this);
    this.animate = this.animate.bind(this);
    this.updateTrailTexture = this.updateTrailTexture.bind(this);
    this.initThree = this.initThree.bind(this);
  }
  
  static get observedAttributes() {
    return [
      'grid-size',
      'trail-size',
      'max-age',
      'interpolate',
      'color',
      'gooey-filter',
      'gooey-filter-id',
      'gooey-filter-strength'
    ];
  }
  
  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case 'grid-size':
        this.gridSize = parseInt(newValue, 10);
        if (this.dotMaterial) {
          this.dotMaterial.uniforms.gridSize.value = this.gridSize;
        }
        break;
      case 'trail-size':
        this.trailSize = parseFloat(newValue);
        break;
      case 'max-age':
        this.maxAge = parseInt(newValue, 10);
        break;
      case 'interpolate':
        this.interpolate = parseFloat(newValue);
        break;
      case 'color':
        this.color = newValue;
        if (this.dotMaterial) {
          this.dotMaterial.uniforms.pixelColor.value = new THREE.Color(this.color);
        }
        break;
      case 'gooey-filter':
        this.gooeyFilterEnabled = newValue !== 'false';
        this.updateGooeyFilter();
        break;
      case 'gooey-filter-id':
        this.gooeyFilterId = newValue;
        this.updateGooeyFilter();
        break;
      case 'gooey-filter-strength':
        this.gooeyFilterStrength = parseFloat(newValue);
        this.updateGooeyFilter();
        break;
    }
  }
  
  connectedCallback() {
    this.renderHTML();
    this.canvas = this.shadowRoot.querySelector('canvas');
    this.container = this.shadowRoot.querySelector('.pixel-trail-container');
    
    // Initialize Three.js
    this.initThree();
    
    // Add event listeners
    this.canvas.addEventListener('mousemove', this.handleMouseMove);
    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const mouseEvent = new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY
      });
      this.handleMouseMove(mouseEvent);
    });
    
    // Start animation loop
    this.animate();
  }
  
  disconnectedCallback() {
    this.canvas.removeEventListener('mousemove', this.handleMouseMove);
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    
    // Dispose of Three.js resources
    this.scene.dispose();
    this.renderer.dispose();
    this.dotMaterial.dispose();
    if (this.mouseTrailTexture) {
      this.mouseTrailTexture.dispose();
    }
  }
  
  renderHTML() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          position: relative;
          width: 100%;
          height: 100%;
        }
        
        .pixel-trail-container {
          width: 100%;
          height: 100%;
          position: relative;
          overflow: hidden;
        }
        
        canvas {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
        
        .goo-filter-container {
          position: absolute;
          overflow: hidden;
          z-index: 1;
        }
      </style>
      <div class="pixel-trail-container">
        ${this.gooeyFilterEnabled ? this.createGooeyFilterSVG() : ''}
        <canvas></canvas>
      </div>
    `;
  }
  
  createGooeyFilterSVG() {
    return `
      <svg class="goo-filter-container">
        <defs>
          <filter id="${this.gooeyFilterId}">
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation="${this.gooeyFilterStrength}"
              result="blur"
            />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>
    `;
  }
  
  updateGooeyFilter() {
    if (!this.container) return;
    
    const existingSVG = this.shadowRoot.querySelector('.goo-filter-container');
    if (existingSVG) {
      existingSVG.remove();
    }
    
    if (this.gooeyFilterEnabled) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = this.createGooeyFilterSVG();
      this.container.insertBefore(tempDiv.firstChild, this.canvas);
      
      if (this.canvas) {
        this.canvas.style.filter = `url(#${this.gooeyFilterId})`;
      }
    } else if (this.canvas) {
      this.canvas.style.filter = '';
    }
  }
  
  initThree() {
    // Create renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: false,
      alpha: true
    });
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    
    // Create scene
    this.scene = new THREE.Scene();
    
    // Create camera (orthographic for 2D effect)
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 1000);
    this.camera.position.z = 1;
    
    // Create trail texture
    this.createTrailTexture();
    
    // Create shader material
    this.dotMaterial = this.createDotMaterial();
    
    // Create mesh
    const geometry = new THREE.PlaneGeometry(2, 2);
    this.mesh = new THREE.Mesh(geometry, this.dotMaterial);
    this.scene.add(this.mesh);
    
    // Handle resize
    window.addEventListener('resize', () => {
      this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
      this.dotMaterial.uniforms.resolution.value.set(
        this.canvas.width,
        this.canvas.height
      );
    });
  }
  
  createTrailTexture() {
    const size = 512;
    const data = new Float32Array(size * size);
    this.mouseTrailTexture = new THREE.DataTexture(
      data,
      size,
      size,
      THREE.RedFormat,
      THREE.FloatType
    );
    this.mouseTrailTexture.needsUpdate = true;
    this.textureSize = size;
  }
  
  createDotMaterial() {
    const material = new THREE.ShaderMaterial({
      uniforms: {
        resolution: { value: new THREE.Vector2(this.canvas.width, this.canvas.height) },
        mouseTrail: { value: this.mouseTrailTexture },
        gridSize: { value: this.gridSize },
        pixelColor: { value: new THREE.Color(this.color) }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position.xy, 0.0, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec2 resolution;
        uniform sampler2D mouseTrail;
        uniform float gridSize;
        uniform vec3 pixelColor;
        varying vec2 vUv;

        vec2 coverUv(vec2 uv) {
          vec2 s = resolution.xy / max(resolution.x, resolution.y);
          vec2 newUv = (uv - 0.5) * s + 0.5;
          return clamp(newUv, 0.0, 1.0);
        }

        void main() {
          vec2 screenUv = gl_FragCoord.xy / resolution;
          vec2 uv = coverUv(screenUv);

          // Create a grid
          vec2 gridUv = fract(uv * gridSize);
          vec2 gridUvCenter = (floor(uv * gridSize) + 0.5) / gridSize;

          // Sample mouse trail
          float trail = texture2D(mouseTrail, gridUvCenter).r;

          // Use the pixelColor uniform and trail value for alpha
          gl_FragColor = vec4(pixelColor, trail);
        }
      `,
      transparent: true,
      depthTest: false,
    });
    
    return material;
  }
  
  handleMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = 1.0 - (e.clientY - rect.top) / rect.height; // Flip Y for WebGL
    
    this.trailPositions.push({
      x,
      y,
      age: 0
    });
    
    this.lastMousePosition = { x, y };
  }
  
  updateTrailTexture() {
    // Update ages and remove old positions
    this.trailPositions = this.trailPositions.filter(pos => {
      pos.age += 1;
      return pos.age < this.maxAge;
    });
    
    // Clear texture
    const size = this.textureSize;
    const data = new Float32Array(size * size);
    
    // Draw trail points
    for (const pos of this.trailPositions) {
      const strength = 1.0 - pos.age / this.maxAge;
      const radius = this.trailSize * strength;
      
      // Calculate pixel positions
      const centerX = Math.floor(pos.x * size);
      const centerY = Math.floor(pos.y * size);
      const radiusPixels = Math.max(1, Math.floor(radius * size));
      
      // Draw a circle
      for (let y = -radiusPixels; y <= radiusPixels; y++) {
        for (let x = -radiusPixels; x <= radiusPixels; x++) {
          const distance = Math.sqrt(x * x + y * y) / radiusPixels;
          if (distance <= 1.0) {
            const pixelStrength = strength * (1.0 - distance);
            const pixelX = centerX + x;
            const pixelY = centerY + y;
            
            if (pixelX >= 0 && pixelX < size && pixelY >= 0 && pixelY < size) {
              const index = pixelY * size + pixelX;
              // Use max to allow overlapping points to brighten
              data[index] = Math.max(data[index], pixelStrength);
            }
          }
        }
      }
    }
    
    // Update texture
    this.mouseTrailTexture.image.data = data;
    this.mouseTrailTexture.needsUpdate = true;
  }
  
  animate() {
    this.animationFrameId = requestAnimationFrame(this.animate);
    this.updateTrailTexture();
    this.renderer.render(this.scene, this.camera);
  }
}

if (!window.customElements.get('pixel-trail')) {
  window.customElements.define('pixel-trail', PixelTrail);
}

export default PixelTrail;
