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
8.  **Document in MDX:**
    *   Create a corresponding MDX file in `src/content/docs/reference/` (e.g., `src/content/docs/reference/my-component-name.mdx`).
    *   Document the component's usage, props (attributes), and provide examples, similar to `text-cursor.mdx`.

## Components to Transform (Initial Focus: TextAnimations)

-   [ ] `reactbits/TextAnimations/TextCursor` -> `src/js-components/text-animations/text-cursor.js` (Done - Example)
-   [ ] `reactbits/TextAnimations/FadeUp` -> `src/js-components/text-animations/fade-up.js`
-   [ ] `reactbits/TextAnimations/TextMask` -> `src/js-components/text-animations/text-mask.js`
-   [ ] ... (Add other components as needed)