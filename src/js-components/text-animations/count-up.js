/*
  Converted from React component to Web Component
  Original source: reactbits/TextAnimations/CountUp/CountUp.jsx
*/

import { animate, spring } from 'motion';

class CountUp extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    // Default properties
    this.from = 0;
    this.to = 100;
    this.direction = 'up';
    this.delay = 0;
    this.duration = 2;
    this.separator = '';
    this.threshold = 0.1;
    this.rootMargin = '0px';
    
    // Internal state
    this.observer = null;
    this.isInView = false;
    this.animationInstance = null;
    this.currentValue = 0;
  }
  
  static get observedAttributes() {
    return [
      'from',
      'to',
      'direction',
      'delay',
      'duration',
      'separator',
      'threshold',
      'root-margin'
    ];
  }
  
  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case 'from':
        this.from = parseFloat(newValue);
        break;
      case 'to':
        this.to = parseFloat(newValue);
        break;
      case 'direction':
        this.direction = newValue;
        break;
      case 'delay':
        this.delay = parseFloat(newValue);
        break;
      case 'duration':
        this.duration = parseFloat(newValue);
        break;
      case 'separator':
        this.separator = newValue;
        break;
      case 'threshold':
        this.threshold = parseFloat(newValue);
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
  }
  
  disconnectedCallback() {
    if (this.observer) {
      this.observer.disconnect();
    }
    if (this.animationInstance) {
      this.animationInstance.cancel();
    }
  }
  
  setupIntersectionObserver() {
    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !this.isInView) {
          this.isInView = true;
          this.startAnimation();
          this.observer.unobserve(this.shadowRoot.host);
        }
      },
      { 
        threshold: this.threshold,
        rootMargin: this.rootMargin
      }
    );
    
    this.observer.observe(this.shadowRoot.host);
  }
  
  updateContent() {
    const container = this.shadowRoot.querySelector('.count-up-container');
    if (!container) return;
    
    // Set initial value based on direction
    this.currentValue = this.direction === 'down' ? this.to : this.from;
    container.textContent = this.formatNumber(this.currentValue);
    
    // If already in view, restart animation
    if (this.isInView) {
      this.startAnimation();
    }
  }
  
  formatNumber(value) {
    const options = {
      useGrouping: !!this.separator,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    };
    
    const formattedNumber = Intl.NumberFormat('en-US', options).format(Number(value).toFixed(0));
    
    return this.separator
      ? formattedNumber.replace(/,/g, this.separator)
      : formattedNumber;
  }
  
  startAnimation() {
    const container = this.shadowRoot.querySelector('.count-up-container');
    if (!container) return;
    
    // Cancel any existing animation
    if (this.animationInstance) {
      this.animationInstance.cancel();
    }
    
    // Calculate damping and stiffness based on duration
    const damping = 20 + 40 * (1 / this.duration);
    const stiffness = 100 * (1 / this.duration);
    
    // Set start and end values based on direction
    const startValue = this.direction === 'down' ? this.to : this.from;
    const endValue = this.direction === 'down' ? this.from : this.to;
    
    // Create a delay if needed
    setTimeout(() => {
      // Start the animation
      this.animationInstance = animate(
        (progress) => {
          // Calculate the current value using spring physics
          const value = startValue + (endValue - startValue) * progress;
          this.currentValue = value;
          container.textContent = this.formatNumber(value);
        },
        { 
          duration: this.duration,
          easing: spring({ damping, stiffness })
        }
      );
    }, this.delay * 1000);
  }
  
  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
        }
        
        .count-up-container {
          font-family: inherit;
          font-size: inherit;
          color: inherit;
          line-height: inherit;
        }
      </style>
      <div class="count-up-container"></div>
    `;
  }
}

if (!window.customElements.get('count-up')) {
  window.customElements.define('count-up', CountUp);
}
