/**
 * Dynamic Scene Loader for The Beach XR Platform
 * Handles loading different Babylon.js scenes based on user selection and authentication
 */

class SceneLoader {
    constructor() {
        this.availableScenes = {
            'tropical-paradise': {
                name: 'Tropical Paradise',
                description: 'Relaxing beach with palm trees and ocean waves',
                scriptPath: './js/xr-scene.js',
                htmlPath: '/xr/paradise',
                requiredAuth: true,
                thumbnail: '/assets/scenes/tropical-paradise.jpg',
                className: 'BabylonXRScene'
            },
            'underwater-cave': {
                name: 'Underwater Cave',
                description: 'Bioluminescent underwater cave with marine life',
                scriptPath: './js/underwater-cave-scene.js',
                htmlPath: '/xr/underwater-cave',
                requiredAuth: true,
                thumbnail: '/assets/scenes/underwater-cave.jpg',
                className: 'UnderwaterCaveScene'
            },
            'space-station': {
                name: 'Space Station',
                description: 'Zero-gravity orbital platform with Earth views',
                scriptPath: './js/space-station-scene.js',
                htmlPath: '/xr/space-station',
                requiredAuth: true,
                thumbnail: '/assets/scenes/space-station.jpg',
                className: 'SpaceStationScene'
            },
            'desert-oasis': {
                name: 'Desert Oasis',
                description: 'Sand dunes with palm tree oasis',
                scriptPath: './js/desert-oasis-scene.js',
                htmlPath: '/xr/desert-oasis',
                requiredAuth: true,
                thumbnail: '/assets/scenes/desert-oasis.jpg',
                className: 'DesertOasisScene'
            }
        };
        
        this.currentScene = null;
        this.loadedScripts = new Set();
    }

    /**
     * Get all available scenes
     * @returns {Object} Available scenes configuration
     */
    getAvailableScenes() {
        return this.availableScenes;
    }

    /**
     * Check if user is authenticated
     * @returns {Promise<boolean>}
     */
    async checkAuthentication() {
        try {
            const response = await fetch('/lit/session/status', {
                credentials: 'include'
            });
            const sessionData = await response.json();
            return sessionData.authenticated === true;
        } catch (error) {
            console.error('Authentication check failed:', error);
            return false;
        }
    }

    /**
     * Load a scene dynamically
     * @param {string} sceneId - Scene identifier
     * @param {HTMLElement} container - Container element for the scene
     * @returns {Promise<Object>} Scene instance
     */
    async loadScene(sceneId, container = null) {
        const sceneConfig = this.availableScenes[sceneId];
        
        if (!sceneConfig) {
            throw new Error(`Scene "${sceneId}" not found`);
        }

        // Check authentication if required
        if (sceneConfig.requiredAuth) {
            const isAuthenticated = await this.checkAuthentication();
            if (!isAuthenticated) {
                throw new Error('Authentication required to access this scene');
            }
        }

        // Show loading indicator
        this.showLoadingIndicator(`Loading ${sceneConfig.name}...`);

        try {
            // Load the scene script if not already loaded
            if (!this.loadedScripts.has(sceneConfig.scriptPath)) {
                await this.loadScript(sceneConfig.scriptPath);
                this.loadedScripts.add(sceneConfig.scriptPath);
            }

            // Initialize the scene
            const SceneClass = window[sceneConfig.className];
            if (!SceneClass) {
                throw new Error(`Scene class "${sceneConfig.className}" not found`);
            }

            // Clean up existing scene if any
            if (this.currentScene && this.currentScene.dispose) {
                this.currentScene.dispose();
            }

            // Create new scene instance
            this.currentScene = new SceneClass();
            
            // Hide loading indicator
            this.hideLoadingIndicator();

            console.log(`✅ Scene "${sceneConfig.name}" loaded successfully`);
            return this.currentScene;

        } catch (error) {
            this.hideLoadingIndicator();
            console.error(`Failed to load scene "${sceneId}":`, error);
            throw error;
        }
    }

    /**
     * Navigate to a scene's dedicated page
     * @param {string} sceneId - Scene identifier
     */
    async navigateToScene(sceneId) {
        const sceneConfig = this.availableScenes[sceneId];
        
        if (!sceneConfig) {
            throw new Error(`Scene "${sceneId}" not found`);
        }

        // Check authentication if required
        if (sceneConfig.requiredAuth) {
            const isAuthenticated = await this.checkAuthentication();
            if (!isAuthenticated) {
                alert('🔐 Please login first to access this scene');
                return;
            }
        }

        // Show transition animation
        this.showTransitionAnimation(sceneConfig.name);

        // Navigate to the scene page
        setTimeout(() => {
            window.location.href = sceneConfig.htmlPath;
        }, 1500);
    }

    /**
     * Load a script dynamically
     * @param {string} scriptPath - Path to the script
     * @returns {Promise<void>}
     */
    loadScript(scriptPath) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = scriptPath;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error(`Failed to load script: ${scriptPath}`));
            document.head.appendChild(script);
        });
    }

    /**
     * Show loading indicator
     * @param {string} message - Loading message
     */
    showLoadingIndicator(message = 'Loading...') {
        let loader = document.getElementById('scene-loader');
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'scene-loader';
            loader.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.9);
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                z-index: 10000;
                color: white;
                font-family: 'Inter', sans-serif;
            `;
            document.body.appendChild(loader);
        }
        
        loader.innerHTML = `
            <div class="spinner" style="
                border: 4px solid #f3f3f3;
                border-top: 4px solid #667eea;
                border-radius: 50%;
                width: 60px;
                height: 60px;
                animation: spin 1s linear infinite;
            "></div>
            <div style="margin-top: 20px; font-size: 18px;">${message}</div>
        `;
        
        // Add spinner animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
        
        loader.style.display = 'flex';
    }

    /**
     * Hide loading indicator
     */
    hideLoadingIndicator() {
        const loader = document.getElementById('scene-loader');
        if (loader) {
            loader.style.display = 'none';
        }
    }

    /**
     * Show transition animation
     * @param {string} sceneName - Name of the scene
     */
    showTransitionAnimation(sceneName) {
        const transition = document.getElementById('pageTransition');
        const statusText = document.getElementById('loadingStatus');
        
        if (transition && statusText) {
            statusText.textContent = `Loading ${sceneName}...`;
            transition.classList.add('active');
        }
    }

    /**
     * Create scene selector UI
     * @param {HTMLElement} container - Container for the scene selector
     */
    createSceneSelector(container) {
        const selectorHTML = `
            <div class="scene-selector" style="padding: 20px;">
                <h2 style="color: white; font-size: 28px; margin-bottom: 20px;">
                    🌍 Choose Your Adventure
                </h2>
                <div class="scene-grid" style="
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 20px;
                    margin-top: 30px;
                ">
                    ${Object.entries(this.availableScenes).map(([id, scene]) => `
                        <div class="scene-card" data-scene-id="${id}" style="
                            background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
                            border: 2px solid rgba(255, 255, 255, 0.1);
                            border-radius: 12px;
                            padding: 20px;
                            cursor: pointer;
                            transition: all 0.3s ease;
                            position: relative;
                            overflow: hidden;
                        ">
                            <div style="
                                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                border-radius: 8px;
                                height: 150px;
                                margin-bottom: 15px;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                font-size: 48px;
                            ">
                                ${this.getSceneEmoji(id)}
                            </div>
                            <h3 style="color: white; font-size: 20px; margin-bottom: 10px;">
                                ${scene.name}
                            </h3>
                            <p style="color: rgba(255, 255, 255, 0.7); font-size: 14px; margin-bottom: 15px;">
                                ${scene.description}
                            </p>
                            ${scene.requiredAuth ? `
                                <div style="
                                    background: rgba(255, 193, 7, 0.2);
                                    border: 1px solid rgba(255, 193, 7, 0.5);
                                    border-radius: 6px;
                                    padding: 8px;
                                    font-size: 12px;
                                    color: #ffc107;
                                    text-align: center;
                                ">
                                    🔐 Authentication Required
                                </div>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        container.innerHTML = selectorHTML;

        // Add click handlers
        container.querySelectorAll('.scene-card').forEach(card => {
            card.addEventListener('click', async () => {
                const sceneId = card.getAttribute('data-scene-id');
                try {
                    await this.navigateToScene(sceneId);
                } catch (error) {
                    alert(`Error: ${error.message}`);
                }
            });

            // Hover effects
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-5px)';
                card.style.borderColor = 'rgba(102, 126, 234, 0.5)';
                card.style.boxShadow = '0 10px 30px rgba(102, 126, 234, 0.3)';
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
                card.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                card.style.boxShadow = 'none';
            });
        });
    }

    /**
     * Get emoji for scene
     * @param {string} sceneId - Scene identifier
     * @returns {string} Emoji
     */
    getSceneEmoji(sceneId) {
        const emojiMap = {
            'tropical-paradise': '🏝️',
            'underwater-cave': '🐠',
            'space-station': '🚀',
            'desert-oasis': '🏜️'
        };
        return emojiMap[sceneId] || '🌍';
    }
}

// Export for use in other scripts
if (typeof window !== 'undefined') {
    window.SceneLoader = SceneLoader;
}
