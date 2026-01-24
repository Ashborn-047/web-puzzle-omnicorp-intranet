import React, { useRef, useEffect } from 'react';

/**
 * Act II Notepad - David Bowman's Scratchpad
 * ABSOLUTE RAW VERSION
 * 
 * Rules:
 * - Plain text only
 * - No bullet points
 * - No titles
 * - No timestamps
 * - No system styling
 * - No separators (---)
 */
const NotepadWidget = ({ notes }) => {
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [notes]);

    // If empty, just show a blank text area
    const content = (notes || []).join('\n\n');

    return (
        <div
            ref={scrollRef}
            className="p-6 font-mono text-[11px] text-slate-600 bg-white h-full overflow-y-auto whitespace-pre-wrap leading-relaxed no-scrollbar select-text"
            style={{
                outline: 'none',
                resize: 'none',
                scrollbarWidth: 'none'
            }}
        >
            {content}
        </div>
    );
};

export default NotepadWidget;
