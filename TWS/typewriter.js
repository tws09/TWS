/**
 * TWS Typewriter Effect - Simple & Bulletproof
 * Types out hero titles character by character
 */

(function () {
    'use strict';

    console.log('🎬 Typewriter: Script loaded');

    class Typewriter {
        constructor(element, options = {}) {
            this.element = element;
            this.speed = options.speed || 60;
            this.delay = options.delay || 800;
            this.cursor = options.cursor !== false;

            // Store original content
            this.originalHTML = element.innerHTML;
            this.fullText = element.textContent.trim();

            // Find gradient span if exists
            const gradientSpan = element.querySelector('.gradient-text');
            if (gradientSpan) {
                this.gradientText = gradientSpan.textContent.trim();
                this.gradientStart = this.fullText.indexOf(this.gradientText);
            } else {
                this.gradientText = null;
                this.gradientStart = -1;
            }

            this.currentIndex = 0;

            console.log('🎬 Typewriter: Created for element', {
                text: this.fullText,
                hasGradient: !!this.gradientText,
                gradientText: this.gradientText
            });

            this.start();
        }

        start() {
            // Clear element
            this.element.innerHTML = '';

            // Add cursor
            if (this.cursor) {
                this.cursorSpan = document.createElement('span');
                this.cursorSpan.style.cssText = `
                    display: inline-block;
                    margin-left: 4px;
                    animation: typewriter-blink 1s infinite;
                    color: #818CF8;
                `;
                this.cursorSpan.textContent = '|';
                this.element.appendChild(this.cursorSpan);
            }

            // Start typing after delay
            setTimeout(() => {
                console.log('🎬 Typewriter: Starting to type...');
                this.type();
            }, this.delay);
        }

        type() {
            if (this.currentIndex < this.fullText.length) {
                this.currentIndex++;
                this.render();

                // Random speed variation for natural feel
                const variance = Math.random() * 30 - 15;
                const nextSpeed = Math.max(30, this.speed + variance);

                setTimeout(() => this.type(), nextSpeed);
            } else {
                // Done typing
                console.log('🎬 Typewriter: Typing complete!');
                if (this.cursorSpan) {
                    setTimeout(() => {
                        if (this.cursorSpan && this.cursorSpan.parentElement) {
                            this.cursorSpan.remove();
                        }
                    }, 1000);
                }
            }
        }

        render() {
            const typed = this.fullText.substring(0, this.currentIndex);

            // Clear element (except cursor)
            while (this.element.firstChild && this.element.firstChild !== this.cursorSpan) {
                this.element.removeChild(this.element.firstChild);
            }

            if (this.gradientText && this.gradientStart >= 0) {
                // Has gradient text
                if (this.currentIndex <= this.gradientStart) {
                    // Before gradient
                    const textNode = document.createTextNode(typed);
                    if (this.cursorSpan) {
                        this.element.insertBefore(textNode, this.cursorSpan);
                    } else {
                        this.element.appendChild(textNode);
                    }
                } else {
                    // In gradient part
                    const before = this.fullText.substring(0, this.gradientStart);
                    const gradient = typed.substring(this.gradientStart);

                    const beforeNode = document.createTextNode(before);
                    const gradientSpan = document.createElement('span');
                    gradientSpan.className = 'gradient-text';
                    gradientSpan.textContent = gradient;

                    if (this.cursorSpan) {
                        this.element.insertBefore(beforeNode, this.cursorSpan);
                        this.element.insertBefore(gradientSpan, this.cursorSpan);
                    } else {
                        this.element.appendChild(beforeNode);
                        this.element.appendChild(gradientSpan);
                    }
                }
            } else {
                // No gradient, just text
                const textNode = document.createTextNode(typed);
                if (this.cursorSpan) {
                    this.element.insertBefore(textNode, this.cursorSpan);
                } else {
                    this.element.appendChild(textNode);
                }
            }
        }
    }

    // Add CSS for cursor blink
    const style = document.createElement('style');
    style.textContent = `
        @keyframes typewriter-blink {
            0%, 49% { opacity: 1; }
            50%, 100% { opacity: 0; }
        }
    `;
    document.head.appendChild(style);

    // Initialize when DOM is ready
    function init() {
        console.log('🎬 Typewriter: Initializing...');

        // Wait a bit for other animations
        setTimeout(() => {
            // Main page - NOT ERP page
            const mainHero = document.querySelector('.hero-title:not(.erp-hero-title)');
            if (mainHero) {
                console.log('🎬 Typewriter: Found main hero title');
                new Typewriter(mainHero, { speed: 60, delay: 800 });
            } else {
                console.log('🎬 Typewriter: No main hero found');
            }

            // ERP pages
            const erpHero = document.querySelector('.erp-hero-title');
            if (erpHero) {
                console.log('🎬 Typewriter: Found ERP hero title');
                new Typewriter(erpHero, { speed: 50, delay: 600 });
            } else {
                console.log('🎬 Typewriter: No ERP hero found');
            }

            // Custom typewriter elements
            const customElements = document.querySelectorAll('.typewriter');
            customElements.forEach((el, i) => {
                console.log('🎬 Typewriter: Found custom element', i);
                new Typewriter(el, { speed: 60, delay: 800 + (i * 200) });
            });

            console.log('🎬 Typewriter: Init complete!');
        }, 1500);
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        // DOM already loaded
        init();
    }

})();
