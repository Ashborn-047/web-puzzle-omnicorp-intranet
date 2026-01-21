/**
 * Game State Hooks
 * 
 * Custom hooks for accessing game state from any component.
 */

import { useContext } from 'react';
import { GameStateContext } from './context.js';

/**
 * Hook to use the full game state and actions
 */
export function useGameState() {
    const context = useContext(GameStateContext);
    if (!context) {
        throw new Error('useGameState must be used within a GameStateProvider');
    }
    return context;
}

/**
 * Hook to access only behavior flags
 */
export function useBehavior() {
    const { state } = useGameState();
    return state.behavior;
}

/**
 * Hook to access only progression state
 */
export function useProgression() {
    const { state } = useGameState();
    return state.progression;
}

/**
 * Hook to check current login mode (Normal or Password Shift)
 */
export function usePasswordMode() {
    const { state } = useGameState();
    return state.progression.loginMode;
}

/**
 * Hook to access the currently pending Overseer message
 */
export function usePendingOverseerMessage() {
    const { state } = useGameState();
    return state.pendingOverseerMessage;
}
