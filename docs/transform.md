# React to Web Component Transformation

This document outlines the process of transforming React components with Framer Motion animations into native Web Components using Motion Dev for animations. These Web Components will then be integrated into Astro components.

## Task

- Convert React components located in the `reactbits` directory.
- Start with components in `reactbits/TextAnimations`.
- Replace React/Framer Motion logic with native Web Component structure and Motion Dev animations.
- Integrate the resulting Web Components into Astro components (e.g., `src/components/*.astro`).
- Use `src/js-components/text-animations/text-cursor.js` and `src/components/text-cursor.astro` as a reference example.

## Process

1.  **Identify React Component:** Choose a React component from `reactbits/TextAnimations` (or other subdirectories later).
2.  **Analyze React Component:** Understand its structure (JSX), state management (if any), props, and Framer Motion animations.
3.  **Create Web Component Structure:**
    *   Create a new `.js` file in the corresponding `src/js-components/` subdirectory (e.g., `src/js-components/text-animations/`).
    *   Define a custom element class extending `HTMLElement`.
    *   Use the `connectedCallback` to set up the component's initial structure (Shadow DOM is recommended for encapsulation).
    *   Define attributes for props. Use `attributeChangedCallback` to react to changes.
4.  **Implement Animation with Motion Dev:**
    *   Import necessary functions from `motion`.
    *   Translate Framer Motion animations into Motion Dev's `animate`, `timeline`, or `stagger` functions within the Web Component's logic (often in `connectedCallback` or methods triggered by events/attribute changes).
5.  **Style the Component:** Add styles within the Shadow DOM using a `<style>` tag or link to an external stylesheet if necessary.
6.  **Register Custom Element:** Use `customElements.define('my-component-name', MyComponentClass);`
7.  **Integrate into Astro:**
    *   Create a corresponding Astro component in `src/components/` (e.g., `src/components/my-component-name.astro`).
    *   Import the Web Component's JavaScript file using a `<script>` tag *within* the Astro component.
    *   Use the custom element tag (e.g., `<my-component-name>`) in the Astro template, passing props as attributes. Ensure `client:only="lit"` or similar client-side directive is used if interaction is needed immediately on load, though for basic web components, just importing the script might be enough.
    *   Add a reload button to allow replaying animations. This can be implemented with a simple button that either:
        * Reloads the component by toggling its visibility
        * Calls a public method on the Web Component to reset and replay the animation
        * Example implementation:
        ```astro
        <div class="component-wrapper">
          <my-component-name id="my-component"></my-component-name>
          <button class="reload-btn" onclick="document.getElementById('my-component').remove(); setTimeout(() => document.querySelector('.component-wrapper').innerHTML += '<my-component-name id="my-component"></my-component-name>', 10);">Replay Animation</button>
        </div>
        ```
8.  **Document in MDX:**
    *   Create a corresponding MDX file in `src/content/docs/reference/` (e.g., `src/content/docs/reference/my-component-name.mdx`).
    *   Document the component's usage, props (attributes), and provide examples, similar to `text-cursor.mdx`.
    *   Make examples replayable by using the `ExampleWrapper` component:
        1. Import the ExampleWrapper component at the top of your MDX file:
        ```mdx
        ---
        title: Component Name
        description: Component description
        ---

        import { Card } from '@astrojs/starlight/components';
        import ExampleWrapper from '../../../components/ExampleWrapper.astro';
        ```

        2. Use the ExampleWrapper component to wrap your web component examples:
        ```mdx
        <ExampleWrapper id="example-unique-id">
          <my-component 
            prop1="value1"
            prop2="value2"
          ></my-component>
        </ExampleWrapper>
        ```

        3. For components that need a different height, you can specify it:
        ```mdx
        <ExampleWrapper id="example-taller" height="600px">
          <my-component></my-component>
        </ExampleWrapper>
        ```

        * Use unique IDs for each example on the page (e.g., `example-letters`, `example-bottom`)
        * Use kebab-case for attribute names in the web component (e.g., `animate-by` instead of `animateBy`)
        * Use the web component tag directly (e.g., `<blur-text>` instead of `<BlurText>`)
        * All attribute values should be strings (e.g., `delay="50"` instead of `delay={50}`)

## Components to Transform (Initial Focus: TextAnimations)

-   [x] `reactbits/TextAnimations/TextCursor` -> `src/js-components/text-animations/text-cursor.js` (Done - Example)
-   [x] `reactbits/TextAnimations/ASCIIText` -> `src/js-components/text-animations/ascii-text.js`
-   [x] `reactbits/TextAnimations/BlurText` -> `src/js-components/text-animations/blur-text.js`
-   [ ] `reactbits/TextAnimations/CircularText` -> `src/js-components/text-animations/circular-text.js`
-   [ ] `reactbits/TextAnimations/CountUp` -> `src/js-components/text-animations/count-up.js`
-   [ ] `reactbits/TextAnimations/DecryptedText` -> `src/js-components/text-animations/decrypted-text.js`
-   [ ] `reactbits/TextAnimations/FallingText` -> `src/js-components/text-animations/falling-text.js`
-   [ ] `reactbits/TextAnimations/FuzzyText` -> `src/js-components/text-animations/fuzzy-text.js`
-   [ ] `reactbits/TextAnimations/GlitchText` -> `src/js-components/text-animations/glitch-text.js`
-   [ ] `reactbits/TextAnimations/GradientText` -> `src/js-components/text-animations/gradient-text.js`
-   [ ] `reactbits/TextAnimations/PixelTrail` -> `src/js-components/text-animations/pixel-trail.js`
-   [ ] `reactbits/TextAnimations/RotatingText` -> `src/js-components/text-animations/rotating-text.js`
-   [ ] `reactbits/TextAnimations/ScrollFloat` -> `src/js-components/text-animations/scroll-float.js`
-   [ ] `reactbits/TextAnimations/ScrollReveal` -> `src/js-components/text-animations/scroll-reveal.js`
-   [ ] `reactbits/TextAnimations/ScrollVelocity` -> `src/js-components/text-animations/scroll-velocity.js`
-   [ ] `reactbits/TextAnimations/ShinyText` -> `src/js-components/text-animations/shiny-text.js`
-   [ ] `reactbits/TextAnimations/SplitText` -> `src/js-components/text-animations/split-text.js`
-   [ ] `reactbits/TextAnimations/TextPressure` -> `src/js-components/text-animations/text-pressure.js`
-   [ ] `reactbits/TextAnimations/TrueFocus` -> `src/js-components/text-animations/true-focus.js`
-   [ ] `reactbits/TextAnimations/VariableProximity` -> `src/js-components/text-animations/variable-proximity.js`