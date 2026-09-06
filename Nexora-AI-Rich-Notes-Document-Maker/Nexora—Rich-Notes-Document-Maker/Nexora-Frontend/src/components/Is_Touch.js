// touch.js
// Extremely robust touch detection module for Vue.js (or plain JS).
// Detects if the device is touch-first (true: prefer touch UI; false: prefer keyboard/mouse).
// Handles dynamic changes (e.g., detachable keyboards, flip modes, external inputs).
// Efficient: Uses media queries + passive event listeners. No polling, minimal DOM touches.
// Supports Vue reactivity if used as a composable.
// Browser support: Modern (ES6+), with fallbacks for older.

// Usage in Vue (Composition API):
// import { useTouchDetection } from './touch.js'
// const { isTouchFirst } = useTouchDetection()

// Plain JS usage:
// import { initTouchDetection } from './touch.js'
// const state = initTouchDetection((newValue) => console.log('Touch first:', newValue))
// state.isTouchFirst // current value

import { ref, onMounted, onUnmounted } from 'vue'


export function useTouchDetection() {
  if (typeof window === 'undefined') {
    // SSR fallback: assume non-touch (desktop) to avoid hydration mismatches
    return { isTouchFirst: ref(false) }
  }


  const isTouchFirst = ref(false)
  let mqlCoarse = null
  let mqlFine = null
  let lastInputType = 'unknown' // For dynamic override via events

  // Core check: Combines media queries for robustness
  const checkDevice = () => {
    const isCoarse = window.matchMedia('(pointer: coarse)').matches
    const isFine = window.matchMedia('(pointer: fine)').matches
    const hasTouchEvents = 'ontouchstart' in window
    const maxTouchPoints = navigator.maxTouchPoints || 0
    const canHover = window.matchMedia('(hover: hover)').matches

    // Robust logic:
    // - If coarse primary + touch capable: touch-first (phones/tablets)
    // - If fine primary + hover: keyboard/mouse preferred (laptops/desktops, even with touch)
    // - Fallback: If maxTouchPoints > 1 and no fine pointer, assume touch
    // - Override with lastInputType if detected
    let result = isCoarse || (hasTouchEvents && maxTouchPoints > 0 && !isFine)

    // Prefer keyboard if fine pointer or hover is available
    if (isFine || (canHover && maxTouchPoints <= 1)) {
      result = false
    }

    // Dynamic input override (after user interaction)
    if (lastInputType === 'mouse' || lastInputType === 'keyboard') {
      result = false
    } else if (lastInputType === 'touch') {
      result = true
    }

    isTouchFirst.value = result
  }

  // Passive listeners for input detection (runs once per type, very efficient)
  const detectInput = (type) => () => {
    if (lastInputType === 'unknown') {
      lastInputType = type
      checkDevice() // Re-check with override
    }
  }

  onMounted(() => {
    // Initial check
    checkDevice()

    // Media query listeners (efficient, fires only on change)
    mqlCoarse = window.matchMedia('(pointer: coarse)')
    mqlCoarse.addEventListener('change', checkDevice)

    mqlFine = window.matchMedia('(pointer: fine)')
    mqlFine.addEventListener('change', checkDevice)

    // Input event listeners (passive, once: true to run only first time)
    window.addEventListener('touchstart', detectInput('touch'), { passive: true, once: true })
    window.addEventListener('mousemove', detectInput('mouse'), { passive: true, once: true })
    window.addEventListener('keydown', detectInput('keyboard'), { passive: true, once: true })

    // Optional: Resize/orientation for hybrid devices (debounced for perf)
    let resizeTimeout
    const onResize = () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(checkDevice, 200) // Debounce 200ms
    }
    window.addEventListener('resize', onResize, { passive: true })
    window.addEventListener('orientationchange', onResize, { passive: true })
  })

  onUnmounted(() => {
    // Cleanup to prevent leaks (good practice, though rare in SPAs)
    if (mqlCoarse) mqlCoarse.removeEventListener('change', checkDevice)
    if (mqlFine) mqlFine.removeEventListener('change', checkDevice)
    // No need to remove once:true listeners
  })

  return { isTouchFirst }
}



export function waitForKeyboardClose(maxWait = 500) {
  new Promise(resolve => requestAnimationFrame(resolve)).then(() => { });
  return new Promise((resolve) => {
    let done = false;

    if (!document.activeElement || document.activeElement === document.body) {
      resolve();
      return;
    }

    // Force blur on whatever is focused
    if (document.activeElement && typeof document.activeElement.blur === "function") {
      document.activeElement.blur();
    }

    // Fallback timer
    const timer = setTimeout(() => {
      if (!done) {
        done = true;
        resolve(); // continue even if no blur event fired
      }
    }, maxWait);

    // Listen for blur/focusout
    document.addEventListener(
      "focusout",
      () => {
        if (!done) {
          clearTimeout(timer);
          done = true;
          resolve(); // continue once blur happens
        }
      },
      { once: true }
    );
  });
}