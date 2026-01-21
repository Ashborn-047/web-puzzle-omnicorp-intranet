/**
 * Game State Context
 * 
 * React context for managing game state across components.
 * Provides behavior tracking, progression, and Overseer integration.
 */

import React, { useReducer, useCallback } from 'react';
import { GameStateContext } from './context.js';
import { createBehaviorFlags, recordProfileAccess, recordDeletedMessageRead, recordRegionSwitch, recordTerminalCommand, recordAuditCompleted } from './behaviorFlags.js';
import { createProgressionState, triggerPasswordShift, recordClueFound, recordOverseerMessage } from './progression.js';
import { shouldRequirePassword } from '../access/passwordRules.js';
import { checkOverseerTrigger } from '../overseer/overseerTriggers.js';

// Initial state
const initialState = {
    behavior: createBehaviorFlags(),
    progression: createProgressionState(),
    previousBehavior: null,
    pendingOverseerMessage: null
};

// Action types
const ACTIONS = {
    ACCESS_PROFILE: 'ACCESS_PROFILE',
    READ_DELETED_MESSAGE: 'READ_DELETED_MESSAGE',
    SWITCH_REGION: 'SWITCH_REGION',
    RUN_TERMINAL_COMMAND: 'RUN_TERMINAL_COMMAND',
    COMPLETE_AUDIT: 'COMPLETE_AUDIT',
    FIND_CLUE: 'FIND_CLUE',
    SHOW_OVERSEER_MESSAGE: 'SHOW_OVERSEER_MESSAGE',
    DISMISS_OVERSEER_MESSAGE: 'DISMISS_OVERSEER_MESSAGE',
    RESET_GAME: 'RESET_GAME'
};

// Reducer
function gameStateReducer(state, action) {
    switch (action.type) {
        case ACTIONS.ACCESS_PROFILE: {
            const newBehavior = recordProfileAccess(state.behavior, action.payload);
            const shouldShift = shouldRequirePassword(newBehavior);
            const newProgression = shouldShift && !state.progression.passwordShiftTriggered
                ? triggerPasswordShift(state.progression)
                : state.progression;

            // Check for Overseer trigger
            const overseerCheck = checkOverseerTrigger(newBehavior, newProgression, state.behavior);

            return {
                ...state,
                previousBehavior: state.behavior,
                behavior: newBehavior,
                progression: newProgression,
                pendingOverseerMessage: overseerCheck.shouldTrigger ? overseerCheck.message : state.pendingOverseerMessage
            };
        }

        case ACTIONS.READ_DELETED_MESSAGE: {
            const newBehavior = recordDeletedMessageRead(state.behavior);
            const shouldShift = shouldRequirePassword(newBehavior);
            const newProgression = shouldShift && !state.progression.passwordShiftTriggered
                ? triggerPasswordShift(state.progression)
                : state.progression;

            return {
                ...state,
                previousBehavior: state.behavior,
                behavior: newBehavior,
                progression: newProgression
            };
        }

        case ACTIONS.SWITCH_REGION: {
            const newBehavior = recordRegionSwitch(state.behavior, action.payload);
            const shouldShift = shouldRequirePassword(newBehavior);
            const newProgression = shouldShift && !state.progression.passwordShiftTriggered
                ? triggerPasswordShift(state.progression)
                : state.progression;

            return {
                ...state,
                previousBehavior: state.behavior,
                behavior: newBehavior,
                progression: newProgression
            };
        }

        case ACTIONS.RUN_TERMINAL_COMMAND: {
            const newBehavior = recordTerminalCommand(state.behavior, action.payload);
            return {
                ...state,
                previousBehavior: state.behavior,
                behavior: newBehavior
            };
        }

        case ACTIONS.COMPLETE_AUDIT: {
            return {
                ...state,
                behavior: recordAuditCompleted(state.behavior)
            };
        }

        case ACTIONS.FIND_CLUE: {
            return {
                ...state,
                progression: recordClueFound(state.progression, action.payload)
            };
        }

        case ACTIONS.SHOW_OVERSEER_MESSAGE: {
            return {
                ...state,
                progression: recordOverseerMessage(state.progression, action.payload),
                pendingOverseerMessage: null
            };
        }

        case ACTIONS.DISMISS_OVERSEER_MESSAGE: {
            return {
                ...state,
                pendingOverseerMessage: null
            };
        }

        case ACTIONS.RESET_GAME: {
            return initialState;
        }

        default:
            return state;
    }
}

// Provider component
export function GameStateProvider({ children }) {
    const [state, dispatch] = useReducer(gameStateReducer, initialState);

    // Action creators
    const actions = {
        accessProfile: useCallback((profileId) => {
            dispatch({ type: ACTIONS.ACCESS_PROFILE, payload: profileId });
        }, []),

        readDeletedMessage: useCallback(() => {
            dispatch({ type: ACTIONS.READ_DELETED_MESSAGE });
        }, []),

        switchRegion: useCallback((region) => {
            dispatch({ type: ACTIONS.SWITCH_REGION, payload: region });
        }, []),

        runTerminalCommand: useCallback((command) => {
            dispatch({ type: ACTIONS.RUN_TERMINAL_COMMAND, payload: command });
        }, []),

        completeAudit: useCallback(() => {
            dispatch({ type: ACTIONS.COMPLETE_AUDIT });
        }, []),

        findClue: useCallback((clueType) => {
            dispatch({ type: ACTIONS.FIND_CLUE, payload: clueType });
        }, []),

        showOverseerMessage: useCallback((message) => {
            dispatch({ type: ACTIONS.SHOW_OVERSEER_MESSAGE, payload: message });
        }, []),

        dismissOverseerMessage: useCallback(() => {
            dispatch({ type: ACTIONS.DISMISS_OVERSEER_MESSAGE });
        }, []),

        resetGame: useCallback(() => {
            dispatch({ type: ACTIONS.RESET_GAME });
        }, [])
    };

    return (
        <GameStateContext.Provider value={{ state, actions }}>
            {children}
        </GameStateContext.Provider>
    );
}
