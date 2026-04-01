const terminalWrapper = document.getElementById('terminal-wrapper');
const outputHistory = document.getElementById('output-history');
const inputLine = document.getElementById('input-line');
const renderedInput = document.getElementById('rendered-input');
const hiddenInput = document.getElementById('hidden-input');

let commandHistory = [];
let historyIndex = -1;
let isBooting = true;
let isTyping = false;
let currentPath = []; // empty array means '~', ['experience'] means '~/experience'

function getPromptHTML() {
    const pathStr = currentPath.length === 0 ? '~' : `~/${currentPath.join('/')}`;
    return `<span class="prompt"><span class="user">guest</span>@<span class="host">naveen-terminal</span>:<span class="path">${pathStr}</span>$</span>`;
}

function updatePrompt() {
    // update the hidden input line prompt
    const promptSpan = document.querySelector('#input-line .prompt');
    if (promptSpan) {
        promptSpan.outerHTML = getPromptHTML();
    }
}

const FILE_SYSTEM = {
    'about.txt': {
        type: 'file', content: `<br>Hi, I am <b>Naveen Chowdary Edala</b>.<br>
A highly capable "technology generalist" currently operating as a <b>Manager - Associate Tech Lead</b> within the Office of Ananya Birla (OAB) at Aditya Birla Management Corporation Pvt Ltd (ABMCPL).<br>
I thrive on building successful products and teams, evolving from hands-on software engineering and research into high-level technical leadership, architecture, and GenAI product development.<br><br>
Run <a class="link" onclick="executeCommand('cat value.txt', true)">cat value.txt</a> to read about my unique value proposition, or <a class="link" onclick="executeCommand('cat skills.txt', true)">cat skills.txt</a> for my technical stack.<br>` },

    'value.txt': {
        type: 'file', content: `<br><span class="info-text">--- Unique Value Proposition ---</span><br><br>
Across a decade of fascination with tech, I've dabbled in many things: Game design in Unity/Unreal Engine, Android app development, Basic IoT with Arduinos/Raspberry Pis, competitive coding, web development, and now Generative AI and cloud architecture.<br><br>
I am unique in that I can wear multiple hats - I can be a hands-on developer, a tech lead, a manager, a mentor, a tutor, and a friend. I take pride in being the <b>swiss army knife</b> of any team. I can effectively play second fiddle to specialist technical members by copiloting them in areas they are weak in, ensuring holistic team growth and robust decision-making.<br>` },

    'skills.txt': {
        type: 'file', content: `<br><span class="info-text">--- Technical Skillset & Competencies ---</span><br><br>
<div class="grid-container">
    <div><span class="prompt-host">Generative AI & LLMs</span><br>Google Gemini, Azure OpenAI Services</div>
    <div><span class="success-text">Frontend Development</span><br>React.js, Material UI, Storybook, TypeScript, Javascript</div>
    <div><span class="cmd-color">Backend Development</span><br>Python, Flask, FastAPI, Django, DRF, Microservices</div>
    <div><span class="error-text">Cloud & DevOps</span><br>AWS, Azure, GCP, GitHub Actions, Docker, Kubernetes, Server Admin</div>
    <div><span class="prompt-path">Leadership</span><br>E2E Product Management, Architecture, Tech Scope, Interviews</div>
</div><br>` },

    'education.txt': {
        type: 'file', content: `<br><span class="info-text">--- Education History ---</span><br>
<ul>
    <li><span class="prompt-host">MSc Cybersecurity</span> | University of London (Sep 2022 - Oct 2025)<br>Graduated with <b>Distinction</b></li>
    <li><span class="prompt-host">B.Tech Computer Science</span> | SRM University, AP (Jun 2018 - Jun 2022)<br>Graduated with strong grade of <b>8.6</b></li>
    <li><span class="prompt-host">High School (Math, Physics, Chem)</span> | Silver Oaks International Schools (Apr 2016 - Apr 2018)<br>Graduated with <b>86%</b></li>
</ul><br>` },

    'contact.txt': {
        type: 'file', content: `<br>
<span class="key">Email:</span> <a href="mailto:edalanaveenchowdary@gmail.com" class="link">edalanaveenchowdary@gmail.com/a><br>
<span class="key">LinkedIn:</span> <a href="https://linkedin.com/in/naveenedala" target="_blank" class="link">linkedin.com/in/naveenedala</a><br>
<span class="key">GitHub:</span> <a href="https://github.com/naveenedala" target="_blank" class="link">github.com/naveenedala</a><br><br>` },

    'experience': {
        type: 'dir',
        content: {
            'abmcpl.txt': {
                type: 'file', content: `<br><span class="success-text">Aditya Birla Management Corporation Pvt Ltd (ABMCPL)</span><br>
<b>Manager - Associate Tech Lead</b> (Apr 2025 - Present)<br>
- <b>Team & Project Governance:</b> Govern tech efforts across OAB aegis, managing 4 distinct projects.<br>
- <b>E2E Product Management:</b> Oversee "lights-to-flag" lifecycle of 3 products (Design to Deployment/Maintenance).<br>
- <b>Strategic Architecture:</b> Direct tech scope and design robust cloud architectures.<br><br>
<b>Technical Consultant</b> (Apr 2024 - Apr 2025)<br>
- <b>GenAI Pioneer:</b> Spearheaded POC creation and conversion of 3 Generative AI products.<br>
- <b>Full-Stack Execution:</b> Handled UX design, frontend, backend, microservices, and cloud deployment.<br>
- <b>Team Building:</b> Led technical interviews to build a robust internal B2B product team.<br>` },

            'trilogy.txt': {
                type: 'file', content: `<br><span class="success-text">Crossover for Work / Trilogy</span><br>
<b>SDE - I (Innovator)</b> (Jan 2022 - Sep 2022)<br>
Focused on agile software development, ideation, and Research and Development (RnD). Contributed to the development of many products and features utilized by customers inside and outside Trilogy and the ESW Capital group.<br>` },

            'tutor.txt': {
                type: 'file', content: `<br><span class="success-text">Independent Contractor / Private Tutor</span><br>
(Sep 2022 - Mar 2024)<br>
Combined technical expertise with a passion for teaching. Offered personalized coaching through in-person and virtual classes.<br>
Trained students in Software Development, Python Service Automation, Web Development, Linux operations, and guided them through certifications and business communication.<br>` }
        }
    }
};

const HELP_TEXT = `<br>Available commands:<br><br>
  <a class="link" onclick="executeCommand('ls', true)">ls</a>           - List directory contents<br>
  <a class="link" onclick="executeCommand('cat', true)">cat [file]</a>   - Print the contents of a file (e.g. <a class="link" onclick="executeCommand('cat about.txt', true)">cat about.txt</a>)<br>
  <a class="link" onclick="executeCommand('cd experience', true)">cd [dir]</a>     - Change directory (e.g. <a class="link" onclick="executeCommand('cd experience', true)">cd experience</a>)<br>
  <a class="link" onclick="executeCommand('pwd', true)">pwd</a>          - Print working directory<br>
  <a class="link" onclick="executeCommand('startx', true)">startx</a>       - Launch the graphical UI portfolio<br>
  <a class="link" onclick="executeCommand('clear', true)">clear</a>        - Clear the terminal screen<br>
  <a class="link" onclick="executeCommand('help', true)">help</a>         - Display this help message<br><br>
  <span class="info-text">Tip: Click any blue link to automatically execute the command!</span><br><br>`;

const bootLogs = [
    "INIT: version 20.01 booting",
    "[ OK ] Starting system message bus.",
    "[ OK ] Starting system kernel... loaded.",
    "Mounting local filesystems: [ OK ]",
    "Loading network interfaces... [ OK ]",
    "Loading module user_profile_naveen... [ OK ]",
    "Loading VirtualFS node modules... [ OK ]",
    "Establishing secure connection to guest...",
    "Done.",
    " ",
    "Welcome to NaveenOS v3.0",
    "Type 'help' to see a list of available commands."
];

async function bootUp() {
    isBooting = true;
    for (let i = 0; i < bootLogs.length; i++) {
        await typeLine(bootLogs[i], i >= bootLogs.length - 2 ? 30 : Math.random() * 30 + 10);
    }
    await new Promise(r => setTimeout(r, 200));
    isBooting = false;
    inputLine.classList.remove('hidden');
    hiddenInput.focus();
    updatePrompt();
    scrollToBottom();
}

async function typeLine(text, speed = 15) {
    const p = document.createElement('div');
    p.className = 'output-block info-text';

    if (text.trim() === "") {
        p.innerHTML = "&nbsp;";
        outputHistory.appendChild(p);
        scrollToBottom();
        return;
    }

    outputHistory.appendChild(p);

    for (let i = 0; i < text.length; i++) {
        p.textContent += text.charAt(i);
        scrollToBottom();
        await new Promise(r => setTimeout(r, speed));
    }
}

function scrollToBottom() {
    terminalWrapper.scrollTop = terminalWrapper.scrollHeight;
}

document.addEventListener('click', (e) => {
    if (!isBooting && window.getSelection().toString() === "" && e.target.tagName !== 'A') {
        hiddenInput.focus();
    }
});

hiddenInput.addEventListener('input', (e) => {
    if (!isBooting && !isTyping) {
        renderedInput.textContent = hiddenInput.value;
    }
});

hiddenInput.addEventListener('keydown', (e) => {
    if (isBooting || isTyping) {
        e.preventDefault();
        return;
    }

    if (e.key === 'Enter') {
        const cmd = hiddenInput.value.trim();
        if (cmd) {
            commandHistory.push(cmd);
            historyIndex = commandHistory.length;
            executeCommand(cmd);
        } else {
            appendHistoryBlock(`${getPromptHTML()} <span class="cmd-echo"></span>`, '');
        }
        hiddenInput.value = '';
        renderedInput.textContent = '';
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (historyIndex > 0) {
            historyIndex--;
            hiddenInput.value = commandHistory[historyIndex];
            renderedInput.textContent = hiddenInput.value;
        }
    } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (historyIndex < commandHistory.length - 1) {
            historyIndex++;
            hiddenInput.value = commandHistory[historyIndex];
            renderedInput.textContent = hiddenInput.value;
        } else {
            historyIndex = commandHistory.length;
            hiddenInput.value = '';
            renderedInput.textContent = '';
        }
    } else if (e.key === 'Tab') {
        e.preventDefault();
        const input = hiddenInput.value;
        const args = input.trim().split(/\s+/);

        let matches = [];
        if (args.length === 1) {
            // Completing base commands
            const cmds = ['ls', 'cat', 'cd', 'pwd', 'clear', 'help', 'whoami', 'echo', 'date', 'rm', 'neofetch', 'theme', 'startx', 'gui'];
            matches = cmds.filter(c => c.startsWith(args[0].toLowerCase()));
        } else if (args.length === 2 && (args[0].toLowerCase() === 'cat' || args[0].toLowerCase() === 'cd')) {
            // Completing files or directories
            const currNode = getCurrentDirNode();
            const keys = Object.keys(currNode);
            matches = keys.filter(k => k.startsWith(args[1]));

            // if it's cd and we matched a dir, append slash
            if (matches.length === 1 && args[0].toLowerCase() === 'cd' && currNode[matches[0]].type === 'dir') {
                matches[0] += '/';
            }
        }

        if (matches.length === 1) {
            if (args.length === 1) {
                hiddenInput.value = matches[0] + ' ';
            } else {
                hiddenInput.value = args[0] + ' ' + matches[0];
            }
            renderedInput.textContent = hiddenInput.value;
        }
    }
});

function appendHistoryBlock(prompt, output) {
    const block = document.createElement('div');
    block.className = 'history-line';
    block.innerHTML = `<div>${prompt}</div><div class="output-block">${output}</div>`;
    outputHistory.appendChild(block);
    scrollToBottom();
}

function getCurrentDirNode() {
    let node = FILE_SYSTEM;
    for (let p of currentPath) {
        node = node[p].content;
    }
    return node;
}

window.executeCommand = async function (cmdRaw, fromClick = false) {
    if (isTyping || isBooting) return;

    // Safety against people clicking the raw link literals in help
    if (cmdRaw.includes('[')) return;

    if (fromClick) {
        isTyping = true;
        hiddenInput.value = '';
        renderedInput.textContent = '';

        for (let i = 0; i < cmdRaw.length; i++) {
            renderedInput.textContent += cmdRaw[i];
            await new Promise(r => setTimeout(r, 40));
        }
        await new Promise(r => setTimeout(r, 150));
        renderedInput.textContent = '';
        isTyping = false;

        commandHistory.push(cmdRaw);
        historyIndex = commandHistory.length;
    }

    const args = cmdRaw.trim().split(/\s+/);
    const baseCmd = args[0].toLowerCase();
    const target = args.length > 1 ? args[1] : null;

    let output = '';

    // Save prompt before changing directories or clearing
    const currentPromptHTML = getPromptHTML();

    if (baseCmd === 'clear') {
        outputHistory.innerHTML = '';
        // Nudge to type help
        appendHistoryBlock('', `<div class="info-text">Type 'help' to see a list of available commands.</div><br>`);
        if (fromClick) { hiddenInput.focus(); }
        return;
    }

    if (baseCmd === 'help') {
        output = HELP_TEXT;
    } else if (baseCmd === 'sudo') {
        output = `<br><span class="error-text">guest is not in the sudoers file. This incident will be reported to Naveen.</span><br>`;
    } else if (baseCmd === 'pwd') {
        const p = currentPath.length === 0 ? '' : `/${currentPath.join('/')}`;
        output = `<br>/home/guest${p}<br>`;
    } else if (baseCmd === 'whoami') {
        output = `<br>guest<br>`;
    } else if (baseCmd === 'ls') {
        const currNode = getCurrentDirNode();
        let items = [];
        for (const [key, val] of Object.entries(currNode)) {
            if (val.type === 'dir') {
                items.push(`<a class="link" style="color: var(--prompt-host); font-weight: bold;" onclick="executeCommand('cd ${key}', true)">${key}/</a>`);
            } else {
                items.push(`<a class="link" style="color: var(--text-color);" onclick="executeCommand('cat ${key}', true)">${key}</a>`);
            }
        }
        output = `<br><div style="display: flex; gap: 15px; flex-wrap: wrap;">${items.join('')}</div><br>`;
    } else if (baseCmd === 'cd') {
        if (!target || target === '~' || target === '/') {
            currentPath = [];
            updatePrompt();
        } else if (target === '..') {
            if (currentPath.length > 0) {
                currentPath.pop();
                updatePrompt();
            }
        } else {
            // Check if directory exists
            const currNode = getCurrentDirNode();
            // remove trailing slash if user types `cd experience/`
            const cleanTarget = target.replace(/\/$/, "");
            if (currNode[cleanTarget]) {
                if (currNode[cleanTarget].type === 'dir') {
                    currentPath.push(cleanTarget);
                    updatePrompt();
                } else {
                    output = `<br><span class="error-text">cd: ${target}: Not a directory</span><br>`;
                }
            } else {
                output = `<br><span class="error-text">cd: ${target}: No such file or directory</span><br>`;
            }
        }
    } else if (baseCmd === 'cat') {
        if (!target) {
            output = `<br><span class="error-text">cat: missing file operand</span><br>`;
        } else {
            const currNode = getCurrentDirNode();
            let fileNode = null;

            // Allow them to type `cat experience/abmcpl.txt` from '~'
            if (target.includes('/')) {
                const parts = target.split('/');
                if (currNode[parts[0]] && currNode[parts[0]].type === 'dir') {
                    const subNode = currNode[parts[0]].content;
                    if (subNode[parts[1]]) {
                        fileNode = subNode[parts[1]];
                    }
                }
            } else {
                if (currNode[target]) fileNode = currNode[target];
            }

            if (fileNode) {
                if (fileNode.type === 'dir') {
                    output = `<br><span class="error-text">cat: ${target}: Is a directory</span><br>`;
                } else {
                    output = fileNode.content;
                }
            } else {
                output = `<br><span class="error-text">cat: ${target}: No such file or directory</span><br>`;
            }
        }
    } else if (baseCmd === 'echo') {
        output = `<br>${args.slice(1).join(' ')}<br>`;
    } else if (baseCmd === 'theme') {
        const THEMES = {
            'default': { '--bg-color': '#1e1e1e', '--text-color': '#cccccc', '--prompt-user': '#4ade80', '--prompt-host': '#60a5fa', '--cmd-color': '#dcdcaa', '--link-color': '#38bdf8' },
            'matrix': { '--bg-color': '#0d0208', '--text-color': '#00ff41', '--prompt-user': '#00ff41', '--prompt-host': '#008f11', '--cmd-color': '#00ff41', '--link-color': '#008f11' },
            'amber': { '--bg-color': '#1a1100', '--text-color': '#ffb000', '--prompt-user': '#ffb000', '--prompt-host': '#ff8c00', '--cmd-color': '#ffb000', '--link-color': '#ff8c00' }
        };
        if (!target) {
            output = `<br>Available themes: <a class="link" onclick="executeCommand('theme default', true)">default</a>, <a class="link" onclick="executeCommand('theme matrix', true)">matrix</a>, <a class="link" onclick="executeCommand('theme amber', true)">amber</a><br>`;
        } else if (THEMES[target]) {
            for (let [key, val] of Object.entries(THEMES[target])) {
                document.documentElement.style.setProperty(key, val);
            }
            output = `<br><span class="success-text">System theme visually configured to '${target}'.</span><br>`;
        } else {
            output = `<br><span class="error-text">theme: '${target}' not found.</span><br>`;
        }
    } else if (baseCmd === 'startx' || baseCmd === 'gui') {
        output = `<br><div class="info-text">Initiating X Window System...<br>Switching to graphical interface...</div><br>`;
        appendHistoryBlock(`${currentPromptHTML} <span class="cmd-echo">${cmdRaw}</span>`, output);
        if (fromClick) { hiddenInput.focus(); }
        isTyping = true; // Lock down typing naturally
        setTimeout(() => {
            window.location.href = '/portfoliosite';
        }, 1200);
        return; // Early return because we manually appended history
    } else if (baseCmd === 'date') {
        output = `<br>${new Date().toString()}<br>`;
    } else if (baseCmd === 'rm') {
        const fullCmd = args.join(' ');
        if (fullCmd.includes('-rf / --no-preserve-root')) {
            outputHistory.innerHTML = '';
            outputHistory.style.display = 'none';
            document.body.style.backgroundColor = '#000';
            setTimeout(() => {
                outputHistory.style.display = 'block';
                document.body.style.backgroundColor = 'var(--bg-color)';
                FILE_SYSTEM['about.txt'].content = `<br><span class="error-text">DATA CORRUPTED. FILE NOT FOUND.</span><br>`;
                FILE_SYSTEM['skills.txt'].content = `<br><span class="error-text">DATA CORRUPTED. REBUILDING...</span><br>`;
                bootUp();
            }, 1500);
            return;
        } else if (fullCmd.includes('-rf /')) {
            output = `<br><span class="error-text">rm: it is dangerous to operate recursively on '/'</span><br>
<span class="info-text">Use --no-preserve-root to override this failsafe.</span><br>`;
        } else {
            output = `<br><span class="error-text">rm: Permission denied. You don't have write access to my portfolio! Nice try though.</span><br>`;
        }
    } else if (baseCmd === 'neofetch') {
        output = `<br><div style="display: flex; gap: 40px; align-items: center; margin-left: 10px;">
<div style="color: var(--prompt-user); font-weight: bold; white-space: pre; font-size: 12px; line-height: 1.1;">
      /\\
     /  \\
    /____\\
   / .  . \\
  /   __   \\
 /          \\
/____________\\
</div>
<div style="white-space: pre; line-height: 1.3;">
<span class="user" style="color: var(--prompt-user); font-weight: bold;">guest</span>@<span class="host" style="color: var(--prompt-host); font-weight: bold;">naveen-terminal</span>
-----------------------
<span style="color: var(--prompt-host); font-weight: bold;">OS:</span> NaveenOS v3.0 x64
<span style="color: var(--prompt-host); font-weight: bold;">Host:</span> Web Application
<span style="color: var(--prompt-host); font-weight: bold;">Kernel:</span> 20.01-WebJS
<span style="color: var(--prompt-host); font-weight: bold;">Uptime:</span> Time isn't real
<span style="color: var(--prompt-host); font-weight: bold;">Packages:</span> Too many (npm)
<span style="color: var(--prompt-host); font-weight: bold;">Shell:</span> js-bash
<span style="color: var(--prompt-host); font-weight: bold;">Terminal:</span> HTML/CSS
<span style="color: var(--prompt-host); font-weight: bold;">CPU:</span> Human Intelligence
</div>
</div><br>`;
    } else {
        output = `<br><span class="error-text">command not found: ${baseCmd}. Type 'help' for available commands.</span><br>`;
    }

    appendHistoryBlock(`${currentPromptHTML} <span class="cmd-echo">${cmdRaw}</span>`, output);
    if (fromClick) { hiddenInput.focus(); }
}

window.onload = () => {
    bootUp();
};
