/*
  Converted from React component to Web Component
  Original source: reactbits/TextAnimations/CircularText/CircularText.jsx
*/

import { animate } from 'motion';

class CircularText extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    // Default properties
    this.text = '';
    this.spinDuration = 20;
    this.onHover = 'speedUp'; // 'speedUp', 'slowDown', 'pause', 'goBonkers'
    this.threshold = 0.1;
    this.rootMargin = '0px';
    
    // Internal state
    this.currentRotation = 0;
    this.animationInstance = null;
    this.isHovering = false;
    this.observer = null;
    this.isInView = false;
    
    // Bind methods to preserve 'this' context
    this.handleHoverStart = this.handleHoverStart.bind(this);
    this.handleHoverEnd = this.handleHoverEnd.bind(this);
  }
  
  static get observedAttributes() {
    return [
      'text',
      'spin-duration',
      'on-hover',
      'threshold',
      'root-margin'
    ];
  }
  
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    
    switch (name) {
      case 'text':
        this.text = newValue;
        break;
      case 'spin-duration':
        this.spinDuration = parseFloat(newValue) || 20;
        break;
      case 'on-hover':
        this.onHover = newValue;
        break;
      case 'threshold':
        this.threshold = parseFloat(newValue) || 0.1;
        break;
      case 'root-margin':
        this.rootMargin = newValue;
        break;
    }
    
    this.updateContent();
  }
  
  connectedCallback() {
    this.render();
    this.setupIntersectionObserver();
    this.updateContent();
    this.setupEventListeners();
  }
  
  disconnectedCallback() {
    this.removeEventListeners();
    
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    
    if (this.animationInstance) {
      this.animationInstance.cancel();
      this.animationInstance = null;
    }
  }
  
  setupIntersectionObserver() {
    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !this.isInView) {
          this.isInView = true;
          this.startAnimation();
        }
      },
      { 
        threshold: this.threshold,
        rootMargin: this.rootMargin
      }
    );
    
    this.observer.observe(this.shadowRoot.host);
  }
  
  setupEventListeners() {
    const container = this.shadowRoot.querySelector('.circular-text');
    if (container) {
      container.addEventListener('mouseenter', this.handleHoverStart);
      container.addEventListener('mouseleave', this.handleHoverEnd);
    }
  }
  
  removeEventListeners() {
    const container = this.shadowRoot.querySelector('.circular-text');
    if (container) {
      container.removeEventListener('mouseenter', this.handleHoverStart);
      container.removeEventListener('mouseleave', this.handleHoverEnd);
    }
  }
  
  updateContent() {
    const container = this.shadowRoot.querySelector('.circular-text');
    if (!container) return;
    
    // Clear previous content
    container.innerHTML = '';
    
    // Create spans for each letter
    const letters = Array.from(this.text || '');
    if (letters.length === 0) return;
    
    letters.forEach((letter, i) => {
      const rotation = (360 / letters.length) * i;
      const factor = Number((Math.PI / letters.length).toFixed(0));
      const x = factor * i;
      const y = factor * i;
      const transform = `rotateZ(${rotation}deg) translate3d(${x}px, ${y}px, 0)`;
      
      const span = document.createElement('span');
      span.textContent = letter;
      span.style.transform = transform;
      span.style.WebkitTransform = transform;
      
      container.appendChild(span);
    });
    
    // If already in view, restart animation
    if (this.isInView) {
      this.startAnimation();
    }
  }
  
  startAnimation() {
    const container = this.shadowRoot.querySelector('.circular-text');
    if (!container) return;
    
    // Cancel any existing animation
    if (this.animationInstance) {
      this.animationInstance.cancel();
      this.animationInstance = null;
    }
    
    // Start the rotation animation - only animate rotation, handle scale separately
    this.animationInstance = animate(
      container,
      { rotate: [this.currentRotation, this.currentRotation + 360] },
      { 
        duration: this.spinDuration,
        easing: 'linear',
        repeat: Infinity,
        onUpdate: (latest) => {
          if (latest && typeof latest.rotate === 'number') {
            this.currentRotation = latest.rotate % 360;
          }
        }
      }
    );
    
    // Ensure scale is set to 1 initially
    container.style.transform = `scale(1) ${container.style.transform || ''}`;
    container.style.WebkitTransform = `scale(1) ${container.style.WebkitTransform || ''}`;
  }
  
  handleHoverStart() {
    if (!this.onHover || !this.isInView) return;
    
    this.isHovering = true;
    const container = this.shadowRoot.querySelector('.circular-text');
    if (!container) return;
    
    // Handle different hover behaviors without canceling the animation
    switch (this.onHover) {
      case 'slowDown':
        // Slow down animation by changing playback rate
        if (this.animationInstance) {
          this.animationInstance.playbackRate = 0.5; // Half speed
        }
        break;
        
      case 'speedUp':
        // Speed up animation by changing playback rate
        if (this.animationInstance) {
          this.animationInstance.playbackRate = 4.0; // 4x speed
        }
        break;
        
      case 'pause':
        // Pause animation by setting playback rate to 0
        if (this.animationInstance) {
          this.animationInstance.playbackRate = 0;
        }
        break;
        
      case 'goBonkers':
        // Very fast rotation and scale down
        if (this.animationInstance) {
          this.animationInstance.playbackRate = 20.0; // 20x speed
        }
        
        // Apply scale effect separately
        animate(
          container,
          { scale: 0.8 },
          { 
            duration: 0.3,
            easing: 'ease-out',
            fill: 'forwards' // Keep the scale until explicitly changed
          }
        );
        break;
        
      default:
        // Default behavior - normal speed
        if (this.animationInstance) {
          this.animationInstance.playbackRate = 1.0;
        }
        break;
    }
  }
  
  handleHoverEnd() {
    if (!this.isInView) return;
    
    this.isHovering = false;
    const container = this.shadowRoot.querySelector('.circular-text');
    if (!container) return;
    
    // Just reset the playback rate to normal without canceling the animation
    if (this.animationInstance) {
      this.animationInstance.playbackRate = 1.0;
    }
    
    // If it was the goBonkers mode, reset the scale
    if (this.onHover === 'goBonkers') {
      animate(
        container,
        { scale: 1.0 },
        { 
          duration: 0.3,
          easing: 'ease-out',
          fill: 'forwards'
        }
      );
    }
  }
  
  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
        }
        
        .circular-text {
          margin: 0 auto;
          border-radius: 50%;
          width: 200px;
          position: relative;
          height: 200px;
          font-weight: bold;
          color: inherit;
          font-weight: 900;
          text-align: center;
          cursor: pointer;
          transform-origin: 50% 50%;
          -webkit-transform-origin: 50% 50%;
        }
        
        .circular-text span {
          position: absolute;
          display: inline-block;
          left: 0;
          right: 0;
          top: 0;
          bottom: 0;
          font-size: 24px;
          transition: all 0.5s cubic-bezier(0, 0, 0, 1);
        }
      </style>
      <div class="circular-text"></div>
    `;
  }
}

if (!window.customElements.get('circular-text')) {
  window.customElements.define('circular-text', CircularText);
}
