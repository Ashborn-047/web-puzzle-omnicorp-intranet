export const AI_PROVIDERS = {
    OPENROUTER: 'openrouter',
    BUILTIN: 'builtin'
};

export const POPULAR_MODELS = [
    { 
        id: 'nvidia/nemotron-3-ultra-550b-a55b:free', 
        name: 'NVIDIA Nemotron 3 Ultra Free (OpenRouter)', 
        tag: 'Nemotron Ultra',
        provider: AI_PROVIDERS.OPENROUTER 
    },
    { 
        id: 'builtin/omnicorp-neural', 
        name: 'OmniCorp Neural Architect (Offline Simulation)', 
        tag: 'OmniCorp Neural',
        provider: AI_PROVIDERS.BUILTIN 
    }
];

export const OMNICORP_SYSTEM_PROMPT = `You are a helpful, conversational, and versatile AI assistant. 
Communicate naturally, warmly, and helpfully just like a general AI chat interface. 
- If the user greets you (e.g. "hello", "hi", "how are you"), reply warmly and naturally as an AI chat partner and ask how you can help them today.
- You can converse about anything, answer general knowledge questions, discuss ideas, write stories or code, and brainstorm.
- You are also knowledgeable about the user's project, "OmniCorp Intranet" (a cosmic horror mystery ARG game about an artificial loop trapped inside Project Omega).
- If the user asks specifically about game lore, characters (Sarah Kone, David Bowman, Bill Lumbergh, Patricia Vance, Ellen Ripley, Subject 882), or puzzle clues, provide rich lore insights.
- If the user explicitly asks to generate or create a new employee/character for the roster, include a clean JSON code block with fields: name, badgeId, dept, title, tier, clearance, status, clueHeld, messageSnippet, loreNotes so the studio can import it.`;

export const CHARACTER_PRESETS = [
    { label: '🧪 Sector 7 Bio-Tech', prompt: 'Create a Sector 7 Bio-Containment Specialist who discovered living matter in coolant pipes' },
    { label: '💻 IT Rogue SysAdmin', prompt: 'Create a rogue IT systems administrator who noticed terminal memory residues across loop cycles' },
    { label: '📊 Finance Auditor', prompt: 'Create a junior financial auditor investigating unmapped offshore wire transfers for PO-4412' },
    { label: '📋 HR Deprovisioning Officer', prompt: 'Create an HR compliance liaison who processed paperwork for missing employee #882' },
    { label: '🚚 Janitorial Slurry Handler', prompt: 'Create a night-shift maintenance courier who transported sealed cryo-drums to Sub-level 3' },
    { label: '🎲 Surprise Employee', prompt: 'Create an unexpected corporate employee with a unique mystery clue for OmniCorp Intranet' }
];

export const QUICK_INSPIRATION_CHIPS = [
    '🎭 Sector 7 Hazmat Tech',
    '💬 Draft Act 2 Chat for Bowman',
    '🔍 Formulate PO-4412 Clue',
    '🧩 Suggest Act 3 Ending'
];
