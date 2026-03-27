// ── Backward compatibility bridge ──
// Thin wrapper re-exporting from Zustand store.
// Existing pages that import { useStore } from './store' will continue to work.

import { useStore, useAppStore } from './store/useStore'

// Dummy providers for backward compat (Zustand doesn't need providers)
function StoreProvider({ children }) {
  return children
}

export { useStore, useAppStore, StoreProvider }
