# WRID — Winter Research Internship Desk (Winter 2026–27)

A focused, calm, and rigorous academic workspace designed for undergraduate students across disciplines (Computer Science, AI/ML, Electrical & Electronics, Mechanical Engineering, Chemistry, Physics, Life Sciences, Mathematics, and Interdisciplinary Studies) preparing for and applying to winter research internships.

Built with **React 19**, **TypeScript**, **Tailwind CSS**, and **Vite**, inspired by the refined, considered UI/UX of modern tools.

```mermaid
flowchart TD
    %% Styling & Theme
    classDef darkBox fill:#1a1a1a,stroke:#ffffff,stroke-width:1.5px,color:#ffffff;
    classDef strokeOnly fill:none,stroke:#ffffff,stroke-width:1.5px,color:#ffffff,stroke-dasharray: 5 5;

    %% Nodes & Sections
    subgraph ClientSide ["Local Client-Side (User Browser Isolation)"]
        AppShell["Frontend App Shell<br/><code>React 19 • TypeScript • Vite • Tailwind CSS</code>"]
        LocalStorage[("Browser LocalStorage<br/><code>State, drafts, tracking, notes, profile</code>")]
        ImportModal["CSV / JSON Import Modal<br/><code>Email deduplication on merge</code>"]

        subgraph Datasets ["Bundled Static Datasets"]
            IIT["IIT Faculty<br/><code>iitFaculty.json</code>"]
            NIT["NIT Faculty<br/><code>nitFaculty.json</code>"]
            IIIT["IIIT Faculty<br/><code>iiitFaculty.json</code>"]
            DRDO["DRDO Labs<br/><code>drdoLabs.json</code>"]
        end

        subgraph LocalEngines ["Local Engines (Client-Side)"]
            RecEngine["Recommendation Engine<br/><code>Keyword overlap scoring</code>"]
            ResumeEnhancer["Resume Enhancer<br/><code>Heuristic text to Markdown</code>"]
            RankedMatches["Ranked Matches<br/><code>Transparent match reasons</code>"]
        end

        subgraph Outputs ["Outputs & Exports"]
            CSVExport["CSV Export"]
            MDExport["Markdown Export"]
            MailtoLinks["Mailto Links"]
        end
    end

    subgraph ExternalAPI ["Optional External API Boundary"]
        Consent["Explicit user consent<br/><code>User API key (.env / settings)</code>"]
        LLM["Gemma / Groq LLM API<br/><code>External, optional</code>"]
    end

    subgraph ComponentTree ["Component Tree Structure"]
        AppShellTree["App Shell<br/><code>React 19 • Vite</code>"]
        Node1["Datasets (4 JSON)"]
        Node2["Import + Dedup"]
        Node3["State (LocalStorage)"]
        Node4["Recommendation Engine"]
        Node5["Resume Enhancer"]

        AppShellTree --> Node1
        AppShellTree --> Node2
        AppShellTree --> Node3
        AppShellTree --> Node4
        AppShellTree --> Node5
    end

    %% Flow Connections
    AppShell <--> LocalStorage
    ImportModal --> LocalStorage
    AppShell --> Datasets
    Datasets --> RecEngine
    LocalStorage --> RecEngine
    
    RecEngine --> RankedMatches
    RankedMatches --> Outputs
    ResumeEnhancer --> Outputs
    
    ResumeEnhancer -. "Opt-in AI polish" .-> Consent
    Consent --> LLM

    %% Apply Styles
    class AppShell,LocalStorage,ImportModal,IIT,NIT,IIIT,DRDO,RecEngine,ResumeEnhancer,RankedMatches,CSVExport,MDExport,MailtoLinks,Consent,LLM,AppShellTree,Node1,Node2,Node3,Node4,Node5 darkBox;
    class ClientSide,ExternalAPI,ComponentTree strokeOnly;
