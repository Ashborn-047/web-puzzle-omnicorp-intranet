import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
    ZoomIn, ZoomOut, Maximize2, Play, Pause, RotateCcw,
    Layers, Filter, Info, X, ExternalLink, CornerDownRight,
    Edit3, Sparkles, Plus, Shield
} from 'lucide-react';

const TIER_COLORS = {
    'Protagonist': { base: '#ff9ec7', glow: 'rgba(255, 158, 199, 0.4)', text: '#3b2a5a' },
    'Main Target': { base: '#c9b6ff', glow: 'rgba(201, 182, 255, 0.4)', text: '#3b2a5a' },
    'Supporting': { base: '#ffd6e8', glow: 'rgba(255, 214, 232, 0.5)', text: '#3b2a5a' },
    'Background': { base: '#e4d4fc', glow: 'rgba(228, 212, 252, 0.4)', text: '#3b2a5a' },
    'Deceased / MIA': { base: '#ff85b8', glow: 'rgba(255, 133, 184, 0.4)', text: '#3b2a5a' },
    'Other': { base: '#c9b6ff', glow: 'rgba(201, 182, 255, 0.3)', text: '#3b2a5a' }
};

export default function ObsidianGraphView({
    characters,
    decisionLines,
    onEditCharacter,
    onAddDecisionLineFromChar
}) {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);

    // Camera / Viewport State
    const [camera, setCamera] = useState({ x: 0, y: 0, zoom: 1 });
    const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    // Physics & Interaction State
    const [isPhysicsRunning, setIsPhysicsRunning] = useState(true);
    const [selectedNodeId, setSelectedNodeId] = useState(null);
    const [hoveredNodeId, setHoveredNodeId] = useState(null);
    const [draggedNodeId, setDraggedNodeId] = useState(null);

    // Options
    const [showLabels, setShowLabels] = useState(true);
    const [showEdgeText, setShowEdgeText] = useState(false);
    const [filterDept, setFilterDept] = useState('ALL');

    // Simulation nodes & edges refs (to avoid re-renders on physics ticks)
    const simNodesRef = useRef([]);
    const simEdgesRef = useRef([]);
    const animFrameRef = useRef(null);

    // Initialize or update simulation nodes
    useEffect(() => {
        const savedPositions = JSON.parse(localStorage.getItem('omnicorp_graph_positions') || '{}');
        const width = containerRef.current?.clientWidth || 1000;
        const height = containerRef.current?.clientHeight || 700;
        const centerX = width / 2;
        const centerY = height / 2;

        simNodesRef.current = characters.map((c, i) => {
            const existing = simNodesRef.current.find(n => n.id === c.id);
            const saved = savedPositions[c.id];

            // Radial distribution if initial
            const angle = (i / characters.length) * 2 * Math.PI;
            const radius = 220 + (i % 2) * 80;

            const initX = saved ? saved.x : (existing ? existing.x : centerX + Math.cos(angle) * radius);
            const initY = saved ? saved.y : (existing ? existing.y : centerY + Math.sin(angle) * radius);

            return {
                id: c.id,
                name: c.name,
                badgeId: c.badgeId,
                tier: c.tier,
                dept: c.dept,
                title: c.title,
                clueHeld: c.clueHeld,
                radius: c.tier === 'Protagonist' ? 26 : (c.tier === 'Main Target' ? 22 : 18),
                x: initX,
                y: initY,
                vx: existing ? existing.vx : (Math.random() - 0.5) * 2,
                vy: existing ? existing.vy : (Math.random() - 0.5) * 2,
                pinned: !!saved
            };
        });

        simEdgesRef.current = decisionLines.map(dl => ({
            id: dl.id,
            source: dl.fromCharId,
            target: dl.toCharId,
            stepName: dl.stepName,
            clueDiscovered: dl.clueDiscovered,
            action: dl.investigationAction
        }));
    }, [characters, decisionLines]);

    // Save positions when node dragging ends
    const saveNodePositions = () => {
        const positions = {};
        simNodesRef.current.forEach(n => {
            positions[n.id] = { x: n.x, y: n.y };
        });
        localStorage.setItem('omnicorp_graph_positions', JSON.stringify(positions));
    };

    // Physics step
    const stepPhysics = useCallback(() => {
        if (!isPhysicsRunning && !draggedNodeId) return;

        const nodes = simNodesRef.current;
        const edges = simEdgesRef.current;
        const width = containerRef.current?.clientWidth || 1000;
        const height = containerRef.current?.clientHeight || 700;
        const centerX = width / 2;
        const centerY = height / 2;

        const kRepel = 2400; // Repulsion
        const kAttract = 0.04; // Spring attraction
        const damping = 0.85; // Velocity decay
        const kCenter = 0.005; // Pull towards center

        // 1. Repulsion between all node pairs
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const n1 = nodes[i];
                const n2 = nodes[j];
                const dx = n2.x - n1.x;
                const dy = n2.y - n1.y;
                const distSq = dx * dx + dy * dy || 1;
                const dist = Math.sqrt(distSq);

                if (dist < 450) {
                    const force = kRepel / distSq;
                    const fx = (dx / dist) * force;
                    const fy = (dy / dist) * force;

                    if (n1.id !== draggedNodeId && !n1.pinned) {
                        n1.vx -= fx;
                        n1.vy -= fy;
                    }
                    if (n2.id !== draggedNodeId && !n2.pinned) {
                        n2.vx += fx;
                        n2.vy += fy;
                    }
                }
            }
        }

        // 2. Attraction along decision edges
        edges.forEach(e => {
            const n1 = nodes.find(n => n.id === e.source);
            const n2 = nodes.find(n => n.id === e.target);
            if (!n1 || !n2) return;

            const dx = n2.x - n1.x;
            const dy = n2.y - n1.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const desiredDist = 160;

            const force = (dist - desiredDist) * kAttract;
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;

            if (n1.id !== draggedNodeId && !n1.pinned) {
                n1.vx += fx;
                n1.vy += fy;
            }
            if (n2.id !== draggedNodeId && !n2.pinned) {
                n2.vx -= fx;
                n2.vy -= fy;
            }
        });

        // 3. Center gravity & update positions
        nodes.forEach(n => {
            if (n.id === draggedNodeId || n.pinned) return;

            // Pull to center
            n.vx += (centerX - n.x) * kCenter;
            n.vy += (centerY - n.y) * kCenter;

            // Dampen
            n.vx *= damping;
            n.vy *= damping;

            // Clamp max speed
            const speed = Math.sqrt(n.vx * n.vx + n.vy * n.vy);
            if (speed > 8) {
                n.vx = (n.vx / speed) * 8;
                n.vy = (n.vy / speed) * 8;
            }

            n.x += n.vx;
            n.y += n.vy;
        });
    }, [isPhysicsRunning, draggedNodeId]);

    // Render loop
    const render = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        // Clear canvas with user's lavender mist
        ctx.fillStyle = '#f3e8ff';
        ctx.fillRect(0, 0, width, height);

        ctx.save();
        // Apply camera pan & zoom
        ctx.translate(camera.x, camera.y);
        ctx.scale(camera.zoom, camera.zoom);

        // 1. Draw subtle background grid dots in soft lilac #c9b6ff
        const gridSize = 40;
        const startX = -camera.x / camera.zoom - 100;
        const endX = (width - camera.x) / camera.zoom + 100;
        const startY = -camera.y / camera.zoom - 100;
        const endY = (height - camera.y) / camera.zoom + 100;

        ctx.fillStyle = 'rgba(201, 182, 255, 0.45)';
        for (let gx = Math.floor(startX / gridSize) * gridSize; gx < endX; gx += gridSize) {
            for (let gy = Math.floor(startY / gridSize) * gridSize; gy < endY; gy += gridSize) {
                ctx.fillRect(gx, gy, 2, 2);
            }
        }

        const nodes = simNodesRef.current;
        const edges = simEdgesRef.current;

        // Determine highlighted nodes based on hover or selection
        const activeNodeId = hoveredNodeId || selectedNodeId;
        const connectedNodeIds = new Set();
        if (activeNodeId) {
            connectedNodeIds.add(activeNodeId);
            edges.forEach(e => {
                if (e.source === activeNodeId) connectedNodeIds.add(e.target);
                if (e.target === activeNodeId) connectedNodeIds.add(e.source);
            });
        }

        // 2. Draw Edges (Decision Lines)
        edges.forEach(e => {
            const src = nodes.find(n => n.id === e.source);
            const tgt = nodes.find(n => n.id === e.target);
            if (!src || !tgt) return;

            // Department filter check
            if (filterDept !== 'ALL' && src.dept !== filterDept && tgt.dept !== filterDept) return;

            const isEdgeHighlighted = activeNodeId && (e.source === activeNodeId || e.target === activeNodeId);
            const isDimmed = activeNodeId && !isEdgeHighlighted;

            ctx.save();
            ctx.beginPath();
            ctx.moveTo(src.x, src.y);
            ctx.lineTo(tgt.x, tgt.y);

            if (isEdgeHighlighted) {
                ctx.strokeStyle = '#ff9ec7'; // bright pastel pink
                ctx.lineWidth = 3;
                ctx.shadowColor = 'rgba(255, 158, 199, 0.6)';
                ctx.shadowBlur = 8;
            } else if (isDimmed) {
                ctx.strokeStyle = 'rgba(201, 182, 255, 0.25)';
                ctx.lineWidth = 1;
            } else {
                ctx.strokeStyle = '#c9b6ff'; // soft lilac
                ctx.lineWidth = 1.8;
            }
            ctx.stroke();

            // Arrow head
            const dx = tgt.x - src.x;
            const dy = tgt.y - src.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 20) {
                const nx = dx / dist;
                const ny = dy / dist;
                const arrowDist = dist - tgt.radius - 4;
                const ax = src.x + nx * arrowDist;
                const ay = src.y + ny * arrowDist;

                const arrowLen = 8;
                ctx.fillStyle = isEdgeHighlighted ? '#ff9ec7' : (isDimmed ? 'rgba(201, 182, 255, 0.3)' : '#b49cf5');
                ctx.beginPath();
                ctx.moveTo(ax, ay);
                ctx.lineTo(ax - nx * arrowLen - ny * (arrowLen * 0.6), ay - ny * arrowLen + nx * (arrowLen * 0.6));
                ctx.lineTo(ax - nx * arrowLen + ny * (arrowLen * 0.6), ay - ny * arrowLen - nx * (arrowLen * 0.6));
                ctx.closePath();
                ctx.fill();
            }

            // Optional Edge label
            if (showEdgeText || isEdgeHighlighted) {
                const midX = (src.x + tgt.x) / 2;
                const midY = (src.y + tgt.y) / 2;
                ctx.font = 'bold 10px monospace';
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 3;
                ctx.strokeText(e.stepName || 'clue trail', midX, midY - 6);
                ctx.fillStyle = '#3b2a5a';
                ctx.textAlign = 'center';
                ctx.fillText(e.stepName || 'clue trail', midX, midY - 6);
            }

            ctx.restore();
        });

        // 3. Draw Nodes (Characters)
        nodes.forEach(n => {
            // Filter check
            const isDeptMatch = filterDept === 'ALL' || n.dept === filterDept;
            const isNodeActive = connectedNodeIds.has(n.id);
            const isDimmed = activeNodeId && !isNodeActive;

            const tierStyle = TIER_COLORS[n.tier] || TIER_COLORS['Other'];

            ctx.save();

            // Glow ring for highlighted or selected node
            if (n.id === selectedNodeId || n.id === hoveredNodeId) {
                ctx.beginPath();
                ctx.arc(n.x, n.y, n.radius + 6, 0, Math.PI * 2);
                ctx.strokeStyle = '#ff9ec7';
                ctx.lineWidth = 2.5;
                ctx.shadowColor = '#ff9ec7';
                ctx.shadowBlur = 12;
                ctx.stroke();
            }

            // Outer subtle halo
            ctx.beginPath();
            ctx.arc(n.x, n.y, n.radius + 3, 0, Math.PI * 2);
            ctx.fillStyle = isDimmed ? 'transparent' : tierStyle.glow;
            ctx.fill();

            // Main node circle
            ctx.beginPath();
            ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
            ctx.fillStyle = isDimmed ? 'rgba(235, 225, 255, 0.7)' : (isDeptMatch ? tierStyle.base : 'rgba(201, 182, 255, 0.7)');
            ctx.fill();

            // Inner core dot
            ctx.beginPath();
            ctx.arc(n.x, n.y, n.radius * 0.35, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();

            // Border
            ctx.strokeStyle = isDimmed ? 'rgba(201, 182, 255, 0.6)' : '#3b2a5a';
            ctx.lineWidth = 1.8;
            ctx.stroke();

            // Text Label
            if (showLabels) {
                ctx.font = `${n.tier === 'Protagonist' ? 'bold 12px' : 'bold 11px'} system-ui, sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'top';

                // Crisp white halo stroke for crystal clarity
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 3.5;
                ctx.strokeText(n.name, n.x, n.y + n.radius + 4);

                ctx.fillStyle = isDimmed ? 'rgba(59, 42, 90, 0.4)' : '#3b2a5a';
                ctx.fillText(n.name, n.x, n.y + n.radius + 4);

                // Department pill text
                ctx.font = 'bold 9px monospace';
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2.5;
                ctx.strokeText(`[${n.badgeId}] ${n.dept.split(' - ')[0]}`, n.x, n.y + n.radius + 18);

                ctx.fillStyle = isDimmed ? 'rgba(59, 42, 90, 0.4)' : 'rgba(59, 42, 90, 0.8)';
                ctx.fillText(`[${n.badgeId}] ${n.dept.split(' - ')[0]}`, n.x, n.y + n.radius + 18);
            }

            ctx.restore();
        });

        ctx.restore();
    }, [camera, hoveredNodeId, selectedNodeId, showLabels, showEdgeText, filterDept]);

    // Animation & physics loop
    useEffect(() => {
        const loop = () => {
            stepPhysics();
            render();
            animFrameRef.current = requestAnimationFrame(loop);
        };
        animFrameRef.current = requestAnimationFrame(loop);

        return () => {
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        };
    }, [stepPhysics, render]);

    // Canvas resize observer
    useEffect(() => {
        const handleResize = () => {
            if (canvasRef.current && containerRef.current) {
                canvasRef.current.width = containerRef.current.clientWidth;
                canvasRef.current.height = containerRef.current.clientHeight;
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Screen to world coordinates
    const toWorldCoords = (screenX, screenY) => {
        return {
            x: (screenX - camera.x) / camera.zoom,
            y: (screenY - camera.y) / camera.zoom
        };
    };

    // Find node at screen position
    const getNodeAtPos = (screenX, screenY) => {
        const world = toWorldCoords(screenX, screenY);
        return simNodesRef.current.find(n => {
            const dx = n.x - world.x;
            const dy = n.y - world.y;
            return Math.sqrt(dx * dx + dy * dy) <= n.radius + 6;
        });
    };

    // Mouse handlers
    const handleMouseDown = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const hitNode = getNodeAtPos(mouseX, mouseY);
        if (hitNode) {
            setDraggedNodeId(hitNode.id);
            hitNode.pinned = true;
        } else {
            setIsDraggingCanvas(true);
            setDragStart({ x: mouseX - camera.x, y: mouseY - camera.y });
        }
    };

    const handleMouseMove = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        if (draggedNodeId) {
            const world = toWorldCoords(mouseX, mouseY);
            const node = simNodesRef.current.find(n => n.id === draggedNodeId);
            if (node) {
                node.x = world.x;
                node.y = world.y;
                node.vx = 0;
                node.vy = 0;
            }
        } else if (isDraggingCanvas) {
            setCamera(prev => ({
                ...prev,
                x: mouseX - dragStart.x,
                y: mouseY - dragStart.y
            }));
        } else {
            // Hover check
            const hitNode = getNodeAtPos(mouseX, mouseY);
            setHoveredNodeId(hitNode ? hitNode.id : null);
        }
    };

    const handleMouseUp = () => {
        if (draggedNodeId) {
            saveNodePositions();
            setDraggedNodeId(null);
        }
        setIsDraggingCanvas(false);
    };

    const handleClick = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const hitNode = getNodeAtPos(mouseX, mouseY);
        if (hitNode) {
            setSelectedNodeId(prev => prev === hitNode.id ? null : hitNode.id);
        } else {
            setSelectedNodeId(null);
        }
    };

    // Zoom on wheel
    const handleWheel = (e) => {
        e.preventDefault();
        const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
        const rect = canvasRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        setCamera(prev => {
            const newZoom = Math.min(Math.max(prev.zoom * zoomFactor, 0.3), 3.0);
            return {
                zoom: newZoom,
                x: mouseX - (mouseX - prev.x) * (newZoom / prev.zoom),
                y: mouseY - (mouseY - prev.y) * (newZoom / prev.zoom)
            };
        });
    };

    // Reset camera to center
    const handleResetView = () => {
        if (!containerRef.current) return;
        setCamera({
            x: 0,
            y: 0,
            zoom: 1
        });
    };

    // Selected Character Info
    const selectedChar = characters.find(c => c.id === selectedNodeId);
    const selectedIncoming = decisionLines.filter(dl => dl.toCharId === selectedNodeId);
    const selectedOutgoing = decisionLines.filter(dl => dl.fromCharId === selectedNodeId);

    return (
        <div ref={containerRef} className="flex-1 w-full h-full relative overflow-hidden bg-[#f3e8ff] select-none">
            {/* CANVAS */}
            <canvas
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onClick={handleClick}
                onWheel={handleWheel}
                className="w-full h-full cursor-grab active:cursor-grabbing block"
            />

            {/* TOP CONTROLS BAR */}
            <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2 bg-white/95 backdrop-blur-md p-2 rounded-2xl border border-[#c9b6ff] shadow-[0_4px_16px_rgba(59,42,90,0.08),inset_0_1px_0_rgba(255,255,255,1)]">
                {/* Zoom Controls */}
                <div className="flex items-center gap-1 border-r border-[#c9b6ff]/60 pr-2">
                    <button
                        onClick={() => setCamera(prev => ({ ...prev, zoom: Math.min(prev.zoom * 1.2, 3.0) }))}
                        className="p-1.5 hover:bg-[#ffd6e8]/40 text-[#3b2a5a] rounded-xl transition-colors"
                        title="Zoom In"
                    >
                        <ZoomIn size={16} />
                    </button>
                    <button
                        onClick={() => setCamera(prev => ({ ...prev, zoom: Math.max(prev.zoom * 0.8, 0.3) }))}
                        className="p-1.5 hover:bg-[#ffd6e8]/40 text-[#3b2a5a] rounded-xl transition-colors"
                        title="Zoom Out"
                    >
                        <ZoomOut size={16} />
                    </button>
                    <button
                        onClick={handleResetView}
                        className="p-1.5 hover:bg-[#ffd6e8]/40 text-[#3b2a5a] rounded-xl transition-colors"
                        title="Reset View"
                    >
                        <Maximize2 size={16} />
                    </button>
                </div>

                {/* Physics Toggle */}
                <button
                    onClick={() => setIsPhysicsRunning(!isPhysicsRunning)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${isPhysicsRunning ? 'bg-[#ffd6e8] text-[#3b2a5a] border-[#ff9ec7] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]' : 'bg-white text-[#3b2a5a]/70 border-[#c9b6ff]'}`}
                    title={isPhysicsRunning ? 'Pause Force Simulation' : 'Run Force Simulation'}
                >
                    {isPhysicsRunning ? <Pause size={12} /> : <Play size={12} />}
                    Physics
                </button>

                {/* Labels Toggle */}
                <button
                    onClick={() => setShowLabels(!showLabels)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${showLabels ? 'bg-[#ffd6e8] text-[#3b2a5a] border-[#ff9ec7] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]' : 'bg-white text-[#3b2a5a]/70 border-[#c9b6ff]'}`}
                >
                    Labels
                </button>

                {/* Edge Text Toggle */}
                <button
                    onClick={() => setShowEdgeText(!showEdgeText)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${showEdgeText ? 'bg-[#ffd6e8] text-[#3b2a5a] border-[#ff9ec7] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]' : 'bg-white text-[#3b2a5a]/70 border-[#c9b6ff]'}`}
                >
                    Edge Clues
                </button>

                {/* Department Filter */}
                <select
                    value={filterDept}
                    onChange={e => setFilterDept(e.target.value)}
                    className="bg-white border border-[#c9b6ff] rounded-xl px-2.5 py-1.5 text-xs text-[#3b2a5a] font-medium focus:outline-none focus:border-[#ff9ec7] shadow-[0_1px_2px_rgba(59,42,90,0.03)]"
                >
                    <option value="ALL">All Departments</option>
                    {Array.from(new Set(characters.map(c => c.dept))).map(d => (
                        <option key={d} value={d}>{d}</option>
                    ))}
                </select>
            </div>

            {/* TOP RIGHT LEGEND */}
            <div className="absolute top-4 right-4 z-20 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-[#c9b6ff] text-[11px] shadow-[0_4px_16px_rgba(59,42,90,0.08),inset_0_1px_0_rgba(255,255,255,1)] pointer-events-none md:pointer-events-auto">
                <span className="text-[10px] uppercase font-mono font-bold text-[#3b2a5a] block mb-2">Narrative Tiers</span>
                <div className="space-y-1.5">
                    {Object.entries(TIER_COLORS).map(([tier, style]) => (
                        <div key={tier} className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full shadow-sm border border-[#3b2a5a]/30" style={{ backgroundColor: style.base }}></span>
                            <span className="text-[#3b2a5a] font-bold">{tier}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* BOTTOM HINT */}
            <div className="absolute bottom-4 left-4 z-20 bg-white/90 backdrop-blur-sm px-3.5 py-1.5 rounded-xl border border-[#c9b6ff] text-[10px] text-[#3b2a5a]/80 pointer-events-none font-mono shadow-md font-semibold">
                🖱️ Drag node to reposition • Drag background to pan • Scroll to zoom • Click node to inspect dossier
            </div>

            {/* INSPECTION SIDE DRAWER */}
            {selectedChar && (
                <div className="absolute top-0 right-0 bottom-0 w-80 md:w-96 bg-white/95 backdrop-blur-xl border-l border-[#c9b6ff] z-30 flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
                    <div className="p-4 border-b border-[#c9b6ff] flex items-center justify-between bg-[#f3e8ff]/50">
                        <div className="flex items-center gap-2">
                            <span
                                className="w-3.5 h-3.5 rounded-full shadow-sm border border-[#3b2a5a]/30"
                                style={{ backgroundColor: TIER_COLORS[selectedChar.tier]?.base || '#ff9ec7' }}
                            ></span>
                            <h3 className="font-bold text-[#3b2a5a] text-sm">{selectedChar.name}</h3>
                        </div>
                        <button
                            onClick={() => setSelectedNodeId(null)}
                            className="p-1.5 hover:bg-[#ffd6e8]/40 text-[#3b2a5a]/70 hover:text-[#3b2a5a] rounded-lg transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
                        {/* Core Details */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-[#3b2a5a]/70">Badge ID:</span>
                                <span className="font-mono font-bold text-[#3b2a5a] bg-[#f3e8ff] px-2 py-0.5 rounded border border-[#c9b6ff]">{selectedChar.badgeId}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[#3b2a5a]/70">Department:</span>
                                <span className="text-[#3b2a5a] font-semibold">{selectedChar.dept}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[#3b2a5a]/70">Role Title:</span>
                                <span className="text-[#3b2a5a] font-semibold">{selectedChar.title}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[#3b2a5a]/70">Narrative Tier:</span>
                                <span className="font-bold text-[#3b2a5a] bg-[#ffd6e8] px-2 py-0.5 rounded border border-[#ff9ec7]">{selectedChar.tier}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[#3b2a5a]/70">Clearance:</span>
                                <span className="font-mono font-semibold text-[#3b2a5a]">{selectedChar.clearance}</span>
                            </div>
                        </div>

                        {/* Clue Held */}
                        <div className="bg-gradient-to-r from-[#fff5f9] to-[#ffd6e8] p-3.5 rounded-xl border border-[#ff9ec7]/60 shadow-[0_2px_8px_rgba(255,158,199,0.1),inset_0_1px_0_rgba(255,255,255,1)]">
                            <span className="text-[10px] font-mono uppercase font-bold text-[#3b2a5a] block mb-1">
                                🔑 Clue / Credential Discovered:
                            </span>
                            <p className="text-[#3b2a5a] leading-relaxed font-sans">{selectedChar.clueHeld || 'None specified.'}</p>
                        </div>

                        {/* Message snippet */}
                        {selectedChar.messageSnippet && (
                            <div className="bg-[#f3e8ff]/60 p-3 rounded-xl border border-[#c9b6ff]/60 italic text-[#3b2a5a]/80">
                                "{selectedChar.messageSnippet}"
                            </div>
                        )}

                        {/* Connected Decision Lines */}
                        <div className="space-y-3 pt-2 border-t border-[#c9b6ff]/60">
                            <span className="text-[10px] font-mono uppercase font-bold text-[#3b2a5a] block">
                                🕸️ Connected Investigation Lines:
                            </span>

                            {selectedIncoming.length > 0 && (
                                <div className="space-y-2">
                                    <span className="text-[10px] text-[#3b2a5a]/70 font-mono font-semibold">Incoming Leads:</span>
                                    {selectedIncoming.map(inc => {
                                        const fromC = characters.find(c => c.id === inc.fromCharId);
                                        return (
                                            <div key={inc.id} className="bg-[#f3e8ff] p-2.5 rounded-xl border border-[#c9b6ff] text-[11px] shadow-[inset_0_1px_1px_rgba(59,42,90,0.03)]">
                                                <p className="text-[#3b2a5a] font-bold">From: {fromC ? fromC.name : inc.fromCharId}</p>
                                                <p className="text-[#3b2a5a]/80 text-[10px] mt-0.5">{inc.investigationAction}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {selectedOutgoing.length > 0 && (
                                <div className="space-y-2">
                                    <span className="text-[10px] text-[#3b2a5a]/70 font-mono font-semibold">Outgoing Leads:</span>
                                    {selectedOutgoing.map(out => {
                                        const toC = characters.find(c => c.id === out.toCharId);
                                        return (
                                            <div key={out.id} className="bg-[#f3e8ff] p-2.5 rounded-xl border border-[#c9b6ff] text-[11px] shadow-[inset_0_1px_1px_rgba(59,42,90,0.03)]">
                                                <p className="text-[#3b2a5a] font-bold">Unlocks: {toC ? toC.name : out.toCharId}</p>
                                                <p className="text-[#3b2a5a]/80 text-[10px] mt-0.5">{out.clueDiscovered}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {selectedIncoming.length === 0 && selectedOutgoing.length === 0 && (
                                <p className="text-[#3b2a5a]/60 italic text-xs">No decision lines connected to this character yet.</p>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="pt-3 border-t border-[#c9b6ff] flex gap-2">
                            <button
                                onClick={() => onEditCharacter(selectedChar)}
                                className="flex-1 bg-white hover:bg-[#ffd6e8]/40 text-[#3b2a5a] border border-[#c9b6ff] shadow-[0_2px_4px_rgba(59,42,90,0.05),inset_0_1px_0_rgba(255,255,255,1)] font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all"
                            >
                                <Edit3 size={14} /> Edit Character
                            </button>
                            <button
                                onClick={() => onAddDecisionLineFromChar(selectedChar.id)}
                                className="flex-1 bg-gradient-to-b from-[#ffa8ce] to-[#ff9ec7] hover:from-[#ff96c4] hover:to-[#f78bb8] text-[#3b2a5a] font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 border border-[#ff8dbb] shadow-[0_4px_12px_rgba(255,158,199,0.35),inset_0_1px_0_rgba(255,255,255,0.7)] transition-all"
                            >
                                <CornerDownRight size={14} /> Add Lead
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
