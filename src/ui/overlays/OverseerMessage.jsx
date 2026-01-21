/**
 * Overseer Message Overlay
 * 
 * Displays system-level observer messages.
 * Appears briefly, cannot be dismissed early.
 * Creates narrative pressure through minimalist presentation.
 */

import React, { useEffect, useState } from 'react';

/**
 * OverseerMessage component
 * 
 * Props:
 * - message: The message to display
 * - onComplete: Callback when message display completes
 */
export function OverseerMessage({ message, onComplete }) {
    const [phase, setPhase] = useState('entering'); // entering, visible, exiting

    useEffect(() => {
        if (!message) return;

        // Phase timing
        const timers = [];

        // Enter phase
        timers.push(setTimeout(() => setPhase('visible'), 500));

        // Exit phase
        timers.push(setTimeout(() => setPhase('exiting'), 3000));

        // Complete
        timers.push(setTimeout(() => {
            if (onComplete) onComplete();
        }, 3500));

        return () => timers.forEach(clearTimeout);
    }, [message, onComplete]);

    if (!message) return null;

    const opacityClass = {
        entering: 'opacity-0',
        visible: 'opacity-100',
        exiting: 'opacity-0'
    }[phase];

    return (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center pointer-events-none transition-opacity duration-500 ${opacityClass}`}>
            {/* Subtle background darkening */}
            <div className="absolute inset-0 bg-black/20" />

            {/* Message container */}
            <div className="relative bg-black/90 border border-red-900/50 px-12 py-8 max-w-lg">
                {/* Terminal-style cursor blink */}
                <div className="absolute top-3 left-3 w-2 h-2 bg-red-500 animate-pulse" />

                {/* Message */}
                <p className="text-red-500 font-mono text-lg tracking-wide text-center">
                    {message}
                </p>

                {/* Subtle identifier */}
                <p className="text-red-900 font-mono text-xs text-center mt-4 tracking-widest">
                    [OVERSEER]
                </p>
            </div>
        </div>
    );
}

export default OverseerMessage;
