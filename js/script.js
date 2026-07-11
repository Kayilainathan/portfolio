document.addEventListener('DOMContentLoaded', () => {

            // ================================================================
            // LENIS — Smooth scroll initialization
            // Remove this block if you don't want smooth scrolling.
            // ================================================================
            window.lenis = null;

            // Only use Lenis on desktop (non-touch) devices.
            // On mobile (Chrome, Samsung, Safari), Lenis touch listeners interfere
            // with the browser's native scroll pipeline causing scroll to break.
            // Native scroll + CSS scroll-behavior:smooth is butter-smooth on mobile.
            const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

            if (typeof Lenis !== 'undefined' && !isTouchDevice) {
                window.lenis = new Lenis({
                    lerp: 0.075, // butter-smooth glide inertia on desktop
                    easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                    smooth: true,
                    smoothTouch: false,
                    infinite: false,
                    normalizeWheel: true,
                    gestureOrientation: 'vertical',
                });

                // Persistent RAF loop — never self-cancels
                (function lenisRaf(time) {
                    if (window.lenis) window.lenis.raf(time);
                    requestAnimationFrame(lenisRaf);
                })(performance.now());
            }

            // Helper: smooth scroll to an element with Lenis or fallback
            function scrollTo(el, offset = -80) {
                if (window.lenis) {
                    window.lenis.scrollTo(el, { offset, duration: 1.2 });
                } else {
                    // Native mobile scroll — accounts for fixed header offset
                    const top = el.getBoundingClientRect().top + window.scrollY + offset;
                    window.scrollTo({ top, behavior: 'smooth' });
                }
            }


            // ================================================================
            // CUSTOM CURSOR — Dot snaps; ring follows with smooth lag
            // ================================================================
            const cursorDot = document.getElementById('cursor-dot');
            const cursorRing = document.getElementById('cursor-ring');

            // Current mouse position (dot snaps here)
            let mx = window.innerWidth / 2;
            let my = window.innerHeight / 2;

            // Ring's current interpolated position
            let rx = mx, ry = my;

            // Update mouse position on every mouse move
            document.addEventListener('mousemove', e => {
                mx = e.clientX;
                my = e.clientY;
                // Dot follows instantly
                cursorDot.style.left = mx + 'px';
                cursorDot.style.top = my + 'px';
                
                // Failsafe: Ensure visible on first movement
                if (cursorDot.style.opacity === '0' || cursorDot.style.opacity === '') {
                    cursorDot.style.opacity = '1';
                    cursorRing.style.opacity = '1';
                }
            });

            // Animate ring with LERP each frame
            (function ringLoop() {
                // !! EDIT: Change 0.12 for faster (higher) or slower (lower) ring lag
                rx += (mx - rx) * 0.12;
                ry += (my - ry) * 0.12;
                cursorRing.style.left = rx + 'px';
                cursorRing.style.top = ry + 'px';
                requestAnimationFrame(ringLoop);
            })();

            // Expand ring when hovering interactive elements
            const hoverEls = document.querySelectorAll(
                'a, button, .tilt-card, .tag, .nav-link, [role="button"], .connect-btn'
            );
            hoverEls.forEach(el => {
                el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
                el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
            });

            // Fade cursor out when leaving/entering page
            document.addEventListener('mouseleave', () => {
                cursorDot.style.opacity = '0';
                cursorRing.style.opacity = '0';
            });
            document.addEventListener('mouseenter', () => {
                cursorDot.style.opacity = '1';
                cursorRing.style.opacity = '1';
            });


            // ================================================================
            // NAVIGATION — Show pill after scroll; track active section
            // ================================================================
            const navPill = document.getElementById('navPill');
            const navIndicator = document.getElementById('navIndicator');
            const navLinks = document.querySelectorAll('.nav-link');
            const scrollNudge = document.getElementById('scrollNudge');
            const sections = Array.from(document.querySelectorAll('.section[id]'));

            // ---- Sliding indicator LERP physics ----
            let indL = 0, indW = 0;          // Current position (animated)
            let indTL = 0, indTW = 0;        // Target position
            let indReady = false;

            // Move indicator target to a specific link element
            function setIndicatorTarget(link) {
                indTL = link.offsetLeft;
                indTW = link.offsetWidth;
            }

            // Animate indicator toward target each frame
            (function indicatorLoop() {
                if (!indReady && indTW > 0) {
                    // Snap on first run
                    indL = indTL; indW = indTW; indReady = true;
                } else if (indReady) {
                    // !! EDIT: 0.16 = responsiveness of indicator slide
                    indL += (indTL - indL) * 0.16;
                    indW += (indTW - indW) * 0.16;
                }
                navIndicator.style.cssText = `left:${indL}px; width:${indW}px; height:32px; top:4px;`;
                requestAnimationFrame(indicatorLoop);
            })();

            // Hover: temporarily move indicator to hovered link
            navLinks.forEach(link => {
                link.addEventListener('mouseenter', () => setIndicatorTarget(link));
            });

            // Mouse leaves pill: restore to active section
            navPill.addEventListener('mouseleave', () => {
                const active = navPill.querySelector('.nav-link.active');
                if (active) setIndicatorTarget(active);
            });

            // Scroll event: show/hide pill, track active section
            window.addEventListener('scroll', () => {
                const sy = window.scrollY;

                // Show nav pill after scrolling 80px
                navPill.classList.toggle('visible', sy > 80);

                // Hide scroll nudge once user scrolls past hero
                // Only toggle hidden AFTER appeared is set, so the element is
                // properly interactive before hiding is ever considered.
                if (scrollNudge && scrollNudge.classList.contains('appeared')) {
                    scrollNudge.classList.toggle('hidden', sy > 60);
                }

                // Active section: pick the last section whose top is within the
                // top 40% of the viewport. For the last section we also check
                // if the user is within 80px of the page bottom so connect
                // always activates when reached.
                const viewH = window.innerHeight;
                const pageH = document.documentElement.scrollHeight;
                const atBottom = sy + viewH >= pageH - 80;

                let current = '';
                sections.forEach(sec => {
                    const top = sec.getBoundingClientRect().top;
                    if (top <= viewH * 0.45) current = sec.id;
                });

                // Force the last section active when at the page bottom
                if (atBottom && sections.length) {
                    current = sections[sections.length - 1].id;
                }

                // Apply .active class and update indicator
                navLinks.forEach(link => {
                    const isActive = link.dataset.section === current;
                    link.classList.toggle('active', isActive);
                    if (isActive) setIndicatorTarget(link);
                });

                // Update mobile nav toggle accent color based on scrolling position
                const sectionAccents = {
                    'hero': '#00ffb7',         // mint green
                    'about': '#a78bfa',        // purple
                    'skills': '#f43f5e',       // rose
                    'projects': 'var(--active-accent, #00ffb7)', // dynamic project accent
                    'experience': '#00c9a7',   // emerald
                    'connect': '#ec4899'       // pink
                };
                const toggleColor = sectionAccents[current] || '#00ffb7';
                document.documentElement.style.setProperty('--toggle-accent', toggleColor);

                const mobSecTitle = document.getElementById('mobileSectionTitle');
                if (mobSecTitle) {
                    if (current && current !== 'hero') {
                        mobSecTitle.textContent = current.toUpperCase();
                        mobSecTitle.style.opacity = '0.85';
                    } else {
                        mobSecTitle.textContent = '';
                        mobSecTitle.style.opacity = '0';
                    }
                }
            });

            // Smooth scroll when clicking nav links
            navLinks.forEach(link => {
                link.addEventListener('click', e => {
                    e.preventDefault();

                    // If mobile nav container is open, close it first to resume Lenis scroll
                    const navCont = document.getElementById('nav');
                    if (navCont && navCont.classList.contains('open')) {
                        setDrawerState(false);
                    }

                    const target = document.querySelector(link.getAttribute('href'));
                    if (!target) return;

                    const isLast = target === sections[sections.length - 1];

                    // Delay slightly to allow the drawer close transition and Lenis resumption
                    setTimeout(() => {
                        scrollTo(target, isLast ? 0 : -80);
                    }, 80);
                });
            });

            // Scroll nudge — class-driven appear + click
            if (scrollNudge) {
                // Trigger the entry transition after the page settles (1.2s)
                setTimeout(() => {
                    scrollNudge.classList.add('appeared');
                }, 1200);

                scrollNudge.addEventListener('click', e => {
                    e.preventDefault();
                    const about = document.getElementById('about');
                    if (about) scrollTo(about, -80);
                });
            }

            // Trigger scroll once on load to set initial state
            window.dispatchEvent(new Event('scroll'));


            // ================================================================
            // MOBILE NAVIGATION TOGGLE INTERACTION & SWIPE REDESIGN
            // ================================================================
            const mobileNavToggle = document.getElementById('mobileNavToggle');
            const navContainer = document.getElementById('nav');
            const navOverlay = document.getElementById('navOverlay');

            if (mobileNavToggle && navPill && navContainer) {
                // Function to set drawer state
                function setDrawerState(open) {
                    navContainer.classList.toggle('open', open);
                    navPill.classList.toggle('open', open);
                    mobileNavToggle.classList.toggle('active', open);
                    mobileNavToggle.setAttribute('aria-expanded', open ? 'true' : 'false');

                    // Lock body scroll and pause Lenis smooth scrolling when drawer is active
                    if (open) {
                        document.body.style.overflow = 'hidden';
                        if (window.lenis) window.lenis.stop();
                    } else {
                        document.body.style.overflow = '';
                        if (window.lenis) window.lenis.start();
                    }
                }

                // Toggle click handler
                mobileNavToggle.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const isOpen = !navContainer.classList.contains('open');
                    setDrawerState(isOpen);
                });

                // Close drawer when clicking overlay
                navOverlay?.addEventListener('click', () => setDrawerState(false));

                // Close drawer when clicking any navigation link (handled unified above)

                // Close drawer when clicking outside nav pill and toggle
                document.addEventListener('click', (e) => {
                    if (navContainer.classList.contains('open') &&
                        !navPill.contains(e.target) &&
                        !mobileNavToggle.contains(e.target)) {
                        setDrawerState(false);
                    }
                });

                // ---- Touch Swipe Gesture Support for Native feel ----
                let touchStartX = 0;
                let touchStartY = 0;
                let touchMoveX = 0;
                let touchMoveY = 0;

                navContainer.addEventListener('touchstart', (e) => {
                    touchStartX = e.touches[0].clientX;
                    touchStartY = e.touches[0].clientY;
                }, { passive: true });

                navContainer.addEventListener('touchmove', (e) => {
                    touchMoveX = e.touches[0].clientX;
                    touchMoveY = e.touches[0].clientY;
                }, { passive: true });

                navContainer.addEventListener('touchend', () => {
                    if (!navContainer.classList.contains('open')) return;

                    const deltaX = touchMoveX - touchStartX;
                    const deltaY = touchMoveY - touchStartY;

                    // Swipe right to dismiss drawer: deltaX > 60px, deltaY < 30px
                    if (deltaX > 60 && Math.abs(deltaY) < 30) {
                        setDrawerState(false);
                    }

                    // reset touch values
                    touchStartX = 0;
                    touchStartY = 0;
                    touchMoveX = 0;
                    touchMoveY = 0;
                }, { passive: true });
            }


            // ================================================================
            // BRAND LOGO — Back to top + scroll progress ring
            // ================================================================
            const brand = document.getElementById('brand');
            const ringFill = document.getElementById('brandRingFill');

            // Circumference = 2 * PI * r = 2 * 3.14159 * 23 ≈ 144.51
            const CIRC = 2 * Math.PI * 23;

            // Update ring fill offset based on scroll position
            (function progressLoop() {
                const scrolled = window.scrollY;
                const total = document.documentElement.scrollHeight - window.innerHeight;
                const pct = total > 0 ? scrolled / total : 0;
                if (ringFill) ringFill.style.strokeDashoffset = CIRC * (1 - pct);
                requestAnimationFrame(progressLoop);
            })();

            // Click K to scroll back to top
            if (brand) {
                brand.addEventListener('click', () => {
                    if (window.lenis) window.lenis.scrollTo(0, { duration: 1.2 });
                    else window.scrollTo({ top: 0, behavior: 'smooth' });
                });
                brand.addEventListener('keydown', e => {
                    if (e.key === 'Enter' || e.key === ' ') brand.click();
                });
            }


            // ================================================================
            // 3D CARD TILT — Subtle perspective tilt on hover
            // !! EDIT: Change MAX_TILT value (degrees) for more or less effect !!
            // ================================================================
            const MAX_TILT = 7; // degrees — keep below 12 for subtlety

            document.querySelectorAll('.tilt-card').forEach(card => {
                card.addEventListener('mousemove', e => {
                    const r = card.getBoundingClientRect();
                    const dx = (e.clientX - r.left - r.width / 2) / (r.width / 2); // -1 to 1
                    const dy = (e.clientY - r.top - r.height / 2) / (r.height / 2); // -1 to 1

                    card.style.transform = `perspective(800px) rotateX(${-dy * MAX_TILT}deg) rotateY(${dx * MAX_TILT}deg) translateZ(4px)`;
                    card.style.transition = 'transform 0.08s ease-out';
                });

                card.addEventListener('mouseleave', () => {
                    card.style.transform = '';
                    card.style.transition = 'transform 0.65s cubic-bezier(0.16, 1, 0.3, 1)';
                });
            });


            // ================================================================
            // PROFILE PHOTO TILT — Slightly stronger tilt on the hero photo
            // ================================================================
            const photoFrame = document.getElementById('photoFrame');
            if (photoFrame) {
                const wrapper = photoFrame.closest('.hero-right');
                wrapper?.addEventListener('mousemove', e => {
                    const r = photoFrame.getBoundingClientRect();
                    const dx = (e.clientX - r.left - r.width / 2) / (r.width / 2);
                    const dy = (e.clientY - r.top - r.height / 2) / (r.height / 2);
                    photoFrame.style.transform = `perspective(700px) rotateX(${-dy * 11}deg) rotateY(${dx * 11}deg)`;
                    photoFrame.style.transition = 'transform 0.08s ease-out';
                });
                wrapper?.addEventListener('mouseleave', () => {
                    photoFrame.style.transform = '';
                    photoFrame.style.transition = 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
                });
            }


            // ================================================================
            // MAGNETIC HOVER — Connect buttons subtly follow the cursor
            // !! EDIT: Change STRENGTH for more/less magnetic pull (0–1) !!
            // ================================================================
            const STRENGTH = 0.32;

            document.querySelectorAll('.connect-btn').forEach(btn => {
                btn.addEventListener('mousemove', e => {
                    const r = btn.getBoundingClientRect();
                    const dx = (e.clientX - r.left - r.width / 2) * STRENGTH;
                    const dy = (e.clientY - r.top - r.height / 2) * STRENGTH;
                    btn.style.transform = `translate(${dx}px, ${dy}px) translateY(-3px)`;
                    btn.style.transition = 'transform 0.1s ease-out';
                });
                btn.addEventListener('mouseleave', () => {
                    btn.style.transform = '';
                    btn.style.transition = 'transform 0.55s cubic-bezier(0.16, 1, 0.3, 1)';
                });
            });
            // ================================================================
            // LIQUID GLASS SKILLS INTERACTIVE SPOTLIGHT & 3D TILT
            // Tracks mouse coordinates within skill group cards to update
            // custom CSS variables for liquid spotlight gradient and subtle card rotation.
            // ================================================================
            document.querySelectorAll('.skill-group-wrap').forEach(wrap => {
                const card = wrap.querySelector('.skill-group');
                wrap.addEventListener('mousemove', e => {
                    const r = wrap.getBoundingClientRect();
                    const x = e.clientX - r.left;
                    const y = e.clientY - r.top;
                    if (card) {
                        card.style.setProperty('--mouse-x', `${x}px`);
                        card.style.setProperty('--mouse-y', `${y}px`);
                    }

                    // 3D Card tilt effect on the wrap
                    const centerX = r.width / 2;
                    const centerY = r.height / 2;
                    const rotateX = -(y - centerY) / 22; // 3D tilt strength
                    const rotateY = (x - centerX) / 22;
                    wrap.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
                    wrap.style.transition = 'transform 0.08s ease-out';
                });

                if (card) {
                    card.style.setProperty('--mouse-x', `-1000px`);
                    card.style.setProperty('--mouse-y', `-1000px`);
                }

                wrap.addEventListener('mouseleave', () => {
                    wrap.style.transform = '';
                    if (card) {
                        card.style.setProperty('--mouse-x', `-1000px`);
                        card.style.setProperty('--mouse-y', `-1000px`);
                    }
                    wrap.style.transition = 'transform 0.55s cubic-bezier(0.16, 1, 0.3, 1)';
                });
            });

            // 3D Tilt effect for the Skills Header
            const skillsHeader = document.querySelector('.skills-header-container');
            const title3D = document.querySelector('.skills-title-3d');
            if (skillsHeader && title3D) {
                skillsHeader.addEventListener('mousemove', e => {
                    const r = skillsHeader.getBoundingClientRect();
                    const x = e.clientX - r.left;
                    const y = e.clientY - r.top;
                    const centerX = r.width / 2;
                    const centerY = r.height / 2;
                    const rotateX = -(y - centerY) / 8; // responsive tilt
                    const rotateY = (x - centerX) / 8;
                    title3D.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(25px)`;
                    title3D.style.textShadow = `
                        ${-rotateY * 0.8}px ${-rotateX * 0.8}px 0 rgba(34, 211, 238, 0.45),
                        ${-rotateY * 1.5}px ${-rotateX * 1.5}px 0 rgba(168, 85, 247, 0.35),
                        ${-rotateY * 2.2}px ${-rotateX * 2.2}px 12px rgba(0, 0, 0, 0.5)
                    `;
                    title3D.style.transition = 'transform 0.08s ease-out, text-shadow 0.08s ease-out';
                });
                skillsHeader.addEventListener('mouseleave', () => {
                    title3D.style.transform = '';
                    title3D.style.textShadow = '';
                    title3D.style.transition = 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), text-shadow 0.45s ease';
                });
            }


            // ================================================================
            // SCROLL REVEAL — Fade+blur elements in as they enter the viewport
            // Any element with class="reveal" or "reveal-stagger" is watched.
            // ================================================================
            const revealObs = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    } else {
                        entry.target.classList.remove('visible');
                    }
                });
            }, {
                threshold: 0.07,
                rootMargin: '0px 0px -30px 0px'
            });

            document.querySelectorAll('.reveal, .reveal-stagger').forEach(el => {
                revealObs.observe(el);
            });

            // Hero section reveals instantly (no scroll needed)
            document.getElementById('hero')?.classList.add('visible');


            // ================================================================
            // HIGHLIGHTS 3D CAROUSEL
            // Auto-advances every 4s. Pauses on hover. Clickable side cards
            // and dots let you jump to any card. Description reveals on hover.
            // !! EDIT: Change INTERVAL_MS for slower/faster auto-advance !!
            // ================================================================
            const INTERVAL_MS = 4000; // milliseconds between auto-advances

            const hlCards = Array.from(document.querySelectorAll('.hl-card'));
            const hlDots = Array.from(document.querySelectorAll('.hl-dot'));
            const hlStage = document.getElementById('hlStage');
            const TOTAL = hlCards.length;
            let hlIndex = 0; // currently active card index
            let hlTimer = null;

            // Apply position classes based on current active index
            function hlUpdate() {
                hlCards.forEach((card, i) => {
                    // Remove all state classes
                    card.classList.remove('hl-active', 'hl-prev', 'hl-next', 'hl-hidden');

                    if (i === hlIndex) {
                        card.classList.add('hl-active');
                    } else if (i === (hlIndex - 1 + TOTAL) % TOTAL) {
                        card.classList.add('hl-prev');   // Left side
                    } else if (i === (hlIndex + 1) % TOTAL) {
                        card.classList.add('hl-next');   // Right side
                    } else {
                        card.classList.add('hl-hidden'); // Far behind
                    }
                });

                // Sync dot states
                hlDots.forEach((dot, i) => {
                    dot.classList.toggle('hl-dot-active', i === hlIndex);
                });
            }

            // Advance to the next card
            function hlNext() {
                hlIndex = (hlIndex + 1) % TOTAL;
                hlUpdate();
            }

            // Jump to a specific card index
            function hlGoTo(i) {
                hlIndex = i;
                hlUpdate();
            }

            // Start auto-advance timer
            function hlStart() {
                if (hlTimer) clearInterval(hlTimer);
                hlTimer = setInterval(hlNext, INTERVAL_MS);
                
                const hlDotsContainer = document.getElementById('hlDots');
                if (hlDotsContainer) {
                    hlDotsContainer.classList.remove('hl-paused');
                }
                
                // Reset progress animation on active dot to sync with the new 4s timer
                const activeDot = document.querySelector('.hl-dot.hl-dot-active');
                if (activeDot) {
                    activeDot.style.setProperty('--hl-animation-name', 'none');
                    activeDot.offsetHeight; // force reflow
                    activeDot.style.setProperty('--hl-animation-name', 'hlProgress');
                }
            }

            // Stop auto-advance timer
            function hlStop() {
                clearInterval(hlTimer);
                hlTimer = null;
                
                const hlDotsContainer = document.getElementById('hlDots');
                if (hlDotsContainer) {
                    hlDotsContainer.classList.add('hl-paused');
                }
            }

            // Clicking a side card brings it to the front
            hlCards.forEach((card, i) => {
                card.addEventListener('click', () => {
                    if (i !== hlIndex) {
                        hlGoTo(i);
                        hlStop();
                        hlStart(); // reset timer after manual click
                    }
                });
            });

            // Clicking a dot jumps to that card
            hlDots.forEach((dot, i) => {
                dot.addEventListener('click', () => {
                    hlGoTo(i);
                    hlStop();
                    hlStart();
                });
            });

            // Pause auto-advance when hovering/touching any card, resume on leave
            hlCards.forEach(card => {
                card.addEventListener('mouseenter', hlStop);
                card.addEventListener('mouseleave', hlStart);
                // Touch equivalents for mobile
                card.addEventListener('touchstart', hlStop, { passive: true });
                card.addEventListener('touchend', hlStart, { passive: true });
            });

            // Initialize the carousel
            hlUpdate();
            hlStart();


            // ================================================================
            // PROJECTS STACKED DISSOLVE CAROUSEL CONTROLLER
            // Controlled via left/right arrows with infinite wrapping loop.
            // Syncs active card visibility, page number, and fill progress bar.
            // ================================================================

            let currentProjIndex = 0;
            const projCards = document.querySelectorAll('.proj-card-wrap');
            let isTransitioning = false;

            function showProject(index, directClick = false) {
                if (projCards.length === 0 || isTransitioning) return;

                // Infinite wrapping loop
                let nextIndex = index;
                if (nextIndex < 0) {
                    nextIndex = projCards.length - 1;
                } else if (nextIndex >= projCards.length) {
                    nextIndex = 0;
                }

                // If initial load or clicking same card, snap without sliding transitions
                if (nextIndex === currentProjIndex && !directClick) {
                    projCards.forEach((card, i) => {
                        if (i === nextIndex) {
                            card.classList.add('active');
                        } else {
                            card.classList.remove('active');
                        }
                    });
                    syncProjectMetrics(nextIndex);
                    return;
                }

                // Determine slide direction
                let direction = 1; // 1 = Next, -1 = Prev
                if (nextIndex === 0 && currentProjIndex === projCards.length - 1) {
                    direction = 1;
                } else if (nextIndex === projCards.length - 1 && currentProjIndex === 0) {
                    direction = -1;
                } else {
                    direction = nextIndex > currentProjIndex ? 1 : -1;
                }

                const currentCard = projCards[currentProjIndex];
                const nextCard = projCards[nextIndex];

                if (currentCard && nextCard) {
                    isTransitioning = true;

                    // 1. Trigger exit slide-and-rotate transition on current card
                    if (direction > 0) {
                        currentCard.classList.add('exit-next');
                    } else {
                        currentCard.classList.add('exit-prev');
                    }
                    currentCard.classList.remove('active');

                    // 2. Wait for exit transition to finish (400ms transition duration), simulating mode="wait"
                    setTimeout(() => {
                        currentCard.classList.remove('exit-next', 'exit-prev');

                        // 3. Prepare next card offscreen in the correct direction (transition disabled)
                        if (direction > 0) {
                            nextCard.classList.add('enter-next');
                        } else {
                            nextCard.classList.add('enter-prev');
                        }

                        // Force layout reflow so the browser registers the offscreen position
                        nextCard.offsetHeight;

                        // 4. Slide and rotate the new card into the center position
                        nextCard.classList.add('active');
                        nextCard.classList.remove('enter-next', 'enter-prev');

                        currentProjIndex = nextIndex;
                        syncProjectMetrics(nextIndex);

                        // Unlock transition after entrance animation completes
                        setTimeout(() => {
                            isTransitioning = false;
                        }, 400);
                    }, 400);
                }
            }

            function syncProjectMetrics(index) {
                // Sync pagination text metrics (e.g. 1 of 6) and the fill progress bar
                const projActiveNum = document.getElementById('projActiveNum');
                const projBarFill = document.getElementById('projBarFill');
                const projTotalNum = document.getElementById('projTotalNum');

                const activeCard = projCards[index];
                const cardAccent = activeCard ? window.getComputedStyle(activeCard).getPropertyValue('--card-accent').trim() : 'var(--accent)';

                if (activeCard) {
                    document.documentElement.style.setProperty('--active-accent', cardAccent);
                }

                if (projActiveNum) {
                    projActiveNum.textContent = String(index + 1);
                    projActiveNum.style.color = cardAccent;
                }
                if (projTotalNum) {
                    projTotalNum.textContent = String(projCards.length);
                }
                if (projBarFill) {
                    projBarFill.style.width = ((index + 1) / projCards.length) * 100 + '%';
                    projBarFill.style.backgroundColor = cardAccent;
                }
            }

            // Arrow click event handlers for header buttons
            const projLeft = document.getElementById('projLeft');
            const projRight = document.getElementById('projRight');

            let globalAudioCtx = null;
            function unlockAudio() {
                try {
                    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
                    if (!AudioContextClass) return;
                    if (!globalAudioCtx) {
                        globalAudioCtx = new AudioContextClass();
                    }
                    if (globalAudioCtx.state === 'suspended') {
                        globalAudioCtx.resume();
                    }
                } catch (e) {
                    console.warn("Audio Context unlock failed:", e);
                }
            }
            document.addEventListener('click', unlockAudio, { once: true, capture: true });
            document.addEventListener('touchstart', unlockAudio, { once: true, capture: true });

            function triggerTapticFeedback(btn) {
                if (!btn) return;
                if (navigator.vibrate) {
                    try {
                        navigator.vibrate(10);
                    } catch (e) { }
                }
                btn.classList.add('taptic-active');
                setTimeout(() => {
                    btn.classList.remove('taptic-active');
                }, 100);
            }

            // Synthesize mechanical shutter/switch click sound dynamically (Web Audio API)
            function playClickSound() {
                try {
                    if (!globalAudioCtx) {
                        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
                        if (!AudioContextClass) return;
                        globalAudioCtx = new AudioContextClass();
                    }

                    const audioCtx = globalAudioCtx;
                    if (audioCtx.state === 'suspended') {
                        audioCtx.resume();
                    }

                    // Osc 1: High frequency transient click
                    const osc1 = audioCtx.createOscillator();
                    const gain1 = audioCtx.createGain();
                    osc1.connect(gain1);
                    gain1.connect(audioCtx.destination);

                    osc1.type = 'triangle';
                    osc1.frequency.setValueAtTime(1400, audioCtx.currentTime);
                    osc1.frequency.exponentialRampToValueAtTime(450, audioCtx.currentTime + 0.035);

                    gain1.gain.setValueAtTime(0.08, audioCtx.currentTime);
                    gain1.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.035);

                    // Osc 2: Medium frequency snap body
                    const osc2 = audioCtx.createOscillator();
                    const gain2 = audioCtx.createGain();
                    osc2.connect(gain2);
                    gain2.connect(audioCtx.destination);

                    osc2.type = 'sine';
                    osc2.frequency.setValueAtTime(700, audioCtx.currentTime);
                    osc2.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 0.045);

                    gain2.gain.setValueAtTime(0.06, audioCtx.currentTime);
                    gain2.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.045);

                    osc1.start(audioCtx.currentTime);
                    osc1.stop(audioCtx.currentTime + 0.04);

                    osc2.start(audioCtx.currentTime);
                    osc2.stop(audioCtx.currentTime + 0.05);
                } catch (e) {
                    console.warn("Dynamic click sound failed/blocked:", e);
                }
            }

            projLeft?.addEventListener('click', (e) => {
                e.preventDefault();
                try {
                    triggerTapticFeedback(projLeft);
                } catch (err) { }
                try {
                    playClickSound();
                } catch (err) { }
                showProject(currentProjIndex - 1, true);
            });

            projRight?.addEventListener('click', (e) => {
                e.preventDefault();
                try {
                    triggerTapticFeedback(projRight);
                } catch (err) { }
                try {
                    playClickSound();
                } catch (err) { }
                showProject(currentProjIndex + 1, true);
            });

            // Initialize Projects Carousel state on paint
            showProject(0, false);

            // Add swipe gestures for project cards on mobile
            const projGrid = document.getElementById('projGrid');
            if (projGrid) {
                let projStartX = 0;
                let projStartY = 0;
                let projEndX = 0;
                let projEndY = 0;

                projGrid.addEventListener('touchstart', (e) => {
                    projStartX = e.touches[0].clientX;
                    projStartY = e.touches[0].clientY;
                }, { passive: true });

                projGrid.addEventListener('touchmove', (e) => {
                    projEndX = e.touches[0].clientX;
                    projEndY = e.touches[0].clientY;
                }, { passive: true });

                projGrid.addEventListener('touchend', () => {
                    const diffX = projEndX - projStartX;
                    const diffY = projEndY - projStartY;

                    // Only trigger swipe if horizontal sweep is significant and vertical sweep is small
                    if (Math.abs(diffX) > 50 && Math.abs(diffY) < 40) {
                        if (diffX > 0) {
                            showProject(currentProjIndex - 1, true);
                        } else {
                            showProject(currentProjIndex + 1, true);
                        }
                    }
                    projStartX = 0;
                    projStartY = 0;
                    projEndX = 0;
                    projEndY = 0;
                }, { passive: true });
            }


            // ================================================================
            // PROJECTS TELEMETRY INTERACTIVE HUD CONTROLLER
            // Attach mouseover/mouseleave events to SVG system components
            // to update text logs, indicators, and console border colors.
            // ================================================================

            const projectsSection = document.getElementById('projects');
            if (projectsSection) {

                // ---- PROJECT 1: SIS Failure Predictor ----
                const sisLegGroups = projectsSection.querySelectorAll('.sis-leg-group');
                const sisConsole = projectsSection.querySelector('.sis-hud-console');
                const sisText = projectsSection.querySelector('.sis-hud-text');
                const sisPing = projectsSection.querySelector('.ping-circle');
                const sisIndicatorDot = projectsSection.querySelector('.sis-hud-console + circle');

                const sisStates = {
                    A: { text: "LEG_A TELEMETRY: 4.91V", stroke: "#22d3ee", isAlert: false },
                    B: { text: "LEG_B TELEMETRY: 4.88V", stroke: "#22d3ee", isAlert: false },
                    C: { text: "LEG_C DRIFTING: 3.65V", stroke: "#f43f5e", isAlert: true }
                };

                sisLegGroups.forEach(group => {
                    group.addEventListener('mouseenter', () => {
                        const leg = group.getAttribute('data-leg');
                        const state = sisStates[leg];
                        if (!state) return;

                        // Highlight hovered leg case, dim others
                        sisLegGroups.forEach(g => {
                            const caseRect = g.querySelector('.sis-leg-case');
                            const legBar = g.querySelector('.sis-leg-bar');
                            if (g === group) {
                                caseRect.style.stroke = state.stroke;
                                caseRect.style.strokeWidth = "1.8px";
                                caseRect.style.fill = state.isAlert ? "rgba(244, 63, 94, 0.08)" : "rgba(34, 211, 238, 0.08)";
                                g.style.opacity = "1";

                                // Pause the default oscillation animation to lock the active telemetry reading
                                if (legBar) {
                                    legBar.style.animationPlayState = 'paused';
                                }
                            } else {
                                g.style.opacity = "0.35";
                            }
                        });

                        // Update HUD console
                        if (sisText) {
                            sisText.textContent = state.text;
                            sisText.style.fill = state.isAlert ? "#f43f5e" : "#22d3ee";
                        }
                        if (sisConsole) {
                            sisConsole.style.stroke = state.stroke;
                            sisConsole.style.fill = state.isAlert ? "rgba(244, 63, 94, 0.05)" : "rgba(34, 211, 238, 0.05)";
                        }
                        if (sisIndicatorDot) sisIndicatorDot.style.fill = state.stroke;
                        if (sisPing) {
                            sisPing.style.stroke = state.stroke;
                        }
                    });

                    group.addEventListener('mouseleave', () => {
                        // Reset all legs
                        sisLegGroups.forEach(g => {
                            const caseRect = g.querySelector('.sis-leg-case');
                            const legBar = g.querySelector('.sis-leg-bar');
                            const isLegC = g.getAttribute('data-leg') === 'C';
                            caseRect.style.stroke = isLegC ? "rgba(244, 63, 94, 0.2)" : "rgba(34, 211, 238, 0.2)";
                            caseRect.style.strokeWidth = "1px";
                            caseRect.style.fill = "rgba(255, 255, 255, 0.02)";
                            g.style.opacity = "1";

                            // Resume telemetry oscillation animation
                            if (legBar) {
                                legBar.style.animationPlayState = 'running';
                            }
                        });

                        // Reset HUD console
                        if (sisText) {
                            sisText.textContent = "ALERT: DEV_RATE > 10%";
                            sisText.style.fill = "#f43f5e";
                        }
                        if (sisConsole) {
                            sisConsole.style.stroke = "rgba(244, 63, 94, 0.15)";
                            sisConsole.style.fill = "rgba(3, 3, 3, 0.9)";
                        }
                        if (sisIndicatorDot) sisIndicatorDot.style.fill = "#f43f5e";
                        if (sisPing) {
                            sisPing.style.stroke = "#f43f5e";
                        }
                    });
                });

                // Hover Console directly for SIS Failure Predictor
                const sisConsoleEl = projectsSection.querySelector('.sis-hud-console');
                if (sisConsoleEl) {
                    const consoleParent = sisConsoleEl.parentElement;
                    consoleParent.style.cursor = 'pointer';
                    consoleParent.addEventListener('mouseenter', () => {
                        if (sisText) {
                            sisText.textContent = "SIS TRIP WINDOW: 72H!";
                            sisText.style.fill = "#f43f5e";
                        }
                        if (sisConsole) {
                            sisConsole.style.stroke = "#f43f5e";
                            sisConsole.style.fill = "rgba(244, 63, 94, 0.05)";
                        }
                        if (sisIndicatorDot) sisIndicatorDot.style.fill = "#f43f5e";
                        if (sisPing) {
                            sisPing.style.stroke = "#f43f5e";
                        }
                    });
                    consoleParent.addEventListener('mouseleave', () => {
                        if (sisText) {
                            sisText.textContent = "ALERT: DEV_RATE > 10%";
                            sisText.style.fill = "#f43f5e";
                        }
                        if (sisConsole) {
                            sisConsole.style.stroke = "rgba(244, 63, 94, 0.15)";
                            sisConsole.style.fill = "rgba(3, 3, 3, 0.9)";
                        }
                        if (sisIndicatorDot) sisIndicatorDot.style.fill = "#f43f5e";
                        if (sisPing) {
                            sisPing.style.stroke = "#f43f5e";
                        }
                    });
                }


                // ---- PROJECT 2: Depthra ----
                const depthNodeGroups = projectsSection.querySelectorAll('.depth-node-group');
                const depthConsole = projectsSection.querySelector('.depth-hud-console');
                const depthText = projectsSection.querySelector('.depth-hud-text');
                const depthPing = projectsSection.querySelector('.depth-ping-circle');
                const depthIndicatorDot = projectsSection.querySelector('.depth-hud-console + circle');
                const depthScanLine = projectsSection.querySelector('.depth-scan-line');

                const depthStates = {
                    Alpha: { text: "NODE ALPHA: 14.2m - DEPLETED", stroke: "#f43f5e", isAlert: true },
                    Beta: { text: "NODE BETA: 32.8m - STABLE", stroke: "#00E5FF", isAlert: false }
                };

                depthNodeGroups.forEach(group => {
                    group.addEventListener('mouseenter', () => {
                        const node = group.getAttribute('data-node');
                        const state = depthStates[node];
                        if (!state) return;

                        // Highlight hovered node, dim other
                        depthNodeGroups.forEach(g => {
                            const nodeCircle = g.querySelector('.depth-node');
                            if (g === group) {
                                nodeCircle.setAttribute('r', '5.5');
                                g.style.opacity = "1";
                                g.style.animationPlayState = 'paused'; // pause target node pulse
                            } else {
                                g.style.opacity = "0.35";
                            }
                        });

                        // Update HUD console
                        if (depthText) {
                            depthText.textContent = state.text;
                            depthText.style.fill = state.stroke;
                        }
                        if (depthConsole) {
                            depthConsole.style.stroke = state.stroke;
                            depthConsole.style.fill = state.isAlert ? "rgba(244, 63, 94, 0.05)" : "rgba(0, 229, 255, 0.05)";
                        }
                        if (depthIndicatorDot) depthIndicatorDot.style.fill = state.stroke;
                        if (depthPing) {
                            depthPing.style.stroke = state.stroke;
                        }
                        // Pause scanner sweep on lock-on telemetry
                        if (depthScanLine) {
                            depthScanLine.style.animationPlayState = 'paused';
                        }
                    });

                    group.addEventListener('mouseleave', () => {
                        // Reset nodes
                        depthNodeGroups.forEach(g => {
                            const nodeCircle = g.querySelector('.depth-node');
                            nodeCircle.setAttribute('r', '3.5');
                            g.style.opacity = "1";
                            g.style.animationPlayState = 'running'; // resume pulse
                        });

                        // Reset HUD console
                        if (depthText) {
                            depthText.textContent = "SCANNING DEPTH AQUIFERS...";
                            depthText.style.fill = "#00E5FF";
                        }
                        if (depthConsole) {
                            depthConsole.style.stroke = "rgba(0, 229, 255, 0.15)";
                            depthConsole.style.fill = "rgba(3, 3, 3, 0.9)";
                        }
                        if (depthIndicatorDot) depthIndicatorDot.style.fill = "#00E5FF";
                        if (depthPing) {
                            depthPing.style.stroke = "#00E5FF";
                        }
                        // Resume scanner sweep
                        if (depthScanLine) {
                            depthScanLine.style.animationPlayState = 'running';
                        }
                    });
                });

                // Hover Console directly for Depthra
                const depthConsoleEl = projectsSection.querySelector('.depth-hud-console');
                if (depthConsoleEl) {
                    const consoleParent = depthConsoleEl.parentElement;
                    consoleParent.style.cursor = 'pointer';
                    consoleParent.addEventListener('mouseenter', () => {
                        if (depthText) {
                            depthText.textContent = "RADAR LOCK: ACTIVE";
                            depthText.style.fill = "#00E5FF";
                        }
                        if (depthConsole) {
                            depthConsole.style.stroke = "#00E5FF";
                            depthConsole.style.fill = "rgba(0, 229, 255, 0.05)";
                        }
                        if (depthIndicatorDot) depthIndicatorDot.style.fill = "#00E5FF";
                        if (depthPing) {
                            depthPing.style.stroke = "#00E5FF";
                        }
                    });
                    consoleParent.addEventListener('mouseleave', () => {
                        if (depthText) {
                            depthText.textContent = "SCANNING DEPTH AQUIFERS...";
                            depthText.style.fill = "#00E5FF";
                        }
                        if (depthConsole) {
                            depthConsole.style.stroke = "rgba(0, 229, 255, 0.15)";
                            depthConsole.style.fill = "rgba(3, 3, 3, 0.9)";
                        }
                        if (depthIndicatorDot) depthIndicatorDot.style.fill = "#00E5FF";
                        if (depthPing) {
                            depthPing.style.stroke = "#00E5FF";
                        }
                    });
                }


                // ---- PROJECT 3: Smart Drainage System ----
                const drainageGroup = projectsSection.querySelector('.drainage-wave-group');
                const drainageConsole = projectsSection.querySelector('.drainage-hud-console');
                const drainageText = projectsSection.querySelector('.drainage-hud-text');
                const drainagePing = projectsSection.querySelector('.drainage-ping-circle');
                const drainageIndicatorDot = projectsSection.querySelector('.drainage-hud-console + circle');
                const flowingDots = projectsSection.querySelectorAll('.flowing-dot');
                const drainageWavePath = projectsSection.querySelector('.drainage-wave-path');

                if (drainageGroup) {
                    drainageGroup.addEventListener('mouseenter', () => {
                        // Speed up dots and scale them on hover
                        flowingDots.forEach(dot => {
                            dot.style.animationDuration = '1.2s';
                            dot.setAttribute('r', '3');
                        });

                        // Speed up wave ripples on hover
                        if (drainageWavePath) {
                            drainageWavePath.style.animationDuration = '1.5s';
                        }

                        // Update HUD console
                        if (drainageText) {
                            drainageText.textContent = "DISCHARGE: 42L/s | STATUS: OK";
                            drainageText.style.fill = "#00C9A7";
                        }
                        if (drainageConsole) {
                            drainageConsole.style.stroke = "#00C9A7";
                            drainageConsole.style.fill = "rgba(0, 201, 167, 0.05)";
                        }
                        if (drainageIndicatorDot) drainageIndicatorDot.style.fill = "#00C9A7";
                        if (drainagePing) {
                            drainagePing.style.stroke = "#00C9A7";
                        }
                    });

                    drainageGroup.addEventListener('mouseleave', () => {
                        // Reset dots speed and size
                        flowingDots.forEach(dot => {
                            dot.style.animationDuration = '';
                            const isDelay = dot.style.animationDelay !== '';
                            dot.setAttribute('r', isDelay ? '1.5' : '2');
                        });

                        // Reset wave ripples speed
                        if (drainageWavePath) {
                            drainageWavePath.style.animationDuration = '';
                        }

                        // Reset HUD console
                        if (drainageText) {
                            drainageText.textContent = "FLOW LEVEL: NOMINAL";
                            drainageText.style.fill = "#00C9A7";
                        }
                        if (drainageConsole) {
                            drainageConsole.style.stroke = "rgba(0, 201, 167, 0.15)";
                            drainageConsole.style.fill = "rgba(3, 3, 3, 0.9)";
                        }
                        if (drainageIndicatorDot) drainageIndicatorDot.style.fill = "#00C9A7";
                        if (drainagePing) {
                            drainagePing.style.stroke = "#00C9A7";
                        }
                    });
                }

                // Hover Console directly for Smart Drainage System
                const drainageConsoleEl = projectsSection.querySelector('.drainage-hud-console');
                if (drainageConsoleEl) {
                    const consoleParent = drainageConsoleEl.parentElement;
                    consoleParent.style.cursor = 'pointer';
                    consoleParent.addEventListener('mouseenter', () => {
                        if (drainageText) {
                            drainageText.textContent = "ESP32 TELEMETRY: ONLINE";
                            drainageText.style.fill = "#00C9A7";
                        }
                        if (drainageConsole) {
                            drainageConsole.style.stroke = "#00C9A7";
                            drainageConsole.style.fill = "rgba(0, 201, 167, 0.05)";
                        }
                        if (drainageIndicatorDot) drainageIndicatorDot.style.fill = "#00C9A7";
                        if (drainagePing) {
                            drainagePing.style.stroke = "#00C9A7";
                        }
                    });
                    consoleParent.addEventListener('mouseleave', () => {
                        if (drainageText) {
                            drainageText.textContent = "FLOW LEVEL: NOMINAL";
                            drainageText.style.fill = "#00C9A7";
                        }
                        if (drainageConsole) {
                            drainageConsole.style.stroke = "rgba(0, 201, 167, 0.15)";
                            drainageConsole.style.fill = "rgba(3, 3, 3, 0.9)";
                        }
                        if (drainageIndicatorDot) drainageIndicatorDot.style.fill = "#00C9A7";
                        if (drainagePing) {
                            drainagePing.style.stroke = "#00C9A7";
                        }
                    });
                }


                // ---- PROJECT 4: 4-Bit ALU in Verilog ----
                const aluPathGroups = projectsSection.querySelectorAll('.alu-path-group');
                const aluConsole = projectsSection.querySelector('.alu-hud-console');
                const aluText = projectsSection.querySelector('.alu-hud-text');
                const aluPing = projectsSection.querySelector('.alu-ping-circle');
                const aluIndicatorDot = projectsSection.querySelector('.alu-hud-console + circle');
                const aluLogicCore = projectsSection.querySelector('.alu-logic-core');

                const aluStates = {
                    A: { text: "INPUT A: 0101 (DECIMAL 5)", stroke: "#BF9AFF", coreColor: "rgba(123, 47, 255, 0.08)" },
                    B: { text: "INPUT B: 1010 (DECIMAL 10)", stroke: "#BF9AFF", coreColor: "rgba(123, 47, 255, 0.08)" },
                    Y: { text: "OUTPUT Y: 1111 (OP: OR | RES: 15)", stroke: "#7B2FFF", coreColor: "rgba(123, 47, 255, 0.16)" }
                };

                aluPathGroups.forEach(group => {
                    const inputA = group.getAttribute('data-input');
                    const outputY = group.getAttribute('data-output');
                    const key = inputA || outputY;

                    group.addEventListener('mouseenter', () => {
                        const state = aluStates[key];
                        if (!state) return;

                        // Highlight hovered path, dim others
                        aluPathGroups.forEach(g => {
                            const line = g.querySelector('line');
                            if (g === group) {
                                line.style.stroke = state.stroke;
                                line.style.strokeWidth = "2px";
                                g.style.opacity = "1";
                            } else {
                                g.style.opacity = "0.3";
                            }
                        });

                        // Highlight core ALU component, pause background pulse
                        if (aluLogicCore) {
                            aluLogicCore.style.fill = state.coreColor;
                            aluLogicCore.style.stroke = state.stroke;
                            aluLogicCore.style.strokeWidth = "2px";
                            aluLogicCore.style.animationPlayState = 'paused';
                        }

                        // Update HUD console
                        if (aluText) {
                            aluText.textContent = state.text;
                            aluText.style.fill = state.stroke;
                        }
                        if (aluConsole) {
                            aluConsole.style.stroke = state.stroke;
                            aluConsole.style.fill = state.stroke === "#BF9AFF" ? "rgba(191, 154, 255, 0.05)" : "rgba(123, 47, 255, 0.05)";
                        }
                        if (aluIndicatorDot) aluIndicatorDot.style.fill = state.stroke;
                        if (aluPing) {
                            aluPing.style.stroke = state.stroke;
                        }
                    });

                    group.addEventListener('mouseleave', () => {
                        // Reset paths
                        aluPathGroups.forEach(g => {
                            const line = g.querySelector('line');
                            line.style.stroke = "rgba(123, 47, 255, 0.2)";
                            line.style.strokeWidth = "1px";
                            g.style.opacity = "1";
                        });

                        // Reset core, resume pulse
                        if (aluLogicCore) {
                            aluLogicCore.style.fill = "none";
                            aluLogicCore.style.stroke = "rgba(123, 47, 255, 0.3)";
                            aluLogicCore.style.strokeWidth = "1.5px";
                            aluLogicCore.style.animationPlayState = 'running';
                        }

                        // Reset HUD console
                        if (aluText) {
                            aluText.textContent = "ALU EXECUTION RUNNING...";
                            aluText.style.fill = "#BF9AFF";
                        }
                        if (aluConsole) {
                            aluConsole.style.stroke = "rgba(123, 47, 255, 0.15)";
                            aluConsole.style.fill = "rgba(3, 3, 3, 0.9)";
                        }
                        if (aluIndicatorDot) aluIndicatorDot.style.fill = "#7B2FFF";
                        if (aluPing) {
                            aluPing.style.stroke = "#7B2FFF";
                        }
                    });
                });

                // Hover Console directly for ALU
                const aluConsoleEl = projectsSection.querySelector('.alu-hud-console');
                if (aluConsoleEl) {
                    const consoleParent = aluConsoleEl.parentElement;
                    consoleParent.style.cursor = 'pointer';
                    consoleParent.addEventListener('mouseenter', () => {
                        if (aluText) {
                            aluText.textContent = "VIVADO SIMULATION: PASS";
                            aluText.style.fill = "#BF9AFF";
                        }
                        if (aluConsole) {
                            aluConsole.style.stroke = "#7B2FFF";
                            aluConsole.style.fill = "rgba(123, 47, 255, 0.05)";
                        }
                        if (aluIndicatorDot) aluIndicatorDot.style.fill = "#7B2FFF";
                        if (aluPing) {
                            aluPing.style.stroke = "#7B2FFF";
                        }
                    });
                    consoleParent.addEventListener('mouseleave', () => {
                        if (aluText) {
                            aluText.textContent = "ALU EXECUTION RUNNING...";
                            aluText.style.fill = "#BF9AFF";
                        }
                        if (aluConsole) {
                            aluConsole.style.stroke = "rgba(123, 47, 255, 0.15)";
                            aluConsole.style.fill = "rgba(3, 3, 3, 0.9)";
                        }
                        if (aluIndicatorDot) aluIndicatorDot.style.fill = "#7B2FFF";
                        if (aluPing) {
                            aluPing.style.stroke = "#7B2FFF";
                        }
                    });
                }


                // ---- PROJECT 5: Spectral Analyzer ----
                const spectralGroup = projectsSection.querySelector('.spectral-wave-group');
                const spectralWave = projectsSection.querySelector('.spectral-wave-path');
                const spectralConsole = projectsSection.querySelector('.spectral-hud-console');
                const spectralText = projectsSection.querySelector('.spectral-hud-text');
                const spectralPing = projectsSection.querySelector('.spectral-ping-circle');
                const spectralIndicatorDot = projectsSection.querySelector('.spectral-hud-console + circle');

                const SINE_WAVE = "M 30 82.5 Q 47.5 45, 65 82.5 T 100 82.5 T 135 82.5 T 170 82.5";
                const HARMONIC_WAVE = "M 30 82.5 Q 40 55, 50 82.5 T 70 82.5 T 90 82.5 T 110 82.5 T 130 82.5 T 150 82.5 T 170 82.5";

                if (spectralGroup) {
                    spectralGroup.addEventListener('mouseenter', () => {
                        // Morph wave to higher frequency harmonics
                        if (spectralWave) {
                            spectralWave.setAttribute('d', HARMONIC_WAVE);
                            spectralWave.style.strokeWidth = '2px';
                            spectralWave.style.animationPlayState = 'paused'; // freeze oscillate jitter on lock-on
                        }

                        // Update HUD console
                        if (spectralText) {
                            spectralText.textContent = "THD: 0.12% | FREQ: 2.40kHz";
                            spectralText.style.fill = "#22d3ee";
                        }
                        if (spectralConsole) {
                            spectralConsole.style.stroke = "#22d3ee";
                            spectralConsole.style.fill = "rgba(34, 211, 238, 0.05)";
                        }
                        if (spectralIndicatorDot) spectralIndicatorDot.style.fill = "#22d3ee";
                        if (spectralPing) {
                            spectralPing.style.stroke = "#22d3ee";
                        }
                    });

                    spectralGroup.addEventListener('mouseleave', () => {
                        // Morph back to default sine wave
                        if (spectralWave) {
                            spectralWave.setAttribute('d', SINE_WAVE);
                            spectralWave.style.strokeWidth = '1.5px';
                            spectralWave.style.animationPlayState = 'running'; // resume wave oscillation
                        }

                        // Reset HUD console
                        if (spectralText) {
                            spectralText.textContent = "SPECTRUM TELEMETRY ACTIVE";
                            spectralText.style.fill = "#22d3ee";
                        }
                        if (spectralConsole) {
                            spectralConsole.style.stroke = "rgba(34, 211, 238, 0.15)";
                            spectralConsole.style.fill = "rgba(3, 3, 3, 0.9)";
                        }
                        if (spectralIndicatorDot) spectralIndicatorDot.style.fill = "#22d3ee";
                        if (spectralPing) {
                            spectralPing.style.stroke = "#22d3ee";
                        }
                    });
                }

                // Hover Console directly for Spectral Analyzer
                const spectralConsoleEl = projectsSection.querySelector('.spectral-hud-console');
                if (spectralConsoleEl) {
                    const consoleParent = spectralConsoleEl.parentElement;
                    consoleParent.style.cursor = 'pointer';
                    consoleParent.addEventListener('mouseenter', () => {
                        if (spectralText) {
                            spectralText.textContent = "FFT PROCESSING: NOMINAL";
                            spectralText.style.fill = "#22d3ee";
                        }
                        if (spectralConsole) {
                            spectralConsole.style.stroke = "#22d3ee";
                            spectralConsole.style.fill = "rgba(34, 211, 238, 0.05)";
                        }
                        if (spectralIndicatorDot) spectralIndicatorDot.style.fill = "#22d3ee";
                        if (spectralPing) {
                            spectralPing.style.stroke = "#22d3ee";
                        }
                    });
                    consoleParent.addEventListener('mouseleave', () => {
                        if (spectralText) {
                            spectralText.textContent = "SPECTRUM TELEMETRY ACTIVE";
                            spectralText.style.fill = "#22d3ee";
                        }
                        if (spectralConsole) {
                            spectralConsole.style.stroke = "rgba(34, 211, 238, 0.15)";
                            spectralConsole.style.fill = "rgba(3, 3, 3, 0.9)";
                        }
                        if (spectralIndicatorDot) spectralIndicatorDot.style.fill = "#22d3ee";
                        if (spectralPing) {
                            spectralPing.style.stroke = "#22d3ee";
                        }
                    });
                }


                // ---- PROJECT 6: AC to 5V DC Converter ----
                const powerGroups = projectsSection.querySelectorAll('.power-signal-group');
                const powerConsole = projectsSection.querySelector('.power-hud-console');
                const powerText = projectsSection.querySelector('.power-hud-text');
                const powerPing = projectsSection.querySelector('.power-ping-circle');
                const powerIndicatorDot = projectsSection.querySelector('.power-hud-console + circle');
                const acWavePath = projectsSection.querySelector('.ac-wave-path');
                const dcPulseLine = projectsSection.querySelector('.dc-pulse-line');

                const powerStates = {
                    AC: { text: "AC INPUT: 230V RMS @ 50Hz", stroke: "#f43f5e" },
                    DC: { text: "DC OUTPUT: 5.02V REGULATED", stroke: "#00E5FF" }
                };

                powerGroups.forEach(group => {
                    group.addEventListener('mouseenter', () => {
                        const wave = group.getAttribute('data-wave');
                        const state = powerStates[wave];
                        if (!state) return;

                        // Highlight hovered group case, dim other
                        powerGroups.forEach(g => {
                            const borderRect = g.querySelector('rect');
                            if (g === group) {
                                borderRect.style.stroke = state.stroke;
                                borderRect.style.strokeWidth = "1.6px";
                                g.style.opacity = "1";
                            } else {
                                g.style.opacity = "0.3";
                            }
                        });

                        // Pause active signal flows during telemetry hold
                        if (wave === 'AC' && acWavePath) {
                            acWavePath.style.animationPlayState = 'paused';
                        } else if (wave === 'DC' && dcPulseLine) {
                            dcPulseLine.style.animationPlayState = 'paused';
                        }

                        // Update HUD console
                        if (powerText) {
                            powerText.textContent = state.text;
                            powerText.style.fill = state.stroke;
                        }
                        if (powerConsole) {
                            powerConsole.style.stroke = state.stroke;
                            powerConsole.style.fill = state.stroke === "#f43f5e" ? "rgba(244, 63, 94, 0.05)" : "rgba(0, 229, 255, 0.05)";
                        }
                        if (powerIndicatorDot) powerIndicatorDot.style.fill = state.stroke;
                        if (powerPing) {
                            powerPing.style.stroke = state.stroke;
                        }
                    });

                    group.addEventListener('mouseleave', () => {
                        const wave = group.getAttribute('data-wave');
                        // Reset power blocks
                        powerGroups.forEach(g => {
                            const borderRect = g.querySelector('rect');
                            borderRect.style.stroke = "rgba(244, 63, 94, 0.15)";
                            borderRect.style.strokeWidth = "1px";
                            g.style.opacity = "1";
                        });

                        // Resume signal flows
                        if (wave === 'AC' && acWavePath) {
                            acWavePath.style.animationPlayState = 'running';
                        } else if (wave === 'DC' && dcPulseLine) {
                            dcPulseLine.style.animationPlayState = 'running';
                        }

                        // Reset HUD console
                        if (powerText) {
                            powerText.textContent = "CONVERSION RATIO: 46:1";
                            powerText.style.fill = "#f43f5e";
                        }
                        if (powerConsole) {
                            powerConsole.style.stroke = "rgba(244, 63, 94, 0.15)";
                            powerConsole.style.fill = "rgba(3, 3, 3, 0.9)";
                        }
                        if (powerIndicatorDot) powerIndicatorDot.style.fill = "#f43f5e";
                        if (powerPing) {
                            powerPing.style.stroke = "#f43f5e";
                        }
                    });
                });

                // Hover Console directly for AC to 5V DC Converter
                const powerConsoleEl = projectsSection.querySelector('.power-hud-console');
                if (powerConsoleEl) {
                    const consoleParent = powerConsoleEl.parentElement;
                    consoleParent.style.cursor = 'pointer';
                    consoleParent.addEventListener('mouseenter', () => {
                        if (powerText) {
                            powerText.textContent = "LM7805 TEMP: 42°C";
                            powerText.style.fill = "#00E5FF";
                        }
                        if (powerConsole) {
                            powerConsole.style.stroke = "#00E5FF";
                            powerConsole.style.fill = "rgba(0, 229, 255, 0.05)";
                        }
                        if (powerIndicatorDot) powerIndicatorDot.style.fill = "#00E5FF";
                        if (powerPing) {
                            powerPing.style.stroke = "#00E5FF";
                        }
                    });
                    consoleParent.addEventListener('mouseleave', () => {
                        if (powerText) {
                            powerText.textContent = "CONVERSION RATIO: 46:1";
                            powerText.style.fill = "#f43f5e";
                        }
                        if (powerConsole) {
                            powerConsole.style.stroke = "rgba(244, 63, 94, 0.15)";
                            powerConsole.style.fill = "rgba(3, 3, 3, 0.9)";
                        }
                        if (powerIndicatorDot) powerIndicatorDot.style.fill = "#f43f5e";
                        if (powerPing) {
                            powerPing.style.stroke = "#f43f5e";
                        }
                    });
                }
            }


            // ================================================================
            // COURSES HORIZONTAL CAROUSEL
            // Syncs slider thumb and arrow visibility to scroll position.
            // Supports: arrow click, slider drag, mouse drag-scroll.
            // ================================================================
            const COURSE_SCROLL_STEP = 340; // px scrolled per arrow click

            const courseGrid = document.getElementById('courseGrid');
            const courseLeft = document.getElementById('courseLeft');
            const courseRight = document.getElementById('courseRight');
            const courseTrack = document.getElementById('courseSliderTrack');
            const courseThumb = document.getElementById('courseSliderThumb');

            // -- Slider thumb sizing and positioning --
            function courseUpdateSlider() {
                if (!courseGrid || !courseThumb) return;
                const { scrollLeft, scrollWidth, clientWidth } = courseGrid;
                const ratio = clientWidth / scrollWidth;
                const thumbW = Math.max(ratio * 100, 8);         // percent width, min 8%
                const thumbPos = (scrollLeft / (scrollWidth - clientWidth)) * (100 - thumbW);
                courseThumb.style.width = thumbW + '%';
                courseThumb.style.left = (isNaN(thumbPos) ? 0 : thumbPos) + '%';
            }

            // -- Arrow visibility based on scroll position --
            function courseUpdateArrows() {
                if (!courseGrid) return;
                const { scrollLeft, scrollWidth, clientWidth } = courseGrid;
                const atLeft = scrollLeft < 10;
                const atRight = scrollLeft > scrollWidth - clientWidth - 10;
                courseLeft?.classList.toggle('visible', !atLeft);
                courseRight?.classList.toggle('visible', !atRight);
            }

            // -- Combined update --
            function courseUpdate() {
                courseUpdateSlider();
                courseUpdateArrows();
            }

            // Arrow click handlers
            courseRight?.addEventListener('click', () => {
                courseGrid.scrollBy({ left: COURSE_SCROLL_STEP, behavior: 'smooth' });
            });
            courseLeft?.addEventListener('click', () => {
                courseGrid.scrollBy({ left: -COURSE_SCROLL_STEP, behavior: 'smooth' });
            });

            // Sync on scroll
            courseGrid?.addEventListener('scroll', courseUpdate, { passive: true });

            // -- Slider drag --
            let courseSliderDragging = false;
            let courseSliderStartX = 0;
            let courseSliderScrollAt = 0;

            courseThumb?.addEventListener('mousedown', e => {
                courseSliderDragging = true;
                courseSliderStartX = e.clientX;
                courseSliderScrollAt = courseGrid.scrollLeft;
                courseThumb.classList.add('dragging');
                e.preventDefault();
            });

            document.addEventListener('mousemove', e => {
                if (!courseSliderDragging) return;
                const trackW = courseTrack.clientWidth;
                const thumbW = courseThumb.offsetWidth;
                const available = trackW - thumbW;
                const dx = e.clientX - courseSliderStartX;
                const ratio = dx / available;
                const maxScroll = courseGrid.scrollWidth - courseGrid.clientWidth;
                courseGrid.scrollLeft = Math.max(0, Math.min(maxScroll, courseSliderScrollAt + ratio * maxScroll));
            });

            document.addEventListener('mouseup', () => {
                if (!courseSliderDragging) return;
                courseSliderDragging = false;
                courseThumb?.classList.remove('dragging');
            });

            // Click on track to jump
            courseTrack?.addEventListener('click', e => {
                if (e.target === courseThumb) return; // ignore thumb clicks
                const rect = courseTrack.getBoundingClientRect();
                const clickPos = (e.clientX - rect.left) / rect.width;
                const maxScroll = courseGrid.scrollWidth - courseGrid.clientWidth;
                courseGrid.scrollTo({ left: clickPos * maxScroll, behavior: 'smooth' });
            });

            // -- Mouse drag-to-scroll on card row --
            let courseIsDragging = false;
            let courseDragStartX = 0;
            let courseScrollAtDrag = 0;

            courseGrid?.addEventListener('mousedown', e => {
                courseIsDragging = true;
                courseDragStartX = e.clientX;
                courseScrollAtDrag = courseGrid.scrollLeft;
                courseGrid.classList.add('dragging');
            });

            document.addEventListener('mousemove', e => {
                if (!courseIsDragging) return;
                courseGrid.scrollLeft = courseScrollAtDrag - (e.clientX - courseDragStartX);
            });

            document.addEventListener('mouseup', () => {
                courseIsDragging = false;
                courseGrid?.classList.remove('dragging');
            });

            // Initial render
            courseUpdate();
            window.addEventListener('resize', courseUpdate);

            // ============================================================
            // DYNAMIC CHARACTER REVEAL & SCROLL PARALLAX FOR ABOUT SECTION
            // ============================================================

            // Recursive helper to split text nodes into individual chars wrapped in spans
            function splitTextIntoSpans(node) {
                if (node.nodeType === Node.TEXT_NODE) {
                    const text = node.nodeValue;
                    const fragment = document.createDocumentFragment();
                    for (let i = 0; i < text.length; i++) {
                        const span = document.createElement('span');
                        span.className = 'char';
                        span.textContent = text[i];
                        fragment.appendChild(span);
                    }
                    node.parentNode.replaceChild(fragment, node);
                } else if (node.nodeType === Node.ELEMENT_NODE) {
                    // Recurse to preserve strong and other formatted sub-tags
                    const children = Array.from(node.childNodes);
                    children.forEach(child => splitTextIntoSpans(child));
                }
            }

            const bioBuilder = document.getElementById('bio-builder');
            const bioHuman = document.getElementById('bio-human');
            if (bioBuilder) splitTextIntoSpans(bioBuilder);
            if (bioHuman) splitTextIntoSpans(bioHuman);

            const aboutSection = document.getElementById('about');
            const aboutAssets = Array.from(document.querySelectorAll('.about-asset-wrapper'));

            // Floating configurations for 4 corner elements:
            // Top-Left: Crescent Moon. Floats down and rotates clockwise.
            // Top-Right: Lego Block. Floats up and rotates counter-clockwise.
            // Bottom-Left: Smiley Face. Floats down and rotates counter-clockwise.
            // Bottom-Right: Cursor Arrow. Floats up and rotates clockwise.
            const parallaxConfig = [
                { yStart: 45, yEnd: -45, rStart: -30, rEnd: 45 },  // Top-Left (Moon)
                { yStart: -35, yEnd: 35, rStart: 35, rEnd: -30 }, // Top-Right (Lego)
                { yStart: 50, yEnd: -50, rStart: 40, rEnd: -25 }, // Bottom-Left (Smiley)
                { yStart: -40, yEnd: 40, rStart: -25, rEnd: 55 }   // Bottom-Right (Cursor)
            ];

            function updateAboutScrollEffects() {
                if (!aboutSection) return;

                const rect = aboutSection.getBoundingClientRect();
                const viewH = window.innerHeight;

                // ---- SCROLL PROGRESS FOR PARALLAX ----
                // Scroll starts when section top is at viewport bottom, ends when section bottom is at viewport top
                const startParallax = viewH;
                const endParallax = -rect.height;
                let pRatio = (startParallax - rect.top) / (startParallax - endParallax);
                pRatio = Math.max(0, Math.min(1, pRatio));

                // Apply translation and rotation to assets
                aboutAssets.forEach((asset, idx) => {
                    const config = parallaxConfig[idx] || { yStart: 0, yEnd: 0, rStart: -30, rEnd: 55 };
                    const yOffset = config.yStart + pRatio * (config.yEnd - config.yStart);
                    const rOffset = config.rStart + pRatio * (config.rEnd - config.rStart);
                    asset.style.transform = `translate3d(0, ${yOffset}px, 0) rotate(${rOffset}deg)`;
                });

                // ---- SCROLL PROGRESS FOR TEXT REVEAL ----
                // Starts when top is at 85% down viewport, completes when top is at 20% down viewport
                const startReveal = viewH * 0.85;
                const endReveal = viewH * 0.20;
                let rRatio = (startReveal - rect.top) / (startReveal - endReveal);
                rRatio = Math.max(0, Math.min(1, rRatio));

                // Apply progressive character reveal to the currently active bio container
                const activeBio = document.querySelector('.about-content.active-bio');
                if (activeBio) {
                    const chars = activeBio.querySelectorAll('.char');
                    const totalChars = chars.length;

                    // Slightly faster to complete reveal before section hits the absolute scroll limit
                    const revealProgress = rRatio * 1.25;

                    chars.forEach((char, index) => {
                        const charStart = (index / totalChars) * 0.8;
                        const charProgress = (revealProgress - charStart) / 0.2; // 20% span to fade
                        const progress = Math.max(0, Math.min(1, charProgress));

                        const isLead = char.closest('.about-lead') !== null;
                        const isWhiteReveal = char.closest('.white-reveal') !== null;

                        if (isLead || isWhiteReveal) {
                            // Lead or White-reveal: Opacity transitions from 0.2 to 1.0, Color transitions from dark grey to white #ffffff
                            const opacity = 0.2 + progress * 0.8;
                            char.style.opacity = opacity;

                            const r = Math.round(110 + progress * (255 - 110));
                            const g = Math.round(122 + progress * (255 - 122));
                            const b = Math.round(130 + progress * (255 - 130));
                            char.style.color = `rgb(${r}, ${g}, ${b})`;
                        } else {
                            // Sub: Opacity transitions from 0.2 to 0.55, Color transitions from dark grey to #D7E2EA
                            const opacity = 0.2 + progress * 0.35;
                            char.style.opacity = opacity;

                            const r = Math.round(110 + progress * (215 - 110));
                            const g = Math.round(122 + progress * (226 - 122));
                            const b = Math.round(130 + progress * (234 - 130));
                            char.style.color = `rgb(${r}, ${g}, ${b})`;
                        }
                    });
                }
            }

            // Expose function to global scope so global toggleAbout can invoke it
            window.updateAboutScrollEffects = updateAboutScrollEffects;

            // Bind events
            window.addEventListener('scroll', updateAboutScrollEffects, { passive: true });
            updateAboutScrollEffects(); // run once immediately


            // ================================================================
            // RETRO CRT PRELOADER CONTROLLER
            // ================================================================
            (function initCRTPreloader() {
                const preloader = document.getElementById('preloader-overlay');
                if (!preloader) return;
                const tvFlare = document.getElementById('tv-flare');

                // Stop Lenis scroll if initialized
                if (window.lenis) {
                    window.lenis.stop();
                } else {
                    // Fallback to check regularly if lenis loads slightly later
                    let checkLenisCount = 0;
                    const checkLenisInterval = setInterval(() => {
                        checkLenisCount++;
                        if (window.lenis) {
                            window.lenis.stop();
                            clearInterval(checkLenisInterval);
                        }
                        if (checkLenisCount > 50) {
                            clearInterval(checkLenisInterval);
                        }
                    }, 50);
                }

                let progress = 0;
                let phase = "intro";
                let seed = 0;
                let logs = [];

                const logPool = [
                    "SCANNING COGNITIVE OVERLAY...",
                    "BRAIN DENSITY: CRITICAL OVERLOAD",
                    "INJECTING EINSTEIN COEFFICIENTS...",
                    "SMARTPERSON DETECTED: KAYILAINATHAN",
                    "IQ INDEX: SIGNIFICANT OVERFLOW",
                    "SYNAPSE TRANSMISSION: MAXIMUM",
                    "LOGIC MATRIX: NOMINAL LOCK"
                ];

                // Seed interval for wiggle filter
                const seedInterval = setInterval(() => {
                    seed = (seed + 1) % 10;
                    const turb = document.getElementById('wiggle-turbulence');
                    if (turb) {
                        turb.setAttribute('seed', seed);
                    }
                }, 120);

                // Cursor coordinates control
                let cursorTargetX = 280;
                let cursorTargetY = 190;
                let cursorTargetScale = 1;
                let showCursorRipple = false;

                // Spring physics variables
                let cursorSpring = {
                    x: 280,
                    y: 190,
                    scale: 1,
                    vx: 0,
                    vy: 0,
                    vs: 0
                };

                // Glitch flash utility
                function triggerGlitch(duration) {
                    const glitch = document.getElementById('glitch-layer');
                    if (glitch) {
                        glitch.style.display = 'flex';
                        setTimeout(() => {
                            glitch.style.display = 'none';
                        }, duration);
                    }
                }

                // Keyboard mechanical click sound synthesizer
                let preloaderAudioCtx = null;
                function playKeyboardSound() {
                    try {
                        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
                        if (!AudioContextClass) return;
                        if (!preloaderAudioCtx) {
                            preloaderAudioCtx = new AudioContextClass();
                        }
                        if (preloaderAudioCtx.state === 'suspended') {
                            preloaderAudioCtx.resume();
                        }

                        const ctx = preloaderAudioCtx;
                        const osc = ctx.createOscillator();
                        const gain = ctx.createGain();
                        
                        osc.connect(gain);
                        gain.connect(ctx.destination);
                        
                        osc.type = 'triangle';
                        const pitch = 850 + Math.random() * 350;
                        osc.frequency.setValueAtTime(pitch, ctx.currentTime);
                        osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.04);
                        
                        gain.gain.setValueAtTime(0.04, ctx.currentTime);
                        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
                        
                        osc.start();
                        osc.stop(ctx.currentTime + 0.045);
                    } catch (e) {
                        console.warn("Keyboard sound synth failed:", e);
                    }
                }

                // Keyboard mechanical key press simulation function
                window.pressPreloaderKey = function (index) {
                    const keyCodes = [
                        "ESC", "F1", "F2", "CTRL", "ALT", "SPACE", "ENTER",
                        "SHIFT", "CAPS", "TAB", "FN", "DEL", "INS", "RUN"
                    ];
                    const keyLabel = keyCodes[index] || `KEY_${index}`;
                    const hexVal = (0x60 + index).toString(16).toUpperCase();
                    const logMsg = `[KEY_PRESS]: '${keyLabel}' (0x${hexVal}) - OK`;

                    addLog(logMsg);
                    triggerGlitch(70);
                    playKeyboardSound();
                    
                    // Clicking boosts progress slightly
                    tickPreloader(2);
                };

                function addLog(msg) {
                    logs.push(msg);
                    if (logs.length > 5) {
                        logs.shift();
                    }
                    updateLogsUI();
                }

                function updateLogsUI() {
                    const logsContainer = document.getElementById('core-logs-container');
                    if (logsContainer) {
                        logsContainer.innerHTML = logs.map(log => `
                            <div class="log-entry">
                                <span class="log-entry-prefix">&gt;</span>${log}
                            </div>
                        `).join('');
                    }
                }

                // Handle screen click to bypass intro
                const crtScreen = document.getElementById('crt-screen');
                if (crtScreen) {
                    crtScreen.addEventListener('click', () => {
                        if (phase === "intro" && progress < 27) {
                            progress = 27;
                            addLog("USER BYPASS: DECRYPTION TRIGGERED");
                        }
                    });
                }

                // Physical keyboard event listeners for interactivity
                const keyMap = {
                    'Escape': 0,
                    'F1': 1,
                    'F2': 2,
                    'Control': 3,
                    'ControlLeft': 3,
                    'ControlRight': 3,
                    'Alt': 4,
                    'AltLeft': 4,
                    'AltRight': 4,
                    ' ': 5,
                    'Space': 5,
                    'Enter': 6,
                    'Shift': 7,
                    'ShiftLeft': 7,
                    'ShiftRight': 7,
                    'CapsLock': 8,
                    'Tab': 9,
                    'f': 10,
                    'KeyF': 10,
                    'Delete': 11,
                    'Insert': 12,
                    'r': 13,
                    'KeyR': 13
                };

                const handleKeyDown = (e) => {
                    if (progress >= 100) return;
                    
                    let keyIndex = keyMap[e.key] !== undefined ? keyMap[e.key] : keyMap[e.code];
                    
                    if (keyIndex !== undefined) {
                        // Highlight corresponding keycap
                        const keyEl = document.querySelector(`.retro-keyboard-drawer .keycap:nth-child(${keyIndex + 1})`);
                        if (keyEl) {
                            keyEl.classList.add('pressed');
                            setTimeout(() => keyEl.classList.remove('pressed'), 120);
                        }
                        pressPreloaderKey(keyIndex);
                    } else if (e.key.length === 1) {
                        // Printable alphanumeric keys type to CRT log
                        addLog(`[INPUT]: CHAR_INPUT '${e.key}'`);
                        triggerGlitch(40);
                        playKeyboardSound();
                        tickPreloader(1); // boost progress by 1% per typed char
                    }
                };

                document.addEventListener('keydown', handleKeyDown);

                // Reusable preloader tick progress worker
                function tickPreloader(increment) {
                    if (progress >= 100) return;

                    progress = Math.min(progress + increment, 100);
                    document.getElementById('progress-text').innerText = `LOAD: ${progress}%`;

                    // Floppy led color update
                    const floppyLed = document.getElementById('floppy-led');
                    if (floppyLed) {
                        if (progress < 30) {
                            floppyLed.style.background = '#ea580c';
                            floppyLed.style.boxShadow = '0 0 5px #ea580c';
                        } else if (progress >= 30 && progress < 90) {
                            floppyLed.style.background = '#10b981';
                            floppyLed.style.boxShadow = '0 0 5px #10b981';
                        } else {
                            floppyLed.style.background = '#f59e0b';
                            floppyLed.style.boxShadow = '0 0 5px #f59e0b';
                        }
                    }

                    // Phase transitions
                    let prevPhase = phase;
                    if (progress <= 30) {
                        phase = "intro";
                    } else if (progress > 30 && progress <= 65) {
                        phase = "folder";
                    } else if (progress > 65 && progress <= 90) {
                        phase = "core";
                    } else {
                        phase = "finished";
                    }

                    if (phase !== prevPhase) {
                        const phaseIntroEl = document.getElementById('phase-intro');
                        const phaseFolderEl = document.getElementById('phase-folder');
                        const phaseCoreEl = document.getElementById('phase-core');
                        const phaseFinishedEl = document.getElementById('phase-finished');

                        if (phaseIntroEl) phaseIntroEl.style.display = (phase === "intro") ? "flex" : "none";
                        if (phaseFolderEl) phaseFolderEl.style.display = (phase === "folder") ? "flex" : "none";
                        if (phaseCoreEl) phaseCoreEl.style.display = (phase === "core") ? "flex" : "none";
                        if (phaseFinishedEl) phaseFinishedEl.style.display = (phase === "finished") ? "flex" : "none";

                        triggerGlitch(200);
                    }

                    // Folder flap/paper interpolation
                    if (phase === "folder") {
                        const ratio = (progress - 31) / (65 - 31);
                        const rotX = Math.max(-48, Math.min(0, -48 * ratio));
                        const paperY = Math.max(-7, Math.min(0, -7 * ratio));

                        const flap = document.getElementById('folder-flap');
                        const paper = document.getElementById('folder-paper');
                        const paperLines = document.getElementById('folder-paper-lines');
                        if (flap) flap.style.transform = `rotateX(${rotX}deg)`;
                        if (paper) paper.style.transform = `translateY(${paperY}px)`;
                        if (paperLines) paperLines.style.transform = `translateY(${paperY}px)`;

                        const folderProgressBar = document.getElementById('folder-progress-bar');
                        if (folderProgressBar) {
                            folderProgressBar.style.width = `${progress}%`;
                        }
                    }

                    // Cursor coordinates targeting
                    if (progress < 10) {
                        cursorTargetX = 280;
                        cursorTargetY = 190;
                        cursorTargetScale = 1;
                        showCursorRipple = false;
                    } else if (progress >= 10 && progress < 27) {
                        const ratio = (progress - 10) / 17;
                        cursorTargetX = 280 + (155 - 280) * ratio;
                        cursorTargetY = 190 + (100 - 190) * ratio;
                        cursorTargetScale = 1;
                        showCursorRipple = false;
                    } else if (progress >= 27 && progress <= 30) {
                        cursorTargetX = 155;
                        cursorTargetY = 100;
                        cursorTargetScale = 0.82;
                        showCursorRipple = true;
                    } else {
                        cursorTargetX = 500;
                        cursorTargetY = 500;
                        cursorTargetScale = 1;
                        showCursorRipple = false;
                    }

                    const ripple = document.getElementById('ripple-circle');
                    if (ripple) {
                        if (showCursorRipple) {
                            ripple.style.display = 'block';
                            ripple.classList.add('ripple-active');
                        } else {
                            ripple.style.display = 'none';
                            ripple.classList.remove('ripple-active');
                        }
                    }

                    if (progress >= 100) {
                        clearInterval(progressInterval);
                        document.removeEventListener('keydown', handleKeyDown);

                        // TV Turn-off sequence
                        setTimeout(() => {
                            const content = document.getElementById('screen-content');
                            const tvPhosphor = document.getElementById('tv-phosphor');
                            if (preloader && tvFlare && tvPhosphor) {
                                if (content) {
                                    content.classList.remove('tv-turn-on-anim');
                                }

                                const scene = document.getElementById('preloader-scene');
                                if (scene) {
                                    scene.style.display = 'none';
                                }

                                preloader.style.transformOrigin = '50% 50%';

                                tvFlare.style.transition = 'none';
                                tvFlare.style.transform = 'translateY(-50%) scaleX(1)';
                                tvFlare.style.opacity = '1';

                                tvFlare.offsetHeight; // Reflow

                                setTimeout(() => {
                                    tvFlare.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
                                    tvFlare.style.transform = 'translateY(-50%) scaleX(0.003)';

                                    preloader.style.transition = 'background-color 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
                                    preloader.style.backgroundColor = 'transparent';

                                    document.body.classList.add('preloader-done');

                                    setTimeout(() => {
                                        tvFlare.style.opacity = '0';

                                        tvPhosphor.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease';
                                        tvPhosphor.style.transform = 'translate(-50%, -50%) scale(2.2)';
                                        tvPhosphor.style.opacity = '1';

                                        setTimeout(() => {
                                            tvPhosphor.style.transition = 'transform 0.6s cubic-bezier(0.7, 0, 0.84, 0), opacity 0.6s ease';
                                            tvPhosphor.style.transform = 'translate(-50%, -50%) scale(0)';
                                            tvPhosphor.style.opacity = '0';

                                            preloader.style.transition = 'opacity 0.7s cubic-bezier(0.25, 1, 0.5, 1)';
                                            preloader.style.opacity = '0';

                                            setTimeout(() => {
                                                preloader.remove();
                                                clearInterval(seedInterval);
                                                if (window.lenis) {
                                                    window.lenis.start();
                                                    // Force position resync for mobile
                                                    window.lenis.scrollTo(0, { immediate: true });
                                                }
                                                // Sync all scroll-dependent state
                                                window.dispatchEvent(new Event('scroll'));
                                            }, 700);
                                        }, 550);
                                    }, 500);
                                }, 300);
                            } else {
                                document.body.classList.add('preloader-done');
                                preloader.remove();
                                clearInterval(seedInterval);
                                if (window.lenis) {
                                    window.lenis.start();
                                    // Force position resync for mobile
                                    window.lenis.scrollTo(0, { immediate: true });
                                }
                                // Sync all scroll-dependent state
                                window.dispatchEvent(new Event('scroll'));
                            }
                        }, 1600);
                    }
                }

                // Main ticker loop
                const progressInterval = setInterval(() => {
                    let increment = 1;
                    if (progress < 30) {
                        increment = Math.floor(Math.random() * 2) + 1;
                    } else if (progress >= 30 && progress < 65) {
                        increment = Math.floor(Math.random() * 3) + 2;
                    } else if (progress >= 65 && progress < 90) {
                        increment = Math.floor(Math.random() * 2) + 1;
                        if (progress % 3 === 0) {
                            const logIdx = Math.floor((progress - 65) / 3) % logPool.length;
                            addLog(logPool[logIdx]);
                        }
                    } else {
                        increment = Math.floor(Math.random() * 4) + 3;
                    }

                    tickPreloader(increment);
                }, 60);

                // Run animation frames for smooth cursor spring physics
                const cursorEl = document.getElementById('preloader-cursor');
                function updateCursorPhysics() {
                    if (!cursorEl) return;

                    let dt = 0.016;
                    let ax = (cursorTargetX - cursorSpring.x) * 90 - cursorSpring.vx * 14;
                    let ay = (cursorTargetY - cursorSpring.y) * 90 - cursorSpring.vy * 14;
                    let as = (cursorTargetScale - cursorSpring.scale) * 90 - cursorSpring.vs * 14;

                    cursorSpring.vx += ax * dt;
                    cursorSpring.vy += ay * dt;
                    cursorSpring.vs += as * dt;

                    cursorSpring.x += cursorSpring.vx * dt;
                    cursorSpring.y += cursorSpring.vy * dt;
                    cursorSpring.scale += cursorSpring.vs * dt;

                    cursorEl.style.transform = `translate(${cursorSpring.x}px, ${cursorSpring.y}px) scale(${cursorSpring.scale})`;

                    if (progress < 100 || cursorSpring.x < 480) {
                        requestAnimationFrame(updateCursorPhysics);
                    }
                }
                requestAnimationFrame(updateCursorPhysics);

            })();

            // ================================================================
            // PREMIUM CONNECT SECTION CONTROLLER
            // ================================================================
            (function initConnectSection() {
                // Vector techy avatar SVG string to load dynamically
                const avatarSvg = `
                <svg class="w-full h-full text-[#00ffcc]" viewBox="0 0 100 100" fill="none">
                  <circle cx="50" cy="50" r="50" fill="#111827" />
                  <circle cx="50" cy="50" r="42" stroke="rgba(6, 182, 212, 0.25)" stroke-width="1" stroke-dasharray="3 3" />
                  <circle cx="50" cy="50" r="30" stroke="rgba(139, 92, 246, 0.2)" stroke-width="1" />
                  <path d="M50 22 C37 22 30 30 30 40 C30 43 33 46 36 46 C39 46 41 43 43 40 C43 36 46 33 50 33 C54 33 57 36 57 40 C59 43 61 46 64 46 C67 46 70 43 70 40 C70 30 63 22 50 22 Z" fill="rgba(6, 182, 212, 0.45)" stroke="rgba(6, 182, 212, 0.8)" stroke-width="1" />
                  <circle cx="50" cy="46" r="13" fill="#1f2937" stroke="rgba(6, 182, 212, 0.6)" stroke-width="1.2" />
                  <rect x="42" y="42" width="6" height="4" rx="1" stroke="#00ffcc" stroke-width="1.2" fill="none" />
                  <rect x="52" y="42" width="6" height="4" rx="1" stroke="#00ffcc" stroke-width="1.2" fill="none" />
                  <line x1="48" y1="44" x2="52" y2="44" stroke="#00ffcc" stroke-width="1.2" />
                  <path d="M26 80 C26 66 36 60 50 60 C64 60 74 66 74 80" fill="rgba(139, 92, 246, 0.35)" stroke="rgba(139, 92, 246, 0.7)" stroke-width="1.2" />
                </svg>
                `;
                const connectAvatar = document.getElementById("profileAvatarConnect");
                const connectAvatarSmall = document.getElementById("profileAvatarConnectSmall");
                if (connectAvatar) connectAvatar.innerHTML = avatarSvg;
                if (connectAvatarSmall) connectAvatarSmall.innerHTML = avatarSvg;

                // 1. HTML5 Canvas Waves loop
                const connectCanvas = document.getElementById("connectWavesCanvas");
                if (connectCanvas) {
                    const ctx = connectCanvas.getContext("2d");
                    let offset = 0;
                    
                    // LERP variables for smooth wave sways
                    let targetHover = { x: 0, y: 0 };
                    let currentHover = { x: 0, y: 0 };
                    let hasMouseMoved = false;
                    
                    const resizeCanvas = () => {
                        connectCanvas.width = connectCanvas.offsetWidth;
                        connectCanvas.height = connectCanvas.offsetHeight;
                        if (!hasMouseMoved) {
                            targetHover.x = connectCanvas.width / 2;
                            targetHover.y = connectCanvas.height / 2;
                            currentHover.x = targetHover.x;
                            currentHover.y = targetHover.y;
                        }
                    };
                    resizeCanvas();
                    window.addEventListener("resize", resizeCanvas);
                    
                    const connectCard = document.getElementById("connectCard");
                    if (connectCard) {
                        connectCard.addEventListener("mousemove", (e) => {
                            const rect = connectCard.getBoundingClientRect();
                            targetHover.x = e.clientX - rect.left;
                            targetHover.y = e.clientY - rect.top;
                            hasMouseMoved = true;
                        });
                        connectCard.addEventListener("mouseleave", () => {
                            targetHover.x = connectCanvas.width / 2;
                            targetHover.y = connectCanvas.height / 2;
                        });
                    }
                    
                    const drawWaves = () => {
                        if (!ctx) return;
                        ctx.clearRect(0, 0, connectCanvas.width, connectCanvas.height);
                        offset += 0.006;
                        
                        // Smoothly transition coordinates
                        currentHover.x += (targetHover.x - currentHover.x) * 0.05;
                        currentHover.y += (targetHover.y - currentHover.y) * 0.05;
                        
                        const waveCount = 3;
                        const colors = [
                            "rgba(6, 182, 212, 0.08)",
                            "rgba(139, 92, 246, 0.08)",
                            "rgba(244, 63, 94, 0.04)"
                        ];
                        
                        for (let i = 0; i < waveCount; i++) {
                            ctx.beginPath();
                            ctx.lineWidth = 1.6 - i * 0.3;
                            ctx.strokeStyle = colors[i % colors.length];
                            
                            const amplitude = 30 + i * 8 + (currentHover.y / connectCanvas.height) * 12;
                            const frequency = 0.003 + i * 0.0008 + (currentHover.x / connectCanvas.width) * 0.0015;
                            const speed = offset * (1 + i * 0.15);
                            
                            for (let x = 0; x < connectCanvas.width; x++) {
                                const y = connectCanvas.height / 2 + Math.sin(x * frequency + speed) * amplitude;
                                if (x === 0) ctx.moveTo(x, y);
                                else ctx.lineTo(x, y);
                            }
                            ctx.stroke();
                        }
                        requestAnimationFrame(drawWaves);
                    };
                    drawWaves();
                }

                // 2. Status Bar Time Tick & Updates
                const timeBar = document.getElementById("statusBarTime");
                const updateTime = () => {
                    if (timeBar) {
                        const now = new Date();
                        let hr = now.getHours();
                        let mn = now.getMinutes();
                        timeBar.textContent = `${hr < 10 ? '0' + hr : hr}:${mn < 10 ? '0' + mn : mn}`;
                    }
                };
                updateTime();
                setInterval(updateTime, 1000);

                // 3. 3D Smartphone tilt effect (Reduced tilt/scale factors for softer magnetic movement)
                const smartphone = document.getElementById("smartphoneChassis");
                const phoneStage = document.getElementById("phoneStage");
                const phoneBacklight = document.getElementById("phoneBacklight");
                if (smartphone && phoneStage) {
                    let currentRotX = 1.5, currentRotY = -3, currentScale = 1;
                    let targetRotX = 1.5, targetRotY = -3, targetScale = 1;
                    let targetGlowX = 0, targetGlowY = 0;
                    let currentGlowX = 0, currentGlowY = 0;

                    phoneStage.addEventListener("mousemove", (e) => {
                        const rect = phoneStage.getBoundingClientRect();
                        const x = e.clientX - rect.left - rect.width / 2;
                        const y = e.clientY - rect.top - rect.height / 2;

                        targetRotX = -(y / (rect.height / 2)) * 4;
                        targetRotY = (x / (rect.width / 2)) * 4;
                        targetScale = 1.015;

                        targetGlowX = (x / (rect.width / 2)) * 8;
                        targetGlowY = (y / (rect.height / 2)) * 8;
                    });

                    phoneStage.addEventListener("mouseleave", () => {
                        targetRotX = 1.5;
                        targetRotY = -3;
                        targetScale = 1;
                        targetGlowX = 0;
                        targetGlowY = 0;
                    });

                    const animatePhoneTilt = () => {
                        currentRotX += (targetRotX - currentRotX) * 0.12;
                        currentRotY += (targetRotY - currentRotY) * 0.12;
                        currentScale += (targetScale - currentScale) * 0.12;
                        currentGlowX += (targetGlowX - currentGlowX) * 0.12;
                        currentGlowY += (targetGlowY - currentGlowY) * 0.12;

                        // No float: phone stays perfectly still, only tilt on hover
                        smartphone.style.transform = `rotateX(${currentRotX}deg) rotateY(${currentRotY}deg) scale(${currentScale})`;
                        if (phoneBacklight) {
                            phoneBacklight.style.transform = `translate(calc(-50% + ${currentGlowX}px), calc(-50% + ${currentGlowY}px))`;
                        }
                        requestAnimationFrame(animatePhoneTilt);
                    };
                    requestAnimationFrame(animatePhoneTilt);
                }

                // 4. Simulator Auto-rotation Carousel (4.5s Interval)
                const appViews = document.querySelectorAll(".app-view");
                const backlight = document.getElementById("phoneBacklight");
                const glitchOverlay = document.getElementById("phoneGlitch");
                
                const glowColors = {
                    email: "glow-blue",
                    linkedin: "glow-cyan",
                    github: "glow-rose"
                };
                
                const tabs = ["email", "linkedin", "github"];
                let activeTabIdx = 0;
                
                const switchToTab = (tab) => {
                    // Don't switch if screen is off
                    const phoneScreen = document.querySelector(".phone-screen-container");
                    if (phoneScreen && phoneScreen.classList.contains("screen-off")) return;

                    if (glitchOverlay) {
                        glitchOverlay.classList.add("active");
                        setTimeout(() => {
                            glitchOverlay.classList.remove("active");
                        }, 280);
                    }

                    // Reset LinkedIn button to default state on every tab switch
                    // so it always appears fresh (not "invited") when returning
                    const liBtn = document.getElementById("btn-linkedin-connect");
                    if (liBtn) {
                        liBtn.classList.remove("connecting", "invited");
                        const liText = liBtn.querySelector(".connect-btn-text");
                        if (liText) liText.textContent = "CONNECT ON LINKEDIN";
                    }
                    
                    setTimeout(() => {
                        appViews.forEach(view => view.classList.remove("active"));
                        const activeView = document.getElementById(`view-${tab}-app`);
                        if (activeView) activeView.classList.add("active");
                        
                        if (backlight) {
                            backlight.className = `phone-backlight-glow ${glowColors[tab]}`;
                        }
                        
                        // Force update clock time instantly on rotation between apps
                        updateTime();
                    }, 100);
                };

                let autoRotateInterval = setInterval(() => {
                    activeTabIdx = (activeTabIdx + 1) % tabs.length;
                    switchToTab(tabs[activeTabIdx]);
                }, 4500);


                // Connect side power button to screen-off toggle
                const powerBtn = document.querySelector(".button-right-power");
                const phoneScreen = document.querySelector(".phone-screen-container");
                if (powerBtn && phoneScreen) {
                    powerBtn.addEventListener("click", () => {
                        phoneScreen.classList.toggle("screen-off");
                        triggerGlitch(120);
                        if (typeof playKeyboardSound === "function") {
                            playKeyboardSound();
                        } else {
                            try {
                                const AudioContextClass = window.AudioContext || window.webkitAudioContext;
                                if (AudioContextClass) {
                                    const ctx = new AudioContextClass();
                                    const osc = ctx.createOscillator();
                                    const gain = ctx.createGain();
                                    osc.connect(gain);
                                    gain.connect(ctx.destination);
                                    osc.frequency.setValueAtTime(800, ctx.currentTime);
                                    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.04);
                                    gain.gain.setValueAtTime(0.04, ctx.currentTime);
                                    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
                                    osc.start();
                                    osc.stop(ctx.currentTime + 0.045);
                                }
                            } catch(e) {}
                        }
                    });
                }

                // 5. SecureMail input submission triggers
                const emailSendBtn = document.getElementById("btn-email-send");
                const subjectInput = document.getElementById("email-subject-input");
                const bodyTextarea = document.getElementById("email-body-textarea");
                if (emailSendBtn && subjectInput && bodyTextarea) {
                    function updateEmailHref() {
                        const subject = subjectInput.value;
                        const body = bodyTextarea.value;
                        emailSendBtn.setAttribute("href", `mailto:kayilainathan19@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
                    }
                    subjectInput.addEventListener("input", updateEmailHref);
                    bodyTextarea.addEventListener("input", updateEmailHref);

                    emailSendBtn.addEventListener("click", (e) => {
                        e.preventDefault();
                        emailSendBtn.classList.add("disabled");
                        const sendText = emailSendBtn.querySelector(".send-text");
                        if (sendText) sendText.textContent = "TELEPORTING DRAFT...";
                        emailSendBtn.classList.add("success");
                        
                        setTimeout(() => {
                            emailSendBtn.classList.remove("disabled");
                            if (sendText) sendText.textContent = "LAUNCH EMAIL CLIENT";
                            emailSendBtn.classList.remove("success");
                            
                            window.open(emailSendBtn.getAttribute("href"));
                        }, 1500);
                    });
                }

                // 6. LinkedIn connect button state simulation
                const linkedinConnectBtn = document.getElementById("btn-linkedin-connect");
                if (linkedinConnectBtn) {
                    linkedinConnectBtn.addEventListener("click", (e) => {
                        e.preventDefault();
                        const btnText = linkedinConnectBtn.querySelector(".connect-btn-text");
                        
                        linkedinConnectBtn.classList.add("connecting");
                        if (btnText) btnText.textContent = "CONNECTING...";
                        
                        window.open("https://linkedin.com/in/kayilainathan-j-170267305", "_blank", "noopener,noreferrer");
                        
                        setTimeout(() => {
                            linkedinConnectBtn.classList.remove("connecting");
                            linkedinConnectBtn.classList.add("invited");
                            if (btnText) btnText.textContent = "INVITATION SENT ✓";
                        }, 1200);
                    });
                }

                // 7. GitHub follow is handled natively by the anchor tag href and target="_blank"

                // 8. Clipboard Copy Email action
                const copyBtn = document.getElementById("btn-copy-email");
                const copyDot = document.getElementById("copy-dot");
                const copyText = document.getElementById("copy-text");
                if (copyBtn && copyText) {
                    copyBtn.addEventListener("click", () => {
                        navigator.clipboard.writeText("kayilainathan19@gmail.com").then(() => {
                            copyBtn.classList.add("copied");
                            if (copyDot) copyDot.classList.add("copied");
                            copyText.textContent = "COPIED!";
                            copyBtn.style.borderColor = "#10b981";
                            copyBtn.style.color = "#ffffff";
                            copyBtn.style.background = "rgba(16, 185, 129, 0.1)";
                            copyBtn.style.boxShadow = "0 0 15px rgba(16, 185, 129, 0.3)";
                            
                            setTimeout(() => {
                                copyBtn.classList.remove("copied");
                                if (copyDot) copyDot.classList.remove("copied");
                                copyText.textContent = "COPY EMAIL";
                                copyBtn.style.borderColor = "";
                                copyBtn.style.color = "";
                                copyBtn.style.background = "";
                                copyBtn.style.boxShadow = "";
                            }, 2000);
                        });
                    });
                }                // 9. Dynamic activity contribution grid creation
                const githubGrid = document.getElementById("githubContribGrid");
                if (githubGrid) {
                    for (let i = 0; i < 64; i++) {
                        const r = Math.random();
                        let weight = 0;
                        if (r > 0.82) weight = 4;
                        else if (r > 0.68) weight = 3;
                        else if (r > 0.52) weight = 2;
                        else if (r > 0.32) weight = 1;
                        
                        const node = document.createElement("div");
                        node.className = `contrib-node w${weight}`;
                        githubGrid.appendChild(node);
                    }
                }
            })();

        });

        /* ============================================================
           ABOUT SECTION TOGGLE
           Switches between 'The Builder' and 'The Human' bios
           ============================================================ */
        function toggleAbout(section) {
            const tabsWrapper = document.getElementById('aboutTabs');
            const indicator = document.getElementById('tabIndicator');
            const builderBtn = document.getElementById('tabBuilder');
            const humanBtn = document.getElementById('tabHuman');
            const builderContent = document.getElementById('bio-builder');
            const humanContent = document.getElementById('bio-human');

            if (!builderContent || !humanContent || !builderBtn || !humanBtn) return;

            // Remove active from all, then add to the selected
            [builderBtn, humanBtn].forEach(btn => {
                btn.classList.remove('active');
                btn.setAttribute('aria-pressed', 'false');
            });

            const activeBtn = section === 'builder' ? builderBtn : humanBtn;
            activeBtn.classList.add('active');
            activeBtn.setAttribute('aria-pressed', 'true');

            // Slide indicator using layout-relative offsetLeft/offsetWidth so scroll
            // position never skews the calculation.
            if (indicator && tabsWrapper) {
                const PADDING = 4; // tabs container padding
                const maxLeft = tabsWrapper.clientWidth - PADDING - activeBtn.offsetWidth;
                const targetLeft = Math.max(PADDING, Math.min(maxLeft, activeBtn.offsetLeft));
                indicator.style.left = targetLeft + 'px';
                indicator.style.width = activeBtn.offsetWidth + 'px';
            }

            // Toggle purple tint on the indicator when "human" is active
            tabsWrapper?.classList.toggle('human-active', section === 'human');

            // Swap content
            if (section === 'builder') {
                humanContent.classList.replace('active-bio', 'hidden-bio');
                builderContent.classList.replace('hidden-bio', 'active-bio');
            } else {
                builderContent.classList.replace('active-bio', 'hidden-bio');
                humanContent.classList.replace('hidden-bio', 'active-bio');
            }

            // Re-trigger layout character reveal instantly for newly exposed content
            if (typeof window.updateAboutScrollEffects === 'function') {
                window.updateAboutScrollEffects();
            }
        }

        // Initialise indicator position on load (no transition on first paint)
        (function initTabIndicator() {
            const tabs = document.getElementById('aboutTabs');
            const ind = document.getElementById('tabIndicator');
            const active = document.querySelector('.tab-btn.active');
            if (!tabs || !ind || !active) return;

            requestAnimationFrame(() => {
                // Suppress transition on first placement so it snaps instantly
                ind.style.transition = 'none';
                const PADDING = 4;
                const maxLeft = tabs.clientWidth - PADDING - active.offsetWidth;
                ind.style.left = Math.max(PADDING, Math.min(maxLeft, active.offsetLeft)) + 'px';
                ind.style.width = active.offsetWidth + 'px';
                // Re-enable transition after the first frame is committed
                requestAnimationFrame(() => { ind.style.transition = ''; });
            });
        })();