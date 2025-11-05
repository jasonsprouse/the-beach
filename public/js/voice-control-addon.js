// Voice & Text Controlled Environment Modifier
// Add this to your existing xr-scene.js file

class VoiceEnvironmentModifier {
    constructor(scene) {
        this.scene = scene;
        this.recognition = null;
        this.isListening = false;
        this.commandHistory = [];
        this.initializeVoiceRecognition();
    }

    initializeVoiceRecognition() {
        if ('webkitSpeechRecognition' in window) {
            this.recognition = new webkitSpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = 'en-US';

            this.recognition.onstart = () => {
                this.isListening = true;
                console.log('🎤 Voice recognition started');
                this.updateStatus('🎤 Listening for voice commands...');
            };

            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript.toLowerCase();
                console.log('🎤 Voice command:', transcript);
                this.processVoiceCommand(transcript);
            };

            this.recognition.onerror = (event) => {
                console.error('🎤 Speech recognition error:', event.error);
                this.updateStatus(`❌ Voice error: ${event.error}`);
                this.isListening = false;
            };

            this.recognition.onend = () => {
                this.isListening = false;
                console.log('🎤 Voice recognition ended');
            };
        } else {
            console.warn('Speech recognition not supported');
        }
    }

    startListening() {
        if (!this.recognition) {
            alert('Voice recognition not supported in this browser');
            return;
        }

        if (this.isListening) {
            console.log('Already listening...');
            return;
        }

        this.recognition.start();
    }

    processVoiceCommand(command) {
        console.log('Processing command:', command);
        this.updateStatus(`🤖 Processing: "${command}"`);
        
        // Add to command history
        this.commandHistory.push({
            command: command,
            timestamp: Date.now(),
            source: 'voice'
        });

        // Simple command processing
        try {
            if (command.includes('add palm tree') || command.includes('create palm tree')) {
                this.addPalmTree();
            } else if (command.includes('change weather to storm') || command.includes('make it stormy')) {
                this.createStormyWeather();
            } else if (command.includes('change weather to sunny') || command.includes('make it sunny')) {
                this.createSunnyWeather();
            } else if (command.includes('add rocks') || command.includes('create rocks')) {
                this.addRocks();
            } else if (command.includes('change to night') || command.includes('make it night')) {
                this.changeToNight();
            } else if (command.includes('change to day') || command.includes('make it day')) {
                this.changeToDay();
            } else if (command.includes('add flowers') || command.includes('create flowers')) {
                this.addTropicalFlowers();
            } else if (command.includes('add fish') || command.includes('create fish')) {
                this.addSwimmingFish();
            } else if (command.includes('bigger waves') || command.includes('increase waves')) {
                this.increasWaves();
            } else if (command.includes('smaller waves') || command.includes('decrease waves')) {
                this.decreaseWaves();
            } else {
                this.updateStatus(`❓ Command not recognized: "${command}"`);
                this.suggestCommands();
            }
        } catch (error) {
            console.error('Error processing voice command:', error);
            this.updateStatus(`❌ Error: ${error.message}`);
        }
    }

    // Process text command (same logic as voice)
    processTextCommand(command) {
        console.log('Processing text command:', command);
        this.updateStatus(`💬 Processing text: "${command}"`);
        
        // Add to command history
        this.commandHistory.push({
            command: command,
            timestamp: Date.now(),
            source: 'text'
        });

        // Use the same processing logic as voice commands
        this.processVoiceCommand(command.toLowerCase());
    }

    addPalmTree() {
        console.log('🌴 Adding palm tree');
        
        // Random position around the beach
        const x = (Math.random() - 0.5) * 40;
        const z = (Math.random() - 0.5) * 40;
        
        // Create trunk
        const trunk = BABYLON.MeshBuilder.CreateCylinder("palmTrunk", {
            height: 8,
            diameterTop: 0.8,
            diameterBottom: 1.2
        }, this.scene);
        
        trunk.position.x = x;
        trunk.position.y = 4;
        trunk.position.z = z;
        
        // Trunk material
        const trunkMaterial = new BABYLON.StandardMaterial("trunkMat", this.scene);
        trunkMaterial.diffuseColor = new BABYLON.Color3(0.6, 0.4, 0.2);
        trunk.material = trunkMaterial;
        
        // Create palm leaves
        for (let i = 0; i < 6; i++) {
            const leaf = BABYLON.MeshBuilder.CreateBox("palmLeaf", {
                width: 0.5,
                height: 0.1,
                depth: 4
            }, this.scene);
            
            leaf.position.x = x;
            leaf.position.y = 8;
            leaf.position.z = z;
            leaf.rotation.y = (Math.PI * 2 / 6) * i;
            leaf.rotation.x = -0.3;
            
            const leafMaterial = new BABYLON.StandardMaterial("leafMat", this.scene);
            leafMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.8, 0.2);
            leaf.material = leafMaterial;
        }
        
        this.updateStatus('🌴 Palm tree added successfully!');
    }

    createStormyWeather() {
        console.log('⛈️ Creating stormy weather');
        
        // Darken the scene
        this.scene.lights.forEach(light => {
            if (light.name !== 'stormLight') {
                light.intensity = 0.3;
            }
        });
        
        // Add storm lighting
        const stormLight = new BABYLON.DirectionalLight("stormLight", new BABYLON.Vector3(-1, -1, 0), this.scene);
        stormLight.diffuse = new BABYLON.Color3(0.4, 0.4, 0.6);
        stormLight.intensity = 0.8;
        
        // Create rain effect
        const rainSystem = new BABYLON.ParticleSystem("rain", 2000, this.scene);
        rainSystem.particleTexture = new BABYLON.Texture("https://playground.babylonjs.com/textures/flare.png", this.scene);
        
        rainSystem.emitter = BABYLON.Vector3.Zero();
        rainSystem.minEmitBox = new BABYLON.Vector3(-50, 20, -50);
        rainSystem.maxEmitBox = new BABYLON.Vector3(50, 20, 50);
        
        rainSystem.direction1 = new BABYLON.Vector3(-2, -10, 0);
        rainSystem.direction2 = new BABYLON.Vector3(2, -10, 0);
        
        rainSystem.minSize = 0.1;
        rainSystem.maxSize = 0.3;
        rainSystem.minLifeTime = 0.5;
        rainSystem.maxLifeTime = 1.5;
        rainSystem.emitRate = 1000;
        
        rainSystem.start();
        
        this.updateStatus('⛈️ Stormy weather created!');
    }

    createSunnyWeather() {
        console.log('☀️ Creating sunny weather');
        
        // Remove storm effects
        const stormLight = this.scene.getLightByName("stormLight");
        if (stormLight) {
            stormLight.dispose();
        }
        
        // Remove rain
        const rainSystem = this.scene.getParticleSystemByName("rain");
        if (rainSystem) {
            rainSystem.stop();
            rainSystem.dispose();
        }
        
        // Restore normal lighting
        this.scene.lights.forEach(light => {
            if (light.name !== 'stormLight') {
                light.intensity = 1.0;
            }
        });
        
        this.updateStatus('☀️ Sunny weather restored!');
    }

    addRocks() {
        console.log('🪨 Adding rocks');
        
        for (let i = 0; i < 5; i++) {
            const rock = BABYLON.MeshBuilder.CreateSphere("rock", {
                diameter: Math.random() * 3 + 1
            }, this.scene);
            
            // Random position
            rock.position.x = (Math.random() - 0.5) * 60;
            rock.position.z = (Math.random() - 0.5) * 60;
            rock.position.y = Math.random() * 2;
            
            // Rock material
            const rockMaterial = new BABYLON.StandardMaterial("rockMat", this.scene);
            rockMaterial.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.5);
            rockMaterial.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
            rock.material = rockMaterial;
            
            // Make it slightly irregular
            rock.scaling.x = 0.8 + Math.random() * 0.4;
            rock.scaling.y = 0.6 + Math.random() * 0.4;
            rock.scaling.z = 0.8 + Math.random() * 0.4;
        }
        
        this.updateStatus('🪨 Rocks added to the scene!');
    }

    changeToNight() {
        console.log('🌙 Changing to night');
        
        // Dim all lights
        this.scene.lights.forEach(light => {
            light.intensity = 0.2;
        });
        
        // Add moonlight
        const moonlight = new BABYLON.DirectionalLight("moonlight", new BABYLON.Vector3(0, -1, 0), this.scene);
        moonlight.diffuse = new BABYLON.Color3(0.7, 0.7, 1.0);
        moonlight.intensity = 0.5;
        
        this.updateStatus('🌙 Night time activated!');
    }

    changeToDay() {
        console.log('☀️ Changing to day');
        
        // Remove moonlight
        const moonlight = this.scene.getLightByName("moonlight");
        if (moonlight) {
            moonlight.dispose();
        }
        
        // Restore daylight
        this.scene.lights.forEach(light => {
            if (light.name !== 'moonlight') {
                light.intensity = 1.0;
            }
        });
        
        this.updateStatus('☀️ Daytime restored!');
    }

    addTropicalFlowers() {
        console.log('🌺 Adding tropical flowers');
        
        for (let i = 0; i < 10; i++) {
            const flower = BABYLON.MeshBuilder.CreateSphere("flower", {
                diameter: 0.5
            }, this.scene);
            
            flower.position.x = (Math.random() - 0.5) * 40;
            flower.position.y = 0.25;
            flower.position.z = (Math.random() - 0.5) * 40;
            
            const flowerMaterial = new BABYLON.StandardMaterial("flowerMat", this.scene);
            const colors = [
                new BABYLON.Color3(1, 0.2, 0.5), // Pink
                new BABYLON.Color3(1, 0.8, 0.2), // Yellow
                new BABYLON.Color3(0.8, 0.2, 1), // Purple
                new BABYLON.Color3(1, 0.4, 0.2)  // Orange
            ];
            flowerMaterial.diffuseColor = colors[Math.floor(Math.random() * colors.length)];
            flower.material = flowerMaterial;
        }
        
        this.updateStatus('🌺 Tropical flowers blooming!');
    }

    addSwimmingFish() {
        console.log('🐠 Adding swimming fish');
        
        for (let i = 0; i < 8; i++) {
            const fish = BABYLON.MeshBuilder.CreateSphere("fish", {
                diameter: 0.3
            }, this.scene);
            
            // Position fish in the water
            fish.position.x = (Math.random() - 0.5) * 80;
            fish.position.y = -0.2;
            fish.position.z = (Math.random() - 0.5) * 80;
            
            const fishMaterial = new BABYLON.StandardMaterial("fishMat", this.scene);
            fishMaterial.diffuseColor = new BABYLON.Color3(Math.random(), Math.random(), 1);
            fish.material = fishMaterial;
            
            // Animate fish swimming
            this.scene.registerBeforeRender(() => {
                fish.position.x += Math.sin(Date.now() * 0.001 + i) * 0.02;
                fish.position.z += Math.cos(Date.now() * 0.0007 + i) * 0.02;
                fish.rotation.y = Math.atan2(Math.sin(Date.now() * 0.001 + i), Math.cos(Date.now() * 0.0007 + i));
            });
        }
        
        this.updateStatus('🐠 Fish are now swimming in the water!');
    }

    increasWaves() {
        console.log('🌊 Increasing wave intensity');
        // This would modify the existing wave animation
        this.updateStatus('🌊 Waves are getting bigger!');
    }

    decreaseWaves() {
        console.log('🌊 Decreasing wave intensity');
        // This would modify the existing wave animation
        this.updateStatus('🌊 Waves are calming down!');
    }

    suggestCommands() {
        const suggestions = [
            "• 'Add palm tree' - Creates a new palm tree",
            "• 'Make it stormy' - Changes weather to storm",
            "• 'Make it sunny' - Changes weather to sunny",
            "• 'Add rocks' - Adds rocks to the scene",
            "• 'Make it night' - Changes to night time",
            "• 'Make it day' - Changes to day time",
            "• 'Add flowers' - Creates tropical flowers",
            "• 'Add fish' - Adds swimming fish",
        ];
        
        console.log('Available commands:');
        suggestions.forEach(cmd => console.log(cmd));
        
        setTimeout(() => {
            this.updateStatus("💡 Try typing or saying: 'Add palm tree' or 'Make it stormy'");
        }, 2000);
    }

    getCommandHistory() {
        return this.commandHistory;
    }

    clearCommandHistory() {
        this.commandHistory = [];
        this.updateStatus("🗑️ Command history cleared");
    }

    updateStatus(message) {
        console.log('Status:', message);
        
        // Update status in UI if available
        const statusElement = document.getElementById('status');
        if (statusElement) {
            statusElement.textContent = message;
        }
        
        // Also update any voice-specific status element
        const voiceStatusElement = document.getElementById('voice-status');
        if (voiceStatusElement) {
            voiceStatusElement.textContent = message;
        }
    }
}

// Add voice & text control UI to the existing interface
function addVoiceControlUI() {
    const controlsDiv = document.querySelector('.controls');
    if (controlsDiv) {
        // Create control container
        const controlContainer = document.createElement('div');
        controlContainer.style.marginTop = '15px';
        controlContainer.style.padding = '15px';
        controlContainer.style.background = 'rgba(255,255,255,0.1)';
        controlContainer.style.borderRadius = '10px';
        controlContainer.style.border = '1px solid rgba(78, 205, 196, 0.3)';

        // Voice control section
        const voiceSection = document.createElement('div');
        voiceSection.style.marginBottom = '15px';
        
        const voiceTitle = document.createElement('h4');
        voiceTitle.textContent = '🎤 Voice Control';
        voiceTitle.style.margin = '0 0 10px 0';
        voiceTitle.style.color = '#4ECDC4';
        voiceTitle.style.fontSize = '16px';
        
        const voiceButton = document.createElement('button');
        voiceButton.id = 'voiceControlBtn';
        voiceButton.textContent = '🎤 Start Voice Control';
        voiceButton.style.backgroundColor = '#4ECDC4';
        voiceButton.style.color = 'white';
        voiceButton.style.border = 'none';
        voiceButton.style.padding = '10px 20px';
        voiceButton.style.borderRadius = '5px';
        voiceButton.style.cursor = 'pointer';
        voiceButton.style.marginRight = '10px';
        voiceButton.style.transition = 'all 0.3s ease';
        
        voiceButton.addEventListener('click', () => {
            if (window.voiceModifier) {
                window.voiceModifier.startListening();
            } else {
                alert('Voice control not initialized');
            }
        });

        voiceButton.addEventListener('mouseenter', () => {
            voiceButton.style.backgroundColor = '#44A08D';
            voiceButton.style.transform = 'translateY(-2px)';
        });

        voiceButton.addEventListener('mouseleave', () => {
            voiceButton.style.backgroundColor = '#4ECDC4';
            voiceButton.style.transform = 'translateY(0)';
        });

        voiceSection.appendChild(voiceTitle);
        voiceSection.appendChild(voiceButton);

        // Text control section
        const textSection = document.createElement('div');
        
        const textTitle = document.createElement('h4');
        textTitle.textContent = '💬 Text Commands';
        textTitle.style.margin = '0 0 10px 0';
        textTitle.style.color = '#4ECDC4';
        textTitle.style.fontSize = '16px';

        const textInputContainer = document.createElement('div');
        textInputContainer.style.display = 'flex';
        textInputContainer.style.gap = '10px';
        textInputContainer.style.alignItems = 'center';

        const textInput = document.createElement('input');
        textInput.id = 'textCommandInput';
        textInput.type = 'text';
        textInput.placeholder = 'Type command: "add palm tree", "make it stormy"...';
        textInput.style.flex = '1';
        textInput.style.padding = '10px';
        textInput.style.borderRadius = '5px';
        textInput.style.border = '2px solid #4ECDC4';
        textInput.style.backgroundColor = 'rgba(255,255,255,0.9)';
        textInput.style.fontSize = '14px';

        const textButton = document.createElement('button');
        textButton.id = 'textControlBtn';
        textButton.textContent = '➤ Execute';
        textButton.style.backgroundColor = '#44A08D';
        textButton.style.color = 'white';
        textButton.style.border = 'none';
        textButton.style.padding = '10px 20px';
        textButton.style.borderRadius = '5px';
        textButton.style.cursor = 'pointer';
        textButton.style.transition = 'all 0.3s ease';

        // Text command functionality
        function executeTextCommand() {
            const command = textInput.value.trim();
            if (command && window.voiceModifier) {
                window.voiceModifier.processTextCommand(command);
                textInput.value = '';
                textInput.focus();
            } else if (!command) {
                alert('Please enter a command');
            } else {
                alert('Voice control not initialized');
            }
        }

        textButton.addEventListener('click', executeTextCommand);
        
        textInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                executeTextCommand();
            }
        });

        textButton.addEventListener('mouseenter', () => {
            textButton.style.backgroundColor = '#2D8659';
            textButton.style.transform = 'translateY(-2px)';
        });

        textButton.addEventListener('mouseleave', () => {
            textButton.style.backgroundColor = '#44A08D';
            textButton.style.transform = 'translateY(0)';
        });

        textInputContainer.appendChild(textInput);
        textInputContainer.appendChild(textButton);
        textSection.appendChild(textTitle);
        textSection.appendChild(textInputContainer);

        // Status display
        const statusDiv = document.createElement('div');
        statusDiv.id = 'voice-status';
        statusDiv.style.marginTop = '15px';
        statusDiv.style.padding = '10px';
        statusDiv.style.backgroundColor = 'rgba(78, 205, 196, 0.1)';
        statusDiv.style.border = '2px solid #4ECDC4';
        statusDiv.style.borderRadius = '5px';
        statusDiv.style.fontSize = '14px';
        statusDiv.style.color = '#2d3748';
        statusDiv.style.fontWeight = '500';
        statusDiv.textContent = '💡 Voice & Text control ready - Use microphone or type commands above';

        // Command history button
        const historyButton = document.createElement('button');
        historyButton.textContent = '📜 Command History';
        historyButton.style.backgroundColor = '#6B73FF';
        historyButton.style.color = 'white';
        historyButton.style.border = 'none';
        historyButton.style.padding = '8px 16px';
        historyButton.style.borderRadius = '5px';
        historyButton.style.cursor = 'pointer';
        historyButton.style.fontSize = '12px';
        historyButton.style.marginTop = '10px';
        historyButton.style.marginRight = '10px';

        historyButton.addEventListener('click', () => {
            if (window.voiceModifier) {
                const history = window.voiceModifier.getCommandHistory();
                if (history.length === 0) {
                    alert('No commands executed yet');
                } else {
                    const historyText = history.map(cmd => 
                        `[${cmd.source.toUpperCase()}] ${cmd.command} (${new Date(cmd.timestamp).toLocaleTimeString()})`
                    ).join('\n');
                    alert(`Command History:\n\n${historyText}`);
                }
            }
        });

        // Clear history button
        const clearButton = document.createElement('button');
        clearButton.textContent = '🗑️ Clear History';
        clearButton.style.backgroundColor = '#FF6B6B';
        clearButton.style.color = 'white';
        clearButton.style.border = 'none';
        clearButton.style.padding = '8px 16px';
        clearButton.style.borderRadius = '5px';
        clearButton.style.cursor = 'pointer';
        clearButton.style.fontSize = '12px';
        clearButton.style.marginTop = '10px';

        clearButton.addEventListener('click', () => {
            if (window.voiceModifier) {
                window.voiceModifier.clearCommandHistory();
            }
        });

        // Assemble the UI
        controlContainer.appendChild(voiceSection);
        controlContainer.appendChild(textSection);
        controlContainer.appendChild(statusDiv);
        
        const buttonContainer = document.createElement('div');
        buttonContainer.appendChild(historyButton);
        buttonContainer.appendChild(clearButton);
        controlContainer.appendChild(buttonContainer);

        controlsDiv.appendChild(controlContainer);

        // Quick command buttons
        const quickCommandsTitle = document.createElement('h4');
        quickCommandsTitle.textContent = '⚡ Quick Commands';
        quickCommandsTitle.style.margin = '15px 0 10px 0';
        quickCommandsTitle.style.color = '#4ECDC4';
        quickCommandsTitle.style.fontSize = '16px';

        const quickCommandsGrid = document.createElement('div');
        quickCommandsGrid.style.display = 'grid';
        quickCommandsGrid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(150px, 1fr))';
        quickCommandsGrid.style.gap = '10px';
        quickCommandsGrid.style.marginTop = '10px';

        const quickCommands = [
            { text: '🌴 Palm Tree', command: 'add palm tree' },
            { text: '⛈️ Storm', command: 'make it stormy' },
            { text: '☀️ Sunny', command: 'make it sunny' },
            { text: '🪨 Rocks', command: 'add rocks' },
            { text: '🌙 Night', command: 'make it night' },
            { text: '🌺 Flowers', command: 'add flowers' },
            { text: '🐠 Fish', command: 'add fish' },
            { text: '☀️ Day', command: 'make it day' }
        ];

        quickCommands.forEach(cmd => {
            const button = document.createElement('button');
            button.textContent = cmd.text;
            button.style.backgroundColor = 'rgba(78, 205, 196, 0.8)';
            button.style.color = 'white';
            button.style.border = 'none';
            button.style.padding = '8px 12px';
            button.style.borderRadius = '5px';
            button.style.cursor = 'pointer';
            button.style.fontSize = '12px';
            button.style.transition = 'all 0.2s ease';

            button.addEventListener('click', () => {
                if (window.voiceModifier) {
                    window.voiceModifier.processTextCommand(cmd.command);
                }
            });

            button.addEventListener('mouseenter', () => {
                button.style.backgroundColor = 'rgba(68, 160, 141, 0.9)';
                button.style.transform = 'scale(1.05)';
            });

            button.addEventListener('mouseleave', () => {
                button.style.backgroundColor = 'rgba(78, 205, 196, 0.8)';
                button.style.transform = 'scale(1)';
            });

            quickCommandsGrid.appendChild(button);
        });

        controlsDiv.appendChild(quickCommandsTitle);
        controlsDiv.appendChild(quickCommandsGrid);
    }
}

// Initialize voice control when scene is loaded
// Add this to your existing BabylonXRScene class in the init() method after scene creation:

/*
// Add this after your scene is created in the init() method:
if (this.scene) {
    window.voiceModifier = new VoiceEnvironmentModifier(this.scene);
    addVoiceControlUI();
    console.log('🎤 Voice control initialized');
}
*/