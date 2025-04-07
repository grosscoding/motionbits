/*
  Converted from React component to Web Component
  Original source: reactbits/TextAnimations/BlurText/BlurText.jsx
*/

import { animate, stagger } from 'motion';

class BlurText extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    // Default properties
    this.text = '';
    this.delay = 200;
    this.animateBy = 'words'; // 'words' or 'letters'
    this.direction = 'top'; // 'top' or 'bottom'
    this.threshold = 0.1;
    this.rootMargin = '0px';
    this.easing = 'cubic-bezier(0.215, 0.61, 0.355, 1)'; // easeOutCubic
    
    // Internal state
    this.elements = [];
    this.isInView = false;
    this.observer = null;
    this.animatedElements = [];
  }
  
  static get observedAttributes() {
    return [
      'text',
      'delay',
      'animate-by',
      'direction',
      'threshold',
      'root-margin',
      'easing'
    ];
  }
  
  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case 'text':
        this.text = newValue;
        break;
      case 'delay':
        this.delay = parseFloat(newValue);
        break;
      case 'animate-by':
        this.animateBy = newValue;
        break;
      case 'direction':
        this.direction = newValue;
        break;
      case 'threshold':
        this.threshold = parseFloat(newValue);
        break;
      case 'root-margin':
        this.rootMargin = newValue;
        break;
      case 'easing':
        this.easing = newValue;
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
  }
  
  setupIntersectionObserver() {
    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !this.isInView) {
          this.isInView = true;
          this.animateElements();
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
    const container = this.shadowRoot.querySelector('.blur-text-container');
    if (!container) return;
    
    // Clear previous content
    container.innerHTML = '';
    
    // Split text by words or letters
    this.elements = this.animateBy === 'words' 
      ? this.text.split(' ') 
      : this.text.split('');
    
    // Create spans for each element
    this.elements.forEach((element, index) => {
      const span = document.createElement('span');
      span.className = 'blur-text-element';
      
      // Handle spaces in word mode
      if (element === ' ') {
        span.innerHTML = '&nbsp;';
      } else {
        span.textContent = element;
      }
      
      // Add space after words in word mode
      if (this.animateBy === 'words' && index < this.elements.length - 1) {
        span.innerHTML += '&nbsp;';
      }
      
      container.appendChild(span);
      this.animatedElements.push(span);
    });
    
    // If already in view, animate immediately
    if (this.isInView) {
      this.animateElements();
    }
  }
  
  animateElements() {
    const elements = this.shadowRoot.querySelectorAll('.blur-text-element');
    if (!elements.length) return;
    
    // Define animation properties based on direction
    const initialY = this.direction === 'top' ? -50 : 50;
    const midY = this.direction === 'top' ? 5 : -5;
    
    // Animate each element individually with staggered delay
    elements.forEach((element, index) => {
      // Calculate staggered delay based on index
      const delay = index * this.delay;
      
      // Animate the element
      animate(element, {
        filter: ['blur(10px)', 'blur(5px)', 'blur(0px)'],
        opacity: [0, 0.5, 1],
        transform: [
          `translate3d(0,${initialY}px,0)`, 
          `translate3d(0,${midY}px,0)`, 
          'translate3d(0,0,0)'
        ]
      }, { 
        delay: delay,
        easing: this.easing,
        duration: 0.8
      });
    });
  }
  
  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
        }
        
        .blur-text-container {
          font-family: inherit;
          font-size: inherit;
          color: inherit;
          line-height: inherit;
        }
        
        .blur-text-element {
          display: inline-block;
          will-change: transform, filter, opacity;
        }
      </style>
      <p class="blur-text-container"></p>
    `;
  }
}

if (!window.customElements.get('blur-text')) {
  window.customElements.define('blur-text', BlurText);
}
