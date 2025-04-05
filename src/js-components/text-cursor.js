import { animate, stagger } from 'motion';

class TextCursor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    // Default properties
    this.text = '⚛️';
    this.delay = 0.01;
    this.spacing = 100;
    this.followMouseDirection = true;
    this.randomFloat = true;
    this.exitDuration = 0.5;
    this.removalInterval = 30;
    this.maxPoints = 5;
    
    // Internal state
    this.trail = [];
    this.idCounter = 0;
    this.lastMoveTime = Date.now();
    
    // Bind methods
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.removeTrailItems = this.removeTrailItems.bind(this);
  }
  
  static get observedAttributes() {
    return [
      'text',
      'delay',
      'spacing',
      'follow-mouse-direction',
      'random-float',
      'exit-duration',
      'removal-interval',
      'max-points'
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
      case 'spacing':
        this.spacing = parseInt(newValue, 10);
        break;
      case 'follow-mouse-direction':
        this.followMouseDirection = newValue !== 'false';
        break;
      case 'random-float':
        this.randomFloat = newValue !== 'false';
        break;
      case 'exit-duration':
        this.exitDuration = parseFloat(newValue);
        break;
      case 'removal-interval':
        this.removalInterval = parseInt(newValue, 10);
        this.setupRemovalInterval();
        break;
      case 'max-points':
        this.maxPoints = parseInt(newValue, 10);
        break;
    }
  }
  
  connectedCallback() {
    this.render();
    this.container = this.shadowRoot.querySelector('.text-cursor-container');
    this.inner = this.shadowRoot.querySelector('.text-cursor-inner');
    
    this.container.addEventListener('mousemove', this.handleMouseMove);
    this.setupRemovalInterval();
  }
  
  disconnectedCallback() {
    this.container.removeEventListener('mousemove', this.handleMouseMove);
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
  
  setupRemovalInterval() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    
    this.intervalId = setInterval(this.removeTrailItems, this.removalInterval);
  }
  
  handleMouseMove(e) {
    const rect = this.container.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    if (this.trail.length === 0) {
      this.addTrailItem(mouseX, mouseY, 0);
    } else {
      const last = this.trail[this.trail.length - 1];
      const dx = mouseX - last.x;
      const dy = mouseY - last.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance >= this.spacing) {
        let rawAngle = (Math.atan2(dy, dx) * 180) / Math.PI;
        if (rawAngle > 90) rawAngle -= 180;
        else if (rawAngle < -90) rawAngle += 180;
        
        const computedAngle = this.followMouseDirection ? rawAngle : 0;
        const steps = Math.floor(distance / this.spacing);
        
        for (let i = 1; i <= steps; i++) {
          const t = (this.spacing * i) / distance;
          const newX = last.x + dx * t;
          const newY = last.y + dy * t;
          this.addTrailItem(newX, newY, computedAngle);
        }
      }
    }
    
    this.lastMoveTime = Date.now();
  }
  
  addTrailItem(x, y, angle) {
    const randomX = this.randomFloat ? Math.random() * 10 - 5 : 0;
    const randomY = this.randomFloat ? Math.random() * 10 - 5 : 0;
    const randomRotate = this.randomFloat ? Math.random() * 10 - 5 : 0;
    
    const item = {
      id: this.idCounter++,
      x,
      y,
      angle,
      randomX,
      randomY,
      randomRotate,
      element: null
    };
    
    this.trail.push(item);
    
    if (this.trail.length > this.maxPoints) {
      const removed = this.trail.shift();
      if (removed.element) {
        this.animateItemExit(removed.element).then(() => {
          removed.element.remove();
        });
      }
    }
    
    this.renderTrailItem(item);
  }
  
  renderTrailItem(item) {
    const itemEl = document.createElement('div');
    itemEl.className = 'text-cursor-item';
    itemEl.textContent = this.text;
    itemEl.style.left = `${item.x}px`;
    itemEl.style.top = `${item.y}px`;
    
    this.inner.appendChild(itemEl);
    item.element = itemEl;
    
    // Initial animation
    animate(itemEl, {
      opacity: [0, 1],
      rotate: item.angle
    }, {
      duration: this.exitDuration,
      delay: this.delay,
      easing: 'ease-out'
    });
    
    if (this.randomFloat) {
      // Floating animation
      animate(itemEl, {
        x: [0, item.randomX, 0],
        y: [0, item.randomY, 0],
        rotate: [item.angle, item.angle + item.randomRotate, item.angle]
      }, {
        duration: 2,
        repeat: Infinity,
        easing: 'ease-in-out',
        direction: 'alternate'
      });
    }
  }
  
  animateItemExit(element) {
    return animate(element, {
      opacity: [1, 0],
      scale: [1, 0]
    }, {
      duration: this.exitDuration,
      easing: 'ease-out'
    }).finished;
  }
  
  removeTrailItems() {
    if (Date.now() - this.lastMoveTime > 100 && this.trail.length > 0) {
      const removed = this.trail.shift();
      if (removed.element) {
        this.animateItemExit(removed.element).then(() => {
          removed.element.remove();
        });
      }
    }
  }
  
  render() {
    this.shadowRoot.innerHTML = `
      <style>
        .text-cursor-container {
          width: 100%;
          height: 100%;
          position: relative;
        }
        
        .text-cursor-inner {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
        }
        
        .text-cursor-item {
          position: absolute;
          user-select: none;
          white-space: nowrap;
          font-size: 1.875rem; /* Equivalent to Tailwind's text-3xl */
        }
      </style>
      <div class="text-cursor-container">
        <div class="text-cursor-inner"></div>
      </div>
    `;
  }
}

if(!window.customElements.get('text-cursor')){
    window.customElements.define('text-cursor', TextCursor);
}