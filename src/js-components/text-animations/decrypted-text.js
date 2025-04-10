/*
  Converted from React component to Web Component
  Original source: reactbits/TextAnimations/DecryptedText/DecryptedText.jsx
*/

class DecryptedText extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    // Default properties
    this.text = '';
    this.speed = 50;
    this.maxIterations = 10;
    this.sequential = false;
    this.revealDirection = 'start'; // 'start', 'end', 'center'
    this.useOriginalCharsOnly = false;
    this.characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+';
    this.animateOn = 'hover'; // 'hover', 'view'
    this.threshold = 0.1;
    this.rootMargin = '0px';
    
    // Internal state
    this.displayText = '';
    this.isHovering = false;
    this.isScrambling = false;
    this.revealedIndices = new Set();
    this.hasAnimated = false;
    this.observer = null;
    this.interval = null;
    this.currentIteration = 0;
  }
  
  static get observedAttributes() {
    return [
      'text',
      'speed',
      'max-iterations',
      'sequential',
      'reveal-direction',
      'use-original-chars-only',
      'characters',
      'animate-on',
      'threshold',
      'root-margin'
    ];
  }
  
  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case 'text':
        this.text = newValue;
        break;
      case 'speed':
        this.speed = parseInt(newValue, 10);
        break;
      case 'max-iterations':
        this.maxIterations = parseInt(newValue, 10);
        break;
      case 'sequential':
        this.sequential = newValue === 'true';
        break;
      case 'reveal-direction':
        this.revealDirection = newValue;
        break;
      case 'use-original-chars-only':
        this.useOriginalCharsOnly = newValue === 'true';
        break;
      case 'characters':
        this.characters = newValue;
        break;
      case 'animate-on':
        this.animateOn = newValue;
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
    this.setupEventListeners();
    this.updateContent();
    
    if (this.animateOn === 'view') {
      this.setupIntersectionObserver();
    }
  }
  
  disconnectedCallback() {
    this.removeEventListeners();
    
    if (this.observer) {
      this.observer.disconnect();
    }
    
    if (this.interval) {
      clearInterval(this.interval);
    }
  }
  
  setupIntersectionObserver() {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !this.hasAnimated) {
            this.isHovering = true;
            this.hasAnimated = true;
            this.startScrambling();
          }
        });
      },
      { 
        threshold: this.threshold,
        rootMargin: this.rootMargin
      }
    );
    
    this.observer.observe(this.shadowRoot.host);
  }
  
  setupEventListeners() {
    if (this.animateOn === 'hover') {
      const container = this.shadowRoot.querySelector('.decrypted-text-container');
      if (!container) return;
      
      container.addEventListener('mouseenter', this.handleMouseEnter.bind(this));
      container.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
    }
  }
  
  removeEventListeners() {
    if (this.animateOn === 'hover') {
      const container = this.shadowRoot.querySelector('.decrypted-text-container');
      if (!container) return;
      
      container.removeEventListener('mouseenter', this.handleMouseEnter.bind(this));
      container.removeEventListener('mouseleave', this.handleMouseLeave.bind(this));
    }
  }
  
  handleMouseEnter() {
    this.isHovering = true;
    this.startScrambling();
  }
  
  handleMouseLeave() {
    this.isHovering = false;
    this.resetScrambling();
  }
  
  updateContent() {
    this.displayText = this.text;
    this.renderText();
  }
  
  getNextIndex(revealedSet) {
    const textLength = this.text.length;
    switch (this.revealDirection) {
      case 'start':
        return revealedSet.size;
      case 'end':
        return textLength - 1 - revealedSet.size;
      case 'center': {
        const middle = Math.floor(textLength / 2);
        const offset = Math.floor(revealedSet.size / 2);
        const nextIndex = revealedSet.size % 2 === 0
          ? middle + offset
          : middle - offset - 1;
        
        if (nextIndex >= 0 && nextIndex < textLength && !revealedSet.has(nextIndex)) {
          return nextIndex;
        }
        
        for (let i = 0; i < textLength; i++) {
          if (!revealedSet.has(i)) return i;
        }
        return 0;
      }
      default:
        return revealedSet.size;
    }
  }
  
  shuffleText(originalText, currentRevealed) {
    const availableChars = this.useOriginalCharsOnly
      ? Array.from(new Set(originalText.split(''))).filter(char => char !== ' ')
      : this.characters.split('');
    
    if (this.useOriginalCharsOnly) {
      const positions = originalText.split('').map((char, i) => ({
        char,
        isSpace: char === ' ',
        index: i,
        isRevealed: currentRevealed.has(i)
      }));
      
      const nonSpaceChars = positions
        .filter(p => !p.isSpace && !p.isRevealed)
        .map(p => p.char);
      
      for (let i = nonSpaceChars.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [nonSpaceChars[i], nonSpaceChars[j]] = [nonSpaceChars[j], nonSpaceChars[i]];
      }
      
      let charIndex = 0;
      return positions
        .map(p => {
          if (p.isSpace) return ' ';
          if (p.isRevealed) return originalText[p.index];
          return nonSpaceChars[charIndex++];
        })
        .join('');
    } else {
      return originalText
        .split('')
        .map((char, i) => {
          if (char === ' ') return ' ';
          if (currentRevealed.has(i)) return originalText[i];
          return availableChars[Math.floor(Math.random() * availableChars.length)];
        })
        .join('');
    }
  }
  
  startScrambling() {
    this.isScrambling = true;
    this.currentIteration = 0;
    
    if (this.interval) {
      clearInterval(this.interval);
    }
    
    this.interval = setInterval(() => {
      if (this.sequential) {
        if (this.revealedIndices.size < this.text.length) {
          const nextIndex = this.getNextIndex(this.revealedIndices);
          this.revealedIndices.add(nextIndex);
          this.displayText = this.shuffleText(this.text, this.revealedIndices);
          this.renderText();
        } else {
          clearInterval(this.interval);
          this.isScrambling = false;
          this.renderText();
        }
      } else {
        this.displayText = this.shuffleText(this.text, this.revealedIndices);
        this.renderText();
        this.currentIteration++;
        
        if (this.currentIteration >= this.maxIterations) {
          clearInterval(this.interval);
          this.isScrambling = false;
          this.displayText = this.text;
          this.renderText();
        }
      }
    }, this.speed);
  }
  
  resetScrambling() {
    if (this.interval) {
      clearInterval(this.interval);
    }
    
    this.displayText = this.text;
    this.revealedIndices = new Set();
    this.isScrambling = false;
    this.renderText();
  }
  
  renderText() {
    const container = this.shadowRoot.querySelector('.decrypted-text-content');
    if (!container) return;
    
    // Clear previous content
    container.innerHTML = '';
    
    // Create spans for each character
    this.displayText.split('').forEach((char, index) => {
      const isRevealedOrDone = this.revealedIndices.has(index) || !this.isScrambling || !this.isHovering;
      
      const span = document.createElement('span');
      span.textContent = char;
      
      // Add appropriate classes
      let className = isRevealedOrDone ? 'revealed' : 'encrypted';
      if (char === ' ') {
        className += ' space';
      }
      span.className = className;
      
      container.appendChild(span);
    });
  }
  
  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
          text-align: left;
        }
        
        .decrypted-text-container {
          display: inline-block;
          white-space: pre-wrap;
          font-family: inherit;
          font-size: inherit;
          color: inherit;
          line-height: inherit;
          text-align: left;
        }
        
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0,0,0,0);
          border: 0;
        }
        
        .decrypted-text-content {
          display: inline-block;
          text-align: left;
        }
        
        .decrypted-text-content span {
          display: inline-block;
          width: 0.6em; /* Fixed width for each character */
          text-align: center;
        }
        
        .decrypted-text-content span.space {
          width: 0.3em; /* Smaller width for spaces */
        }
        
        .encrypted {
          color: var(--encrypted-color, #ff5252);
        }
        
        .revealed {
          color: inherit;
        }
      </style>
      <div class="decrypted-text-container">
        <span class="sr-only">${this.text}</span>
        <span class="decrypted-text-content" aria-hidden="true"></span>
      </div>
    `;
  }
}

if (!window.customElements.get('decrypted-text')) {
  window.customElements.define('decrypted-text', DecryptedText);
}
