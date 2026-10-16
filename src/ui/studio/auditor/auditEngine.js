/**
 * Pure Structural Audit Engine for Story Continuity and Graph Reachability
 */
export function computeAuditReport(characters = [], decisionLines = []) {
    const issues = [];
    const charMap = new Map(characters.map(c => [c.id, c]));

    // Identify Protagonist and End-Goal Climax Target
    const protagonist = characters.find(c => c.tier === 'Protagonist' || c.id === 'char_audit04');
    const climaxTarget = characters.find(c => 
        c.id === 'char_subject882' || 
        c.badgeId === '882' || 
        c.name.toLowerCase().includes('subject 882') ||
        c.name.toLowerCase().includes('omega')
    ) || characters.find(c => c.tier === 'Deceased / MIA');

    // Build directed adjacency map for decision lines
    const outgoingMap = new Map();
    const incomingMap = new Map();
    characters.forEach(c => {
        outgoingMap.set(c.id, []);
        incomingMap.set(c.id, []);
    });

    decisionLines.forEach(dl => {
        if (charMap.has(dl.fromCharId)) {
            if (!outgoingMap.has(dl.fromCharId)) outgoingMap.set(dl.fromCharId, []);
            outgoingMap.get(dl.fromCharId).push(dl);
        }
        if (charMap.has(dl.toCharId)) {
            if (!incomingMap.has(dl.toCharId)) incomingMap.set(dl.toCharId, []);
            incomingMap.get(dl.toCharId).push(dl);
        }
    });

    // RULE 1: BROKEN DECISION LINE REFERENCES
    decisionLines.forEach(dl => {
        const fromExists = charMap.has(dl.fromCharId);
        const toExists = charMap.has(dl.toCharId);
        if (!fromExists || !toExists) {
            issues.push({
                id: `broken_ref_${dl.id}`,
                type: 'BROKEN_LINK',
                severity: 'CRITICAL',
                title: `Dangling Decision Line: "${dl.stepName || 'Unnamed Step'}"`,
                description: `This decision line points to or from a character ID that does not exist in the active roster (From: ${dl.fromCharId}, To: ${dl.toCharId}).`,
                recommendation: 'Re-assign valid source and target characters or delete this orphaned line.',
                targetLineId: dl.id,
                fixType: 'EDIT_LINE'
            });
        }
    });

    // RULE 2: PATH TO CLIMAX (WINNABILITY OF THE GAME)
    let criticalPath = [];
    let canReachClimax = false;

    if (protagonist && climaxTarget) {
        const queue = [[protagonist.id, [protagonist.id]]];
        const visited = new Set([protagonist.id]);

        while (queue.length > 0) {
            const [currentId, path] = queue.shift();
            if (currentId === climaxTarget.id) {
                canReachClimax = true;
                criticalPath = path;
                break;
            }
            const neighbors = (outgoingMap.get(currentId) || []).map(l => l.toCharId);
            for (const nextId of neighbors) {
                if (!visited.has(nextId) && charMap.has(nextId)) {
                    visited.add(nextId);
                    queue.push([nextId, [...path, nextId]]);
                }
            }
        }

        if (!canReachClimax) {
            issues.push({
                id: 'unwinnable_climax_path',
                type: 'UNWINNABLE_LOOP',
                severity: 'CRITICAL',
                title: `Unwinnable Mystery: No Valid Path from ${protagonist.name} to ${climaxTarget.name}`,
                description: `The player starts as "${protagonist.name}", but there is no connected chain of clues or decision lines leading to the climax target "${climaxTarget.name}". Players will get stuck without a path to victory.`,
                recommendation: `Add decision lines linking intermediate employees (e.g., Sarah Kone ➔ David Bowman ➔ Patricia Vance ➔ ${climaxTarget.name}).`,
                targetCharId: protagonist.id,
                secondaryCharId: climaxTarget.id,
                fixType: 'CONNECT_GRAPH'
            });
        }
    }

    // RULE 3: ORPHAN / UNREACHABLE CHARACTERS
    characters.forEach(char => {
        if (protagonist && char.id === protagonist.id) return;

        const incoming = incomingMap.get(char.id) || [];
        if (incoming.length === 0) {
            const isCrucial = char.tier === 'Main Target' || char.tier === 'Supporting';
            issues.push({
                id: `unreachable_${char.id}`,
                type: 'UNREACHABLE_CHARACTER',
                severity: isCrucial ? 'CRITICAL' : 'WARNING',
                title: `Unreachable Personnel: ${char.name} (${char.badgeId})`,
                description: `${char.name} is on the roster with clearance "${char.clearance}", but has 0 incoming decision lines. Players have no in-game narrative trigger or terminal lead to discover them.`,
                recommendation: `Create an incoming decision line from another employee (e.g. an email thread, audit finding, or log leak) that points to ${char.name}.`,
                targetCharId: char.id,
                fixType: 'CONNECT_TO_CHAR'
            });
        }
    });

    // RULE 4: DEAD ENDS / NARRATIVE CUL-DE-SACS
    characters.forEach(char => {
        if (climaxTarget && char.id === climaxTarget.id) return;
        if (char.tier === 'Background' || char.tier === 'Other') return;

        const outgoing = outgoingMap.get(char.id) || [];
        const incoming = incomingMap.get(char.id) || [];

        if (incoming.length > 0 && outgoing.length === 0) {
            issues.push({
                id: `dead_end_${char.id}`,
                type: 'DEAD_END',
                severity: char.tier === 'Main Target' ? 'CRITICAL' : 'WARNING',
                title: `Narrative Dead End: ${char.name} leads nowhere`,
                description: `The player discovers ${char.name} through an investigation lead, but this character offers 0 outgoing decision lines. The investigation trail abruptly goes cold here.`,
                recommendation: `Add an outgoing decision step from ${char.name} pointing to the next department, server terminal, or suspect.`,
                targetCharId: char.id,
                fixType: 'ADD_OUTGOING_LINE'
            });
        }
    });

    // RULE 5: MISSING FORENSIC PUZZLE CLUES
    characters.forEach(char => {
        const clue = (char.clueHeld || '').trim();
        const isMissing = !clue || clue.toLowerCase() === 'none' || clue.length < 5;
        
        if (isMissing && (char.tier === 'Protagonist' || char.tier === 'Main Target' || char.tier === 'Supporting')) {
            issues.push({
                id: `missing_clue_${char.id}`,
                type: 'MISSING_CLUE',
                severity: 'WARNING',
                title: `Empty Puzzle Clue: ${char.name}`,
                description: `${char.name} is a ${char.tier} but holds no puzzle clue, credential, or physical artifact for the ARG player to solve.`,
                recommendation: 'Assign a credential pair (e.g. badge ID + password), terminal command, or forensic document to this character.',
                targetCharId: char.id,
                fixType: 'GENERATE_CLUE'
            });
        }
    });

    // RULE 6: MISSING VOICE MEMOS OR CHAT RESIDUE
    characters.forEach(char => {
        const memo = (char.messageSnippet || '').trim();
        const isMissing = !memo || memo.toLowerCase() === 'none' || memo.length < 5;

        if (isMissing && (char.tier === 'Protagonist' || char.tier === 'Main Target')) {
            issues.push({
                id: `missing_voice_${char.id}`,
                type: 'MISSING_VOICE',
                severity: 'WARNING',
                title: `Missing Voice Residue: ${char.name}`,
                description: `Key character ${char.name} has no recorded quote, audio memo, or intercepted terminal chat snippet on file.`,
                recommendation: 'Draft an authentic dialogue snippet reflecting their fear, suspicion, or corporate complicity.',
                targetCharId: char.id,
                fixType: 'GENERATE_VOICE'
            });
        }
    });

    // RULE 7: SHALLOW LORE & UNMOTIVATED CHARACTERS
    characters.forEach(char => {
        const lore = (char.loreNotes || '').trim();
        const words = lore ? lore.split(/\s+/).filter(Boolean).length : 0;

        if (words < 12 && (char.tier === 'Main Target' || char.tier === 'Supporting')) {
            issues.push({
                id: `shallow_lore_${char.id}`,
                type: 'SHALLOW_LORE',
                severity: 'SUGGESTION',
                title: `Underdeveloped Motive: ${char.name} (${words} words)`,
                description: `Lore notes for ${char.name} are very brief. Their personal motivation, secret allegiance, and psychological reaction to Project Omega are unexplained.`,
                recommendation: 'Deepen their backstory with clear motives, secrets, or friction with OmniCorp executives.',
                targetCharId: char.id,
                fixType: 'DEEPEN_LORE'
            });
        }
    });

    // Calculate Overall Health Score (0 - 100%)
    const criticalCount = issues.filter(i => i.severity === 'CRITICAL').length;
    const warningCount = issues.filter(i => i.severity === 'WARNING').length;
    const suggestionCount = issues.filter(i => i.severity === 'SUGGESTION').length;

    const deductions = (criticalCount * 25) + (warningCount * 8) + (suggestionCount * 3);
    const healthScore = Math.max(10, Math.min(100, 100 - deductions));

    return {
        issues,
        criticalCount,
        warningCount,
        suggestionCount,
        healthScore,
        canReachClimax,
        criticalPath,
        protagonist,
        climaxTarget
    };
}
