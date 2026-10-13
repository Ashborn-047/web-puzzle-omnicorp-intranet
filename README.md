# OMNICORP INTRANET 🧩

<div align="center">

[![Deploy GitHub Pages](https://github.com/Ashborn-047/web-puzzle-omnicorp-intranet/actions/workflows/deploy.yml/badge.svg)](https://github.com/Ashborn-047/web-puzzle-omnicorp-intranet/actions)
[![Live Game](https://img.shields.io/badge/Live_Intranet-Demo-7c3aed?style=flat-square&logo=google-chrome&logoColor=white)](https://ashborn-047.github.io/web-puzzle-omnicorp-intranet/)
[![Narrative Studio](https://img.shields.io/badge/Narrative_Studio-Dev_Tool-ff8dbb?style=flat-square&logo=visual-studio-code&logoColor=white)](https://ashborn-047.github.io/web-puzzle-omnicorp-intranet/studio.html)
[![React 19](https://img.shields.io/badge/React-19.x-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.0-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![NVIDIA NIM](https://img.shields.io/badge/AI_Co--Writer-NVIDIA_NIM-76B900?style=flat-square&logo=nvidia&logoColor=white)](https://build.nvidia.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

**A Cosmic Horror / Bureaucratic ARG Puzzle Game & Narrative Authoring Suite**

[🎮 Play Intranet Simulation](https://ashborn-047.github.io/web-puzzle-omnicorp-intranet/) • [🛠️ Launch Narrative Studio](https://ashborn-047.github.io/web-puzzle-omnicorp-intranet/studio.html) • [📖 Documentation](docs/)

</div>

---

## 👁️ Overview

**OmniCorp Intranet** is a narrative-driven psychological horror puzzle game disguised as a sterile late-90s/early-2000s corporate internal network. Players step into the role of **AUDIT-04**, an external contractor tasked with auditing suspicious procurement orders—only to realize they are trapped in the 14th iteration of an algorithmic recursion powered by the occult *"Project Omega"*.

The repository hosts two integrated web applications:
1. **The Game Client** (`/`): The player-facing simulated corporate intranet portal, email client, employee directory, audit verification system, and rogue terminal.
2. **The Narrative & Decision Studio** (`/studio.html`): A dedicated developer IDE for designing canon characters, weaving clue paths, visualizing the investigation with an Obsidian-style force-directed graph, and co-writing lore with AI.

---

## ✨ Features

### 🏢 Player Client (The Intranet)
- **Authentic Corporate GUI**: Interactive Dashboard, Messages, Employee Directory, Vendor Invoices, and Terminal.
- **Dynamic Clearance Ladder**: Progress through clearance tiers (`L0 EXTERNAL` → `L1 INTERNAL` → `L2 DEPT_SUPERVISOR` → `L3 EXECUTIVE` → `L-OMEGA`).
- **Cryptic Audit Mechanics**: Trace PO-4412 discrepancies, bio-slurry shipping manifests disguised as janitorial goods, and redacted email threads.
- **Rogue SysAdmin Terminal**: Access hidden terminal residue left by SysAdmin David Bowman (`ID 9000`).

### 🎨 Narrative & Decision Studio (`/studio.html`)
- **Character & Clue Weaver**: Visual card board managing OmniCorp employees, clearance badges, clue items, and dialogue snippets. Includes direct character editing and 1-click deletion with safety cascade.
- **Investigation Pathway Weaver**: Map logical deduction connections and unlocked clues between characters.
- **Obsidian-Style Graph Map**: Interactive physics-based canvas graph with particle pulse animations, force-directed node layout, and department filtering.
- **AI Co-Writer (NVIDIA NIM)**: Built-in creative assistant powered by **NVIDIA Nemotron 3 120B** (`nvidia/nemotron-3-super-120b-a12b`) with live Server-Sent Events (SSE) streaming (~1s response time), 1-click roster import, and request cancellation.
- **Passcode Protection & GitHub Cloud Sync**: Secured with developer gate authentication and bi-directional GitHub repository synchronization.

---

## 🛠️ Tech Stack

| Category | Technology |
| :--- | :--- |
| **Frontend Framework** | React 19 + Vite 6 |
| **Styling & Theme** | Tailwind CSS v4 + Vanilla CSS Design Tokens |
| **Iconography** | Lucide React |
| **AI Integration** | NVIDIA NIM API (Nemotron 3 120B, DeepSeek v4.1 Flash, Moonshot Kimi k3) |
| **Graph Engine** | HTML5 Canvas Custom Physics Simulation |
| **Deployment** | GitHub Actions CI/CD → GitHub Pages |

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- Git

### Installation & Run

```bash
# Clone the repository
git clone https://github.com/Ashborn-047/web-puzzle-omnicorp-intranet.git
cd web-puzzle-omnicorp-intranet/web-puzzle-app

# Install dependencies
npm install

# Start local development server
npm run dev
```

Visit the applications in your browser:
- **Game Portal**: `http://localhost:5173/web-puzzle-omnicorp-intranet/`
- **Narrative Studio**: `http://localhost:5173/web-puzzle-omnicorp-intranet/studio.html` *(Passcode: `omnicorp-dev` or `1979`)*

---

## 🔑 AI Co-Writer Setup (Optional)

To enable the **AI Co-Writer** in the Narrative Studio, create a `.env.local` file in `web-puzzle-app/`:

```env
# NVIDIA NIM API Key (https://build.nvidia.com/)
VITE_NVIDIA_API_KEY=nvapi-your-key-here
```

*Note: You can also enter or switch your API key directly within the Studio UI under the AI Co-Writer settings drawer.*

---

## 📜 Production Build

```bash
# Build production bundle for deployment
npm run build

# Preview production build locally
npm run preview
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">
<sub>Project Omega // Iteration 14 // Unauthorized access is a Class A Corporate Felony.</sub>
</div>
