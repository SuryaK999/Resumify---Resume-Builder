const Resumify = {
    state: {
        content: JSON.parse(localStorage.getItem('resumify_v9_content')) || {
            name: '', job: '', email: '', phone: '', loc: '', summary: '', avatar: '',
            linkedin: '', github: '', portfolio: '',
            sectionOrder: ['summary', 'projects', 'experience', 'education', 'certs', 'skills', 'languages'],
            experience: [], education: [], skills: [], softSkills: [],
            projects: [], certs: [], languages: []
        },
        meta: JSON.parse(localStorage.getItem('resumify_v9_meta')) || {
            zoom: 100, theme: '#6366f1', fontSize: 14, layout: 'traditional', skillDisplayMode: 'mastery',
            design: {
                fontHead: "'Inter', sans-serif", fontBody: "'Inter', sans-serif",
                headingWeight: 800, spacing: 0,
                blur: 0, radius: 20, borderOp: 1
            }
        }
    },

    isRendering: false,
    activeIntelTarget: null,

    // --- INTELLIGENCE LIBRARIES ---
    libraries: {
        summary: {
            "Professional": [
                "Highly motivated professional with a strong foundation in architectural design and system optimization. Proven ability to lead cross-functional teams and deliver high-impact results under tight deadlines.",
                "Detail-oriented strategist with [X] years of experience in scaling consumer platforms. Passionate about building accessible, human-centric digital experiences.",
                "Results-driven innovator dedicated to bridging the gap between complex technology and intuitive user design."
            ],
            "Academic": [
                "Ambitious student pursuing a degree in Computer Science with a focus on Artificial Intelligence. Recognised for academic excellence and leadership in campus innovation labs.",
                "Research-focused student with deep proficiency in data analysis and predictive modeling. Committed to lifelong learning and technical growth.",
                "Creative problem-solver with a background in [Subject], seeking to leverage technical skills for societal impact."
            ]
        },
        experience: {
            "Action Points": [
                "Architected a scalable backend system using [Tech], reducing latency by 45% for 500k+ daily users.",
                "Collaborated with [Team] to deliver [Project] 2 weeks ahead of schedule, exceeding all initial KPIs.",
                "Identified critical bottlenecks in [Process] and implemented an automated solution, saving 20+ resource hours weekly.",
                "Led an initiative to improve [Metric] by 30% through rigorous data-driven experimentation.",
                "Spearheaded the UI/UX redesign of [Platform], resulting in a 20% increase in user retention."
            ]
        }
    },

    init() {
        this.cacheDOM();
        this.bindEvents();
        this.applySavedState();

        // Build dynamic editors
        ['experience', 'education', 'projects', 'certs'].forEach(type => this.renderEditorList(type));
        this.renderEditorSkills();
        this.renderEditorSoftSkills();
        this.renderEditorLanguages();

        // Initial Layout Check
        this.activeLayout = 'traditional'; // Default matches HTML
        if (this.state.meta.layout === 'bento') {
            this.rebuildDOM('bento');
        }

        this.render();
        console.log("Resumify v9.2 Layout Engine Online.");
    },

    rebuildDOM(layout) {
        if (this.activeLayout === layout && layout !== 'force') return;
        this.activeLayout = layout;
        const container = document.getElementById('paper');
        if (!container) return;

        if (layout === 'bento') {
            container.innerHTML = `
                <div class="res-page bento-grid">
                    <!-- Row 1: Profile Header (Dark Accent) -->
                    <div class="b-tile tile-intro">
                        <div>
                            <h1 class="res-name" id="p-name" style="color:white !important;"></h1>
                            <p class="res-role" id="p-role" style="color:rgba(255,255,255,0.9) !important;"></p>
                        </div>
                        <div class="b-contact-row" id="p-contact-bar" style="color:rgba(255,255,255,0.8) !important;">
                            <span id="p-email-w"><i data-lucide="mail" style="color:white;"></i> <span id="p-email"></span></span>
                            <span id="p-phone-w"><i data-lucide="phone" style="color:white;"></i> <span id="p-phone"></span></span>
                            <span id="p-loc-w"><i data-lucide="map-pin" style="color:white;"></i> <span id="p-loc"></span></span>
                        </div>
                        <div class="res-social-icons" id="p-social-icons" style="margin-top:1rem;">
                            <a id="p-link-linkedin" href="#" target="_blank" class="social-icon b-icon"><i data-lucide="linkedin"></i></a>
                            <a id="p-link-github" href="#" target="_blank" class="social-icon b-icon"><i data-lucide="github"></i></a>
                            <a id="p-link-portfolio" href="#" target="_blank" class="social-icon b-icon"><i data-lucide="globe"></i></a>
                        </div>
                    </div>

                    <!-- Row 1: Profile Photo -->
                    <div class="b-tile tile-avatar">
                        <div class="res-avatar hidden" id="p-avatar-wrap">
                            <img id="p-avatar" src="" alt="">
                        </div>
                    </div>

                    <!-- Row 2: Work & Projects -->
                    <div class="b-tile tile-exp">
                        <div class="res-sec-title">Work Experience</div>
                        <div id="p-experience"></div>
                    </div>
                    <div class="b-tile tile-proj">
                        <div class="res-sec-title">Featured Projects</div>
                        <div id="p-projects"></div>
                    </div>

                    <!-- Row 3: Education & Certifications -->
                    <div class="b-tile tile-edu">
                        <div class="res-sec-title">Education</div>
                        <div id="p-education"></div>
                    </div>
                    <div class="b-tile tile-cert" style="grid-column: span 2;">
                         <div class="res-sec-title">Certifications</div>
                         <div id="p-certs"></div>
                    </div>

                    <!-- Row 4: Skills -->
                    <div class="b-tile tile-hard">
                        <div class="res-sec-title">Technical Mastery</div>
                        <div id="p-skills" class="hard-skills-grid"></div>
                    </div>
                    <div class="b-tile tile-soft" style="grid-column: span 2;">
                        <div class="res-sec-title">Soft Qualities</div>
                        <div id="p-soft-skills" class="res-skills" style="display:flex; flex-wrap:wrap; gap:8px;"></div>
                    </div>
                    
                    <!-- Row 5: Languages -->
                    <div class="b-tile tile-lang">
                         <div class="res-sec-title">Languages & Summary</div>
                         <div style="display:flex; justify-content:space-between; gap:2rem;">
                            <!-- FIX: align-content start prevents vertical stretching, flex-wrap allows flow -->
                            <div id="p-languages" class="res-skills" style="flex:1; display:flex; flex-wrap:wrap; align-content:flex-start; gap:8px;"></div>
                            <p class="res-item-d" id="p-summary" style="flex:1; margin:0; font-size:0.85rem; opacity:0.8;"></p>
                         </div>
                    </div>
                </div>
            `;
        } else {
            // Restore Traditional
            container.innerHTML = `
            <div class="res-page">
                <header class="res-header">
                    <div style="flex:1;">
                        <h1 class="res-name" id="p-name">Your Name</h1>
                        <p class="res-role" id="p-role">Professional Title</p>
                        <div class="res-contact" id="p-contact-bar" style="margin-top: 0.8rem; padding: 0; border: none; font-size: 0.85rem;">
                            <span id="p-email-w"><i data-lucide="mail"></i> <span id="p-email"></span></span>
                            <span id="p-phone-w"><i data-lucide="phone"></i> <span id="p-phone"></span></span>
                            <span id="p-loc-w"><i data-lucide="map-pin"></i> <span id="p-loc"></span></span>
                        </div>
                    </div>
                    <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 10px;">
                        <div class="res-avatar hidden" id="p-avatar-wrap">
                            <img id="p-avatar" src="" alt="">
                        </div>
                        <div class="res-social-icons" id="p-social-icons">
                            <a id="p-link-linkedin" href="#" target="_blank" class="social-icon hidden"><i data-lucide="linkedin"></i></a>
                            <a id="p-link-github" href="#" target="_blank" class="social-icon hidden"><i data-lucide="github"></i></a>
                            <a id="p-link-portfolio" href="#" target="_blank" class="social-icon hidden"><i data-lucide="globe"></i></a>
                        </div>
                    </div>
                </header>
                <div id="preview-grid">
                    <section class="res-sec" id="p-summary-wrapper">
                        <div class="res-sec-title">Summary</div>
                        <p class="res-item-d" id="p-summary"></p>
                    </section>
                    <section class="res-sec" id="p-projects-wrapper">
                        <div class="res-sec-title">Featured Projects</div>
                        <div id="p-projects" class="proj-grid"></div>
                    </section>
                    <section class="res-sec" id="p-experience-wrapper">
                        <div class="res-sec-title">Work History</div>
                        <div id="p-experience"></div>
                    </section>
                    <section class="res-sec" id="p-education-wrapper">
                        <div class="res-sec-title">Academic History</div>
                        <div id="p-education"></div>
                    </section>
                    <section class="res-sec" id="p-certs-wrapper">
                        <div class="res-sec-title">Certifications</div>
                        <div id="p-certs" class="cert-grid"></div>
                    </section>
                    <section class="res-sec" id="p-skills-wrapper">
                        <div class="res-sec-title">Expertise Mapping</div>
                        <div class="skills-container">
                            <div class="hard-skills-box">
                                <label class="skill-label">Technical Mastery</label>
                                <div id="p-skills" class="hard-skills-grid"></div>
                            </div>
                            <div class="soft-skills-box">
                                <label class="skill-label">Soft Skills</label>
                                <div id="p-soft-skills" class="res-skills"></div>
                            </div>
                        </div>
                    </section>
                    <section class="res-sec" id="p-languages-wrapper">
                        <div class="res-sec-title">Languages Known</div>
                        <div id="p-languages" class="res-skills"></div>
                    </section>
                </div>
            </div>`;
        }

        // RE-CACHE DOM REFERENCES to ensure updates find the new elements!
        this.cacheDOM();

        // Re-run icons
        if (window.lucide) lucide.createIcons();
    },

    cacheDOM() {
        this.nodes = {
            // Static Inputs
            inName: document.getElementById('in-name'),
            inJob: document.getElementById('in-job'),
            inEmail: document.getElementById('in-email'),
            inPhone: document.getElementById('in-phone'),
            inLoc: document.getElementById('in-loc'),
            inSummary: document.getElementById('in-summary'),

            inLinkedin: document.getElementById('in-linkedin'),
            inGithub: document.getElementById('in-github'),
            inPortfolio: document.getElementById('in-portfolio'),

            // Dynamic Panels
            expEditor: document.getElementById('exp-editor'),
            eduEditor: document.getElementById('edu-editor'),
            proEditor: document.getElementById('proj-editor'),
            cerEditor: document.getElementById('cert-editor'),
            skillEditor: document.getElementById('skill-tags-ed'),
            softEditor: document.getElementById('soft-tags-ed'),
            langEditor: document.getElementById('lang-tags-ed'),

            // Preview Nodes (Static ID refs)
            pName: document.getElementById('p-name'),
            pRole: document.getElementById('p-role'),
            pEmail: document.getElementById('p-email'),
            pPhone: document.getElementById('p-phone'),
            pLoc: document.getElementById('p-loc'),
            pSummary: document.getElementById('p-summary'),
            pAvatarWrap: document.getElementById('p-avatar-wrap'),
            pAvatar: document.getElementById('p-avatar'),

            // Preview Containers
            pExp: document.getElementById('p-experience'),
            pEdu: document.getElementById('p-education'),
            pProj: document.getElementById('p-projects'),
            pCert: document.getElementById('p-certs'),
            pSkill: document.getElementById('p-skills'),
            pSoft: document.getElementById('p-soft-skills'),
            pLang: document.getElementById('p-languages'),

            // System
            avatarInput: document.getElementById('avatar-input'),
            edAvatar: document.getElementById('ed-avatar'),
            intelPanel: document.getElementById('intel-panel'),
            paper: document.getElementById('paper'),
            zoomText: document.getElementById('zoom-text'),
            strengthRing: document.getElementById('strength-ring'),
            strengthVal: document.getElementById('strength-val')
        };
    },

    bindEvents() {
        // Tab Engine
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.onclick = () => {
                if (btn.classList.contains('layout-opt')) return;
                document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.tab-pane').forEach(t => t.classList.add('hidden'));
                btn.classList.add('active');
                const target = document.getElementById(`tab-${btn.dataset.tab}`);
                if (target) target.classList.remove('hidden');
            };
        });

        // Neural Content Binding (Zero-Lag)
        const bindInput = (node, key) => {
            if (!node) return;
            node.oninput = (e) => {
                this.state.content[key] = e.target.value;
                this.renderPreviewMinimal(key);
                this.save();
            };
        };

        bindInput(this.nodes.inName, 'name');
        bindInput(this.nodes.inJob, 'job');
        bindInput(this.nodes.inEmail, 'email');
        bindInput(this.nodes.inPhone, 'phone');
        bindInput(this.nodes.inLoc, 'loc');
        bindInput(this.nodes.inSummary, 'summary');
        bindInput(this.nodes.inLinkedin, 'linkedin');
        bindInput(this.nodes.inGithub, 'github');
        bindInput(this.nodes.inPortfolio, 'portfolio');

        // Photo Handling
        const avTrigger = document.getElementById('avatar-trigger');
        if (avTrigger) avTrigger.onclick = () => this.nodes.avatarInput.click();

        this.nodes.avatarInput.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (ev) => {
                    this.state.content.avatar = ev.target.result;
                    this.nodes.edAvatar.src = ev.target.result;
                    this.nodes.edAvatar.classList.remove('hidden'); // Show in editor
                    this.render(); // Full render to update preview
                    this.save();
                };
                reader.readAsDataURL(file);
            }
        };

        // Resume Color Engine (PDF Only)
        document.querySelectorAll('.th-opt').forEach(opt => opt.onclick = () => {
            this.state.meta.theme = opt.dataset.theme; // Now stores hex directly
            this.nodes.paper.style.setProperty('--paper-accent', opt.dataset.theme);
            this.save();
        });

        const pPicker = document.getElementById('paper-accent-picker');
        if (pPicker) pPicker.oninput = (e) => {
            this.state.meta.theme = e.target.value;
            this.nodes.paper.style.setProperty('--paper-accent', e.target.value);
            this.save();
        };

        // Website Theme Engine
        document.querySelectorAll('.th-web').forEach(opt => opt.onclick = () => {
            const theme = opt.dataset.web;
            this.state.meta.webTheme = theme;
            document.body.setAttribute('data-web-theme', theme);
            this.save();
        });

        // Layout Engine
        document.querySelectorAll('.layout-opt').forEach(opt => opt.onclick = () => {
            document.querySelectorAll('.layout-opt').forEach(o => o.classList.remove('active'));
            opt.classList.add('active');

            const newLayout = opt.dataset.layout;
            this.state.meta.layout = newLayout;

            // Switch Engine
            this.rebuildDOM(newLayout);
            this.render(); // Refill data into new DOM

            document.body.className = `layout-${newLayout}`;
            document.documentElement.setAttribute('data-layout', newLayout);
            this.save();
        });

        // Font Config
        const cfgS = document.getElementById('cfg-size');
        if (cfgS) cfgS.oninput = (e) => {
            this.state.meta.fontSize = e.target.value;
            this.render();
            this.save();
        };

        // Add Logic
        document.getElementById('add-exp').onclick = () => { this.addItem('experience'); };
        document.getElementById('add-edu').onclick = () => { this.addItem('education'); };
        document.getElementById('add-proj').onclick = () => { this.addItem('projects'); };
        document.getElementById('add-cert').onclick = () => { this.addItem('certs'); };

        // Skill Entry
        const bindEnter = (id, list, rendererEd, rendererPr) => {
            const el = document.getElementById(id);
            if (el) el.onkeydown = (e) => {
                if (e.key === 'Enter' && e.target.value.trim()) {
                    if (id === 'skill-in') {
                        const parts = e.target.value.split(':');
                        this.state.content.skills.push({ name: parts[0].trim(), level: parts[1] ? parseInt(parts[1]) : 85 });
                    } else {
                        this.state.content[list].push(e.target.value.trim());
                    }
                    e.target.value = '';
                    rendererEd.call(this); rendererPr.call(this); this.save();
                }
            };
        };
        bindEnter('skill-in', 'skills', this.renderEditorSkills, this.renderPreviewSkills);
        bindEnter('soft-in', 'softSkills', this.renderEditorSoftSkills, this.renderPreviewSoftSkills);
        bindEnter('lang-in', 'languages', this.renderEditorLanguages, this.renderPreviewLanguages);

        // Skill Mode Toggle
        document.querySelectorAll('.skill-mode-btn').forEach(btn => {
            btn.onclick = () => {
                document.querySelectorAll('.skill-mode-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.state.meta.skillDisplayMode = btn.dataset.mode;
                this.renderPreviewSkills();
                this.save();
            };
        });

        // Clear Data
        const clearBtn = document.getElementById('btn-clear-all');
        if (clearBtn) clearBtn.onclick = () => {
            if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
                localStorage.removeItem('resumify_v9_content');
                localStorage.removeItem('resumify_v9_meta');
                location.reload();
            }
        };

        // HUD
        document.getElementById('zoom-in').onclick = () => this.zoom(10);
        document.getElementById('zoom-out').onclick = () => this.zoom(-10);
        document.getElementById('btn-print').onclick = () => this.print();

        // Intel
        document.querySelectorAll('.phrase-trigger').forEach(btn => btn.onclick = () => this.openIntel(btn.dataset.target, btn.dataset.target));
        const closeI = document.getElementById('close-intel');
        if (closeI) closeI.onclick = () => this.nodes.intelPanel.classList.add('hidden');

        // --- NEW DESIGN ENGINE BINDINGS ---

        // 1. Typography Manager
        const fSelect = document.getElementById('font-pair-select');
        if (fSelect) fSelect.onchange = (e) => {
            const root = document.documentElement;
            // Ensure design obj exists if legacy state
            if (!this.state.meta.design) this.state.meta.design = { fontHead: "'Inter', sans-serif", fontBody: "'Roboto', sans-serif" };

            switch (e.target.value) {
                case 'modern':
                    this.state.meta.design.fontHead = "'Inter', sans-serif";
                    this.state.meta.design.fontBody = "'Roboto', sans-serif";
                    break;
                case 'classic':
                    this.state.meta.design.fontHead = "'Playfair Display', serif";
                    this.state.meta.design.fontBody = "'Source Sans 3', sans-serif";
                    break;
                case 'tech':
                    this.state.meta.design.fontHead = "'JetBrains Mono', monospace";
                    this.state.meta.design.fontBody = "'Plus Jakarta Sans', sans-serif";
                    break;
            }
            root.style.setProperty('--font-head', this.state.meta.design.fontHead);
            root.style.setProperty('--font-body', this.state.meta.design.fontBody);
            this.save();
        };

        const wRange = document.getElementById('range-weight');
        if (wRange) wRange.oninput = (e) => {
            document.documentElement.style.setProperty('--heading-weight', e.target.value);
            document.getElementById('val-weight').innerText = e.target.value;
            if (!this.state.meta.design) this.state.meta.design = {};
            this.state.meta.design.headingWeight = e.target.value;
            this.save();
        };

        const sRange = document.getElementById('range-spacing');
        if (sRange) sRange.oninput = (e) => {
            document.documentElement.style.setProperty('--letter-spacing', `${e.target.value}px`);
            if (!this.state.meta.design) this.state.meta.design = {};
            this.state.meta.design.spacing = e.target.value;
            this.save();
        };

        // 2. Aesthetics Controller
        const bRange = document.getElementById('range-blur');
        if (bRange) bRange.oninput = (e) => {
            document.documentElement.style.setProperty('--ui-blur', `${e.target.value}px`);
            if (!this.state.meta.design) this.state.meta.design = {};
            this.state.meta.design.blur = e.target.value;
            this.save();
        };

        const rRange = document.getElementById('range-radius');
        if (rRange) rRange.oninput = (e) => {
            document.documentElement.style.setProperty('--ui-radius', `${e.target.value}px`);
            if (!this.state.meta.design) this.state.meta.design = {};
            this.state.meta.design.radius = e.target.value;
            this.save();
        };

        const oRange = document.getElementById('range-border');
        if (oRange) oRange.oninput = (e) => {
            document.documentElement.style.setProperty('--ui-border-op', e.target.value);
            if (!this.state.meta.design) this.state.meta.design = {};
            this.state.meta.design.borderOp = e.target.value;
            this.save();
        };

        const aPicker = document.getElementById('accent-picker'); // Deprecated but kept safe
        if (aPicker) aPicker.oninput = (e) => {
            // Legacy hook
        };

        // 3. Reorder Logic
        const btnSwap = document.getElementById('btn-swap-layout');
        if (btnSwap) btnSwap.onclick = () => {
            const page = this.nodes.paper.querySelector('.bento-grid');
            if (page) {
                page.classList.toggle('reorder-alt');
                this.showToast("Layout Swapped Successfully! ⚡");
            } else {
                this.showToast("Switch to Bento Layout first! ⚠️");
            }
        };
    },

    addItem(type) {
        const id = Date.now();
        let item = { id, title: '', sub: '', desc: '' };
        if (type === 'projects') item.tech = '';
        this.state.content[type].push(item);
        this.renderEditorList(type);
        this.renderPreviewList(type);
        this.save();
    },

    render() {
        const { content, meta } = this.state;

        // Static Updates
        if (this.nodes.pName) this.nodes.pName.innerText = content.name || 'Your Name';
        if (this.nodes.pRole) this.nodes.pRole.innerText = content.job || 'Professional Title';
        if (this.nodes.pEmail) this.nodes.pEmail.innerText = content.email;
        if (this.nodes.pPhone) this.nodes.pPhone.innerText = content.phone;
        if (this.nodes.pLoc) this.nodes.pLoc.innerText = content.loc;
        if (this.nodes.pSummary) this.nodes.pSummary.innerText = content.summary;

        // Toggles
        ['email', 'phone', 'loc', 'summary'].forEach(f => {
            const w = document.getElementById(`p-${f}${f === 'summary' ? '-wrapper' : '-w'}`);
            if (w) w.classList.toggle('hidden', !content[f]);
        });

        // Socials
        ['linkedin', 'github', 'portfolio'].forEach(s => {
            const el = document.getElementById(`p-link-${s}`);
            if (el) {
                el.classList.toggle('hidden', !content[s]);
                if (content[s]) el.href = content[s].startsWith('http') ? content[s] : `https://${content[s]}`;
            }
        });

        // Avatar
        if (content.avatar) {
            if (this.nodes.pAvatar) this.nodes.pAvatar.src = content.avatar;
            if (this.nodes.pAvatarWrap) this.nodes.pAvatarWrap.classList.remove('hidden');
            if (this.nodes.edAvatar) this.nodes.edAvatar.src = content.avatar;
            if (this.nodes.edAvatar) this.nodes.edAvatar.classList.remove('hidden');
        } else {
            if (this.nodes.pAvatarWrap) this.nodes.pAvatarWrap.classList.add('hidden');
        }

        // Font Scale
        if (this.nodes.paper) this.nodes.paper.style.fontSize = `${meta.fontSize}px`;

        // Dynamic Sections
        this.renderPreviewList('experience');
        this.renderPreviewList('education');
        this.renderPreviewList('projects');
        this.renderPreviewList('certs');

        this.renderPreviewSkills();
        this.renderPreviewSoftSkills();
        this.renderPreviewLanguages();

        this.updateStrength();
        if (window.lucide) lucide.createIcons();
    },

    renderPreviewMinimal(key) {
        const { content } = this.state;
        const pId = key === 'job' ? 'p-role' : `p-${key}`;
        const pNode = document.getElementById(pId);
        if (pNode) pNode.innerText = content[key] || '';

        const wId = `p-${key}${key === 'summary' ? '-wrapper' : '-w'}`;
        const w = document.getElementById(wId);
        if (w) w.classList.toggle('hidden', !content[key]);

        // Link handling
        if (['linkedin', 'github', 'portfolio'].includes(key)) {
            const el = document.getElementById(`p-link-${key}`);
            if (el) {
                el.classList.toggle('hidden', !content[key]);
                if (content[key]) el.href = content[key].startsWith('http') ? content[key] : `https://${content[key]}`;
            }
        }

        this.updateStrength();
    },

    renderPreviewList(type) {
        let containerName = type.substring(0, 3);
        if (type === 'experience') containerName = 'pExp';
        if (type === 'education') containerName = 'pEdu';
        if (type === 'projects') containerName = 'pProj';
        if (type === 'certs') containerName = 'pCert';

        const container = this.nodes[containerName];
        if (!container) return;
        container.innerHTML = '';

        this.state.content[type].forEach(item => {
            const el = document.createElement('div');
            // UNIFIED LAYOUT: All sections now use the rich block design
            el.className = 'res-item';
            el.innerHTML = `
                <div class="res-item-h">${item.title}</div>
                ${item.sub ? `<div class="res-item-s">${item.sub}</div>` : ''}
                <div class="res-item-d">${item.desc}</div>
             `;
            container.appendChild(el);
        });
    },

    renderEditorList(type) {
        const data = this.state.content[type];
        const editPanel = this.nodes[`${type.substring(0, 3)}Editor`];
        editPanel.innerHTML = '';

        data.forEach(item => {
            const wrap = document.createElement('div');
            wrap.className = 'f-wrap';
            wrap.style.cssText = 'border:1px solid var(--ui-border); padding:1rem; border-radius:12px; margin-bottom:1rem; position:relative;';

            // UNIFIED EDITOR: All sections get Title, Subtitle, and Description inputs
            wrap.innerHTML = `
                <button class="del" style="position:absolute; top:8px; right:12px; background:none; border:none; color:#f43f5e; cursor:pointer;"><i data-lucide="minus-circle" style="width:16px;"></i></button>
                ${type === 'experience' ? `<i data-lucide="wand-2" class="phrase-trigger" data-target="exp-desc-${item.id}" style="position:absolute; bottom:12px; right:42px; width:12px; opacity:0.3; cursor:pointer;"></i>` : ''}
                <input type="text" class="ed-t" placeholder="Primary Title (e.g. Project Name)" value="${item.title}" style="border:none; background:transparent; font-weight:700;">
                <input type="text" class="ed-s" placeholder="Subtitle (e.g. Tech Stack / Date)" value="${item.sub || ''}" style="border:none; background:transparent; font-size:0.8rem; color:var(--ui-accent);">
                <textarea class="ed-d" placeholder="Description" rows="3" style="border:none; background:transparent; font-size:0.8rem; color:var(--ui-text-dim); margin-top:0.5rem; border-top:1px solid var(--ui-border); padding-top:0.5rem; border-radius:12px;">${item.desc}</textarea>
            `;

            wrap.querySelectorAll('input, textarea').forEach(inp => {
                inp.oninput = () => {
                    item.title = wrap.querySelector('.ed-t').value;
                    item.desc = wrap.querySelector('.ed-d').value;
                    item.sub = wrap.querySelector('.ed-s').value;
                    this.renderPreviewList(type);
                    this.save();
                };
            });

            wrap.querySelector('.del').onclick = () => {
                this.state.content[type] = this.state.content[type].filter(i => i.id !== item.id);
                this.renderPreviewList(type); this.renderEditorList(type); this.save();
            };
            if (type === 'experience') wrap.querySelector('.phrase-trigger').onclick = () => this.openIntel('experience', `exp-desc-${item.id}`);
            editPanel.appendChild(wrap);
        });
        if (window.lucide) lucide.createIcons();
    },

    renderPreviewSkills() {
        this.nodes.pSkill.innerHTML = '';
        const mode = this.state.meta.skillDisplayMode || 'mastery';

        if (mode === 'mastery') {
            this.nodes.pSkill.className = 'hard-skills-grid';
            this.state.content.skills.forEach(s => {
                const el = document.createElement('div');
                el.className = 'hard-skill-item';
                el.innerHTML = `
                    <div class="h-skill-info"><span>${s.name}</span><span>${s.level}%</span></div>
                    <div class="progress-bg"><div class="progress-fill" style="width:${s.level}%"></div></div>
                `;
                this.nodes.pSkill.appendChild(el);
            });
        } else {
            this.nodes.pSkill.className = 'res-skills';
            this.state.content.skills.forEach(s => {
                const tag = document.createElement('div');
                tag.className = 'res-skill-tag';
                tag.innerText = s.name;
                this.nodes.pSkill.appendChild(tag);
            });
        }
    },

    renderEditorSkills() {
        this.nodes.skillEditor.innerHTML = '';
        this.state.content.skills.forEach((s, idx) => {
            const t = document.createElement('div');
            t.className = 'res-skill-tag'; t.style.background = 'var(--ui-accent)'; t.style.color = 'white'; t.style.display = 'flex'; t.style.alignItems = 'center'; t.style.gap = '8px';
            t.innerHTML = `${s.name}:${s.level}% <span class="del-tag" style="cursor:pointer; display:flex;"><i data-lucide="x" style="width:12px;"></i></span>`;
            this.nodes.skillEditor.appendChild(t);
            t.querySelector('.del-tag').onclick = () => { this.state.content.skills.splice(idx, 1); this.renderEditorSkills(); this.renderPreviewSkills(); this.save(); };
        });
        if (window.lucide) lucide.createIcons();
    },

    renderPreviewSoftSkills() {
        this.nodes.pSoft.innerHTML = '';
        this.state.content.softSkills.forEach(s => {
            const tag = document.createElement('div');
            tag.className = 'res-skill-tag'; tag.innerText = s;
            this.nodes.pSoft.appendChild(tag);
        });
    },

    renderEditorSoftSkills() {
        this.nodes.softEditor.innerHTML = '';
        this.state.content.softSkills.forEach((s, idx) => {
            const t = document.createElement('div');
            t.className = 'res-skill-tag'; t.style.background = '#8b5cf6'; t.style.color = 'white'; t.style.display = 'flex'; t.style.alignItems = 'center'; t.style.gap = '8px';
            t.innerHTML = `${s} <span class="del-tag" style="cursor:pointer; display:flex;"><i data-lucide="x" style="width:12px;"></i></span>`;
            this.nodes.softEditor.appendChild(t);
            t.querySelector('.del-tag').onclick = () => { this.state.content.softSkills.splice(idx, 1); this.renderEditorSoftSkills(); this.renderPreviewSoftSkills(); this.save(); };
        });
        if (window.lucide) lucide.createIcons();
    },

    renderPreviewLanguages() {
        this.nodes.pLang.innerHTML = '';
        this.state.content.languages.forEach(l => {
            const t = document.createElement('div');
            t.className = 'res-skill-tag'; t.innerText = l;
            this.nodes.pLang.appendChild(t);
        });
    },

    renderEditorLanguages() {
        this.nodes.langEditor.innerHTML = '';
        this.state.content.languages.forEach((l, idx) => {
            const t = document.createElement('div');
            t.className = 'res-skill-tag'; t.style.background = '#10b981'; t.style.color = 'white'; t.style.display = 'flex'; t.style.alignItems = 'center'; t.style.gap = '8px';
            t.innerHTML = `${l} <span class="del-tag" style="cursor:pointer; display:flex;"><i data-lucide="x" style="width:12px;"></i></span>`;
            this.nodes.langEditor.appendChild(t);
            t.querySelector('.del-tag').onclick = () => { this.state.content.languages.splice(idx, 1); this.renderEditorLanguages(); this.renderPreviewLanguages(); this.save(); };
        });
        if (window.lucide) lucide.createIcons();
    },

    updateStrength() {
        const { content } = this.state;
        let score = 0;
        ['name', 'job', 'email', 'phone', 'summary', 'linkedin'].forEach(f => { if (content[f]) score++; });
        if (content.experience.length > 0) score++;
        if (content.projects.length > 0) score++;
        if (content.skills.length >= 3) score++;
        if (content.languages.length >= 1) score++;

        const pct = Math.round((score / 10) * 100);
        if (this.nodes.strengthVal) this.nodes.strengthVal.innerText = `${pct}%`;
        if (this.nodes.strengthRing) this.nodes.strengthRing.style.strokeDashoffset = 88 - (pct / 100 * 88);

        // Gamification System
        const old = this.previousScore || 0;
        if (old < 50 && pct >= 50) this.showToast("<strong>50% Completed</strong> &nbsp; You're halfway away!");
        if (old < 75 && pct >= 75) this.showToast("<strong>75% Completed</strong> &nbsp; You're almost there!");
        if (old < 100 && pct >= 100) {
            this.showToast("<strong>Reached 100%</strong> &nbsp; Congratulations!");
            if (window.confetti) confetti({ particleCount: 150, spread: 60 });
        }
        this.previousScore = pct;
    },

    zoom(val) {
        this.state.meta.zoom = Math.min(150, Math.max(40, this.state.meta.zoom + val));
        if (this.nodes.zoomText) this.nodes.zoomText.innerText = `${this.state.meta.zoom}%`;
        if (this.nodes.paper) this.nodes.paper.style.transform = `scale(${this.state.meta.zoom / 100})`;
        this.save();
    },

    print() {
        const btn = document.getElementById('btn-print');
        const orig = btn.innerHTML;
        btn.innerHTML = 'GENERATING...';

        // 1. Snapshot State
        const currentZoom = this.state.meta.zoom;
        const originalBg = this.nodes.paper.style.backgroundImage;
        const originalShadow = this.nodes.paper.style.boxShadow;
        const originalMargin = this.nodes.paper.style.margin;
        const originalMinHeight = this.nodes.paper.style.minHeight;
        const originalHeight = this.nodes.paper.style.height;

        // 2. Normalize for PDF (Zero external interference)
        this.nodes.paper.style.transform = 'scale(1)';
        this.nodes.paper.style.backgroundImage = 'none';
        this.nodes.paper.style.boxShadow = 'none';
        this.nodes.paper.style.margin = '0';
        this.nodes.paper.style.borderRadius = '0';

        // CRITICAL FIX: Allow content to dictate height exactly to avoid 1px overflow
        this.nodes.paper.style.minHeight = '0';
        this.nodes.paper.style.height = 'auto';
        this.nodes.paper.style.border = 'none';
        this.nodes.paper.style.outline = 'none';
        this.nodes.paper.style.padding = '0';

        // Snapshot and reset INTERNAL page styles (the A4 container)
        const internalPage = this.nodes.paper.querySelector('.res-page');
        let originalPageHeight = '';
        let originalPageMinHeight = '';
        let originalPageShadow = '';
        let originalPageMargin = '';

        if (internalPage) {
            originalPageHeight = internalPage.style.height;
            originalPageMinHeight = internalPage.style.minHeight;
            originalPageShadow = internalPage.style.boxShadow;
            originalPageMargin = internalPage.style.margin;

            // Force strict auto height
            internalPage.style.height = 'auto';
            internalPage.style.minHeight = '0';
            internalPage.style.boxShadow = 'none';
            internalPage.style.margin = '0';
        }

        const opt = {
            margin: 0, // Zero margins to fit exact A4 content if sized correctly
            filename: `${this.state.content.name || 'Resume'}_Professional.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: {
                scale: 2,
                useCORS: true,
                scrollY: 0,
                letterRendering: true
            },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
            pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
        };

        html2pdf().set(opt).from(this.nodes.paper).save().then(() => {
            // 4. Restore State
            this.nodes.paper.style.transform = `scale(${currentZoom / 100})`;
            this.nodes.paper.style.backgroundImage = originalBg;
            this.nodes.paper.style.boxShadow = originalShadow;
            this.nodes.paper.style.margin = originalMargin;
            this.nodes.paper.style.minHeight = originalMinHeight;
            this.nodes.paper.style.height = originalHeight;

            if (internalPage) {
                internalPage.style.height = originalPageHeight;
                internalPage.style.minHeight = originalPageMinHeight;
                internalPage.style.boxShadow = originalPageShadow;
                internalPage.style.margin = originalPageMargin;
            }

            if (window.lucide) lucide.createIcons();

            btn.innerHTML = orig; // Restore button text

            // Confetti Explosion
            if (window.confetti) {
                const count = 200;
                const defaults = { origin: { y: 0.7 } };
                function fire(particleRatio, opts) {
                    confetti(Object.assign({}, defaults, opts, {
                        particleCount: Math.floor(count * particleRatio)
                    }));
                }
                fire(0.25, { spread: 26, startVelocity: 55 });
                fire(0.2, { spread: 60 });
                fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
                fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
                fire(0.1, { spread: 120, startVelocity: 45 });
            }

            this.showToast("Resume Downloaded Successfully! 📄");
        });
    },

    showToast(msg) {
        const container = document.getElementById('toast-container');
        if (!container) return;
        const div = document.createElement('div');
        div.className = 'toast-msg';
        div.innerHTML = `<span>${msg}</span>`;
        container.appendChild(div);
        if (window.lucide) lucide.createIcons();

        // Remove after 3s
        setTimeout(() => {
            div.classList.add('out');
            setTimeout(() => div.remove(), 500);
        }, 3000);
    },

    applySavedState() {
        const { content, meta } = this.state;
        this.nodes.inName.value = content.name;
        this.nodes.inJob.value = content.job;
        this.nodes.inEmail.value = content.email;
        this.nodes.inPhone.value = content.phone;
        this.nodes.inLoc.value = content.loc;
        this.nodes.inSummary.value = content.summary;
        this.nodes.inLinkedin.value = content.linkedin;
        this.nodes.inGithub.value = content.github;
        this.nodes.inPortfolio.value = content.portfolio;

        // Apply Theme specifically to the PDF Preview Container only (as requested)
        if (this.nodes.paper) {
            // Apply the color strictly to the paper variable
            this.nodes.paper.style.setProperty('--paper-accent', meta.theme);
        }

        // Apply Website Theme Independent of PDF
        if (meta.webTheme) {
            document.body.setAttribute('data-web-theme', meta.webTheme);
        }

        // Handle Layout Class (Body Class) without disrupting Attributes
        if (meta.layout) {
            // We use classList to avoid wiping other classes if any
            document.body.classList.remove('layout-traditional', 'layout-bento');
            document.body.classList.add(`layout-${meta.layout}`);
        }
        document.documentElement.setAttribute('data-layout', meta.layout);

        // Restore skill display mode
        const mode = meta.skillDisplayMode || 'mastery';
        document.querySelectorAll('.skill-mode-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });

        // Restore Design Engine State
        if (meta.design) {
            const r = document.documentElement.style;
            if (meta.design.fontHead) r.setProperty('--font-head', meta.design.fontHead);
            if (meta.design.fontBody) r.setProperty('--font-body', meta.design.fontBody);
            if (meta.design.headingWeight) {
                r.setProperty('--heading-weight', meta.design.headingWeight);
                const wInput = document.getElementById('range-weight');
                if (wInput) wInput.value = meta.design.headingWeight;
                const wVal = document.getElementById('val-weight');
                if (wVal) wVal.innerText = meta.design.headingWeight;
            }
            if (meta.design.spacing) {
                r.setProperty('--letter-spacing', `${meta.design.spacing}px`);
                const sInput = document.getElementById('range-spacing');
                if (sInput) sInput.value = meta.design.spacing;
            }
            if (meta.design.blur) {
                r.setProperty('--ui-blur', `${meta.design.blur}px`);
                const bInput = document.getElementById('range-blur');
                if (bInput) bInput.value = meta.design.blur;
            }
            if (meta.design.radius) {
                r.setProperty('--ui-radius', `${meta.design.radius}px`);
                const rInput = document.getElementById('range-radius');
                if (rInput) rInput.value = meta.design.radius;
            }
            if (meta.design.borderOp) {
                r.setProperty('--ui-border-op', meta.design.borderOp);
                const oInput = document.getElementById('range-border');
                if (oInput) oInput.value = meta.design.borderOp;
            }
        }

        this.zoom(0);
    },

    save() {
        localStorage.setItem('resumify_v9_content', JSON.stringify(this.state.content));
        localStorage.setItem('resumify_v9_meta', JSON.stringify(this.state.meta));
    },

    openIntel(niche, target) {
        this.activeIntelTarget = target;
        const panel = this.nodes.intelPanel;
        const menu = document.getElementById('intel-niches');
        const lib = niche === 'summary' ? 'summary' : 'experience';
        const data = this.libraries[lib];

        menu.innerHTML = '';
        Object.keys(data).forEach((k, idx) => {
            const b = document.createElement('button');
            b.className = `niche-btn ${idx === 0 ? 'active' : ''}`;
            b.innerText = k;
            b.onclick = () => {
                document.querySelectorAll('.niche-btn').forEach(nb => nb.classList.remove('active'));
                b.classList.add('active');
                this.renderPhrases(data[k], niche);
            };
            menu.appendChild(b);
        });

        this.renderPhrases(data[Object.keys(data)[0]], niche);
        panel.classList.remove('hidden');
    },

    renderPhrases(phrases, niche) {
        const list = document.getElementById('intel-phrases');
        list.innerHTML = '';
        phrases.forEach(phrase => {
            const card = document.createElement('div');
            card.className = 'phrase-card'; card.innerText = phrase;
            card.onclick = () => {
                if (niche === 'summary') {
                    this.nodes.inSummary.value += (this.nodes.inSummary.value ? '\n' : '') + phrase;
                    this.state.content.summary = this.nodes.inSummary.value;
                    this.renderPreviewMinimal('summary'); // Direct update
                } else {
                    const itemId = this.activeIntelTarget.split('-')[2];
                    const item = this.state.content.experience.find(i => i.id == itemId);
                    if (item) item.desc += (item.desc ? '\n' : '') + phrase;
                    this.renderEditorList('experience');
                    this.renderPreviewList('experience'); // Direct update
                }
                this.save();
            };
            list.appendChild(card);
        });
    }
};

document.addEventListener('DOMContentLoaded', () => Resumify.init());
