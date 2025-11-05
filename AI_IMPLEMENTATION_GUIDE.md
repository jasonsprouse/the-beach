# AI-Powered Dynamic Environment Generator

This implementation guide shows how to extend The Beach with AI-powered dynamic scene generation and voice-controlled environment modification.

## Implementation Example: Voice-Controlled Scene Generation

### 1. Enhanced XR Controller with Dynamic Scene Generation

Add these methods to your existing `XrController`:

```typescript
// Add to src/xr/xr.controller.ts

import { OpenAI } from 'openai';

@Controller('xr')
export class XrController {
  private openai: OpenAI;
  private generatedScenes = new Map<string, any>();

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY, // Add to your .env file
    });
  }

  @Post('generate-scene')
  @UseGuards(WebAuthnAuthGuard)
  async generateCustomScene(
    @Body() request: {
      preferences: {
        environmentType: string;
        mood: string;
        activities: string[];
        weather: string;
        timeOfDay: string;
      }
    },
    @Session() session: UserSession
  ) {
    try {
      // Build AI prompt for scene generation
      const prompt = this.buildSceneGenerationPrompt(request.preferences);
      
      // Generate scene code using OpenAI
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert Babylon.js developer creating WebXR scenes. Generate complete, working JavaScript code."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7
      });

      const generatedCode = completion.choices[0].message.content;
      
      // Validate and sanitize the generated code
      const validatedCode = await this.validateSceneCode(generatedCode);
      
      // Create unique scene ID
      const sceneId = `scene_${session.username}_${Date.now()}`;
      
      // Store the generated scene
      this.generatedScenes.set(sceneId, {
        code: validatedCode,
        username: session.username,
        preferences: request.preferences,
        createdAt: new Date(),
        pkpAddress: session.pkpAddress
      });

      return {
        success: true,
        sceneId,
        sceneUrl: `/xr/custom/${sceneId}`,
        generatedAt: new Date().toISOString(),
        preview: this.extractScenePreview(validatedCode)
      };

    } catch (error) {
      throw new BadRequestException(`Scene generation failed: ${error.message}`);
    }
  }

  @Get('custom/:sceneId')
  @UseGuards(WebAuthnAuthGuard)
  async serveCustomScene(
    @Param('sceneId') sceneId: string,
    @Session() session: UserSession,
    @Res() res: Response
  ) {
    const sceneData = this.generatedScenes.get(sceneId);
    
    if (!sceneData) {
      throw new NotFoundException('Scene not found');
    }

    // Verify user owns this scene
    if (sceneData.username !== session.username) {
      throw new ForbiddenException('Access denied');
    }

    // Generate HTML with the custom scene
    const html = this.generateCustomSceneHTML(sceneData);
    
    res.setHeader('Content-Type', 'text/html');
    return res.send(html);
  }

  @Post('voice-modify')
  @UseGuards(WebAuthnAuthGuard)
  async processVoiceModification(
    @Body() request: {
      sceneId: string;
      voiceCommand: string;
      audioData?: string; // base64 encoded audio
    },
    @Session() session: UserSession
  ) {
    try {
      const sceneData = this.generatedScenes.get(request.sceneId);
      
      if (!sceneData || sceneData.username !== session.username) {
        throw new ForbiddenException('Scene not found or access denied');
      }

      // Process voice command to generate modification
      const modificationPrompt = this.buildModificationPrompt(
        request.voiceCommand,
        sceneData.code
      );

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are modifying an existing Babylon.js scene. Provide only the additional code needed to implement the requested change."
          },
          {
            role: "user",
            content: modificationPrompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      });

      const modificationCode = completion.choices[0].message.content;
      const validatedModification = await this.validateModificationCode(modificationCode);

      // Apply modification to existing scene
      sceneData.code = this.applyModification(sceneData.code, validatedModification);
      sceneData.modifications = sceneData.modifications || [];
      sceneData.modifications.push({
        command: request.voiceCommand,
        code: validatedModification,
        appliedAt: new Date()
      });

      return {
        success: true,
        modification: validatedModification,
        appliedAt: new Date().toISOString()
      };

    } catch (error) {
      throw new BadRequestException(`Voice modification failed: ${error.message}`);
    }
  }

  private buildSceneGenerationPrompt(preferences: any): string {
    return `
Create a Babylon.js WebXR scene with these specifications:

Environment Type: ${preferences.environmentType}
Mood: ${preferences.mood}
Activities: ${preferences.activities.join(', ')}
Weather: ${preferences.weather}
Time of Day: ${preferences.timeOfDay}

Requirements:
1. Must use Babylon.js 8.x API
2. Include WebXR support with VR controllers
3. Add teleportation points for VR navigation
4. Implement collision detection
5. Create appropriate lighting for ${preferences.timeOfDay} with ${preferences.weather} weather
6. Add interactive elements for ${preferences.activities.join(' and ')}
7. Ensure 90fps performance for VR
8. Include error handling

Structure the code as a class called CustomScene with these methods:
- constructor(engine, canvas)
- async createScene()
- initializeXR()
- setupLighting()
- createEnvironment()
- addInteractiveElements()

Return complete, working JavaScript code only.
    `;
  }

  private buildModificationPrompt(voiceCommand: string, existingCode: string): string {
    return `
Current scene code:
${existingCode}

User voice command: "${voiceCommand}"

Generate JavaScript code to modify the existing scene based on this voice command.
- Provide only the additional code needed
- Ensure compatibility with existing scene
- Maintain VR performance standards
- Include any necessary error handling

Return only the modification code.
    `;
  }

  private async validateSceneCode(code: string): Promise<string> {
    // Basic security validation
    const forbiddenPatterns = [
      /eval\(/gi,
      /Function\(/gi,
      /document\.cookie/gi,
      /localStorage/gi,
      /sessionStorage/gi,
      /XMLHttpRequest/gi,
      /fetch\(/gi,
      /import\(/gi,
      /require\(/gi
    ];

    for (const pattern of forbiddenPatterns) {
      if (pattern.test(code)) {
        throw new Error(`Forbidden pattern detected: ${pattern}`);
      }
    }

    // Additional validation logic here
    return code;
  }

  private async validateModificationCode(code: string): Promise<string> {
    // Similar validation for modifications
    return this.validateSceneCode(code);
  }

  private generateCustomSceneHTML(sceneData: any): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Custom Paradise - ${sceneData.preferences.environmentType}</title>
    
    <!-- Babylon.js -->
    <script src="https://cdn.babylonjs.com/babylon.js"></script>
    <script src="https://cdn.babylonjs.com/loaders/babylonjs.loaders.min.js"></script>
    <script src="https://cdn.babylonjs.com/materialsLibrary/babylonjs.materials.min.js"></script>
    <script src="https://cdn.babylonjs.com/gui/babylon.gui.min.js"></script>
    
    <style>
        html, body { overflow: hidden; width: 100%; height: 100%; margin: 0; padding: 0; }
        #renderCanvas { width: 100%; height: 100%; touch-action: none; }
        #controls { position: absolute; top: 20px; left: 20px; z-index: 100; background: rgba(0,0,0,0.8); color: white; padding: 20px; border-radius: 10px; }
    </style>
</head>
<body>
    <canvas id="renderCanvas"></canvas>
    
    <div id="controls">
        <h3>🏝️ Custom Paradise</h3>
        <p><strong>Environment:</strong> ${sceneData.preferences.environmentType}</p>
        <p><strong>Mood:</strong> ${sceneData.preferences.mood}</p>
        <button onclick="startVoiceModification()">🎤 Voice Modify</button>
        <button onclick="enterVR()">🥽 Enter VR</button>
        <div id="status">Ready</div>
    </div>

    <script>
        // Voice recognition setup
        let recognition;
        if ('webkitSpeechRecognition' in window) {
            recognition = new webkitSpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-US';
        }

        function startVoiceModification() {
            if (!recognition) {
                alert('Voice recognition not supported');
                return;
            }

            document.getElementById('status').textContent = 'Listening...';
            recognition.start();

            recognition.onresult = async function(event) {
                const command = event.results[0][0].transcript;
                document.getElementById('status').textContent = 'Processing: ' + command;

                try {
                    const response = await fetch('/xr/voice-modify', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({
                            sceneId: '${sceneData.sceneId}',
                            voiceCommand: command
                        })
                    });

                    const result = await response.json();
                    if (result.success) {
                        // Apply the modification to the scene
                        eval(result.modification);
                        document.getElementById('status').textContent = 'Modified: ' + command;
                    }
                } catch (error) {
                    document.getElementById('status').textContent = 'Error: ' + error.message;
                }
            };

            recognition.onerror = function(event) {
                document.getElementById('status').textContent = 'Voice error: ' + event.error;
            };
        }

        // Initialize the scene
        const canvas = document.getElementById("renderCanvas");
        const engine = new BABYLON.Engine(canvas, true);
        
        ${sceneData.code}
        
        // Create and start the custom scene
        const customScene = new CustomScene(engine, canvas);
        customScene.createScene().then(scene => {
            engine.runRenderLoop(() => scene.render());
            
            window.addEventListener("resize", () => {
                engine.resize();
            });
        });

        function enterVR() {
            if (customScene.scene.getEngine().vrDisplaysPromise) {
                customScene.initializeXR();
            }
        }
    </script>
</body>
</html>
    `;
  }

  private extractScenePreview(code: string): string {
    // Extract a preview description from the generated code
    const lines = code.split('\n');
    const comments = lines.filter(line => line.trim().startsWith('//'));
    return comments.slice(0, 3).join('\n') || 'Custom generated scene';
  }

  private applyModification(existingCode: string, modificationCode: string): string {
    // Simple approach: append modification to existing code
    // In a production system, you'd want more sophisticated code merging
    return existingCode + '\n\n// Voice Modification\n' + modificationCode;
  }
}
```

### 2. Frontend Voice Interface Component

Create `public/js/voice-scene-generator.js`:

```javascript
class VoiceSceneGenerator {
  constructor() {
    this.isListening = false;
    this.recognition = null;
    this.initializeSpeechRecognition();
  }

  initializeSpeechRecognition() {
    if ('webkitSpeechRecognition' in window) {
      this.recognition = new webkitSpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';
      
      this.recognition.onstart = () => {
        this.isListening = true;
        this.updateStatus('🎤 Listening for your environment preferences...');
      };
      
      this.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        this.processVoiceCommand(transcript);
      };
      
      this.recognition.onerror = (event) => {
        this.updateStatus(`❌ Speech recognition error: ${event.error}`);
        this.isListening = false;
      };
      
      this.recognition.onend = () => {
        this.isListening = false;
      };
    } else {
      console.warn('Speech recognition not supported');
    }
  }

  async startEnvironmentCreation() {
    if (!this.recognition) {
      alert('Voice recognition not supported in this browser');
      return;
    }

    this.updateStatus('🎤 Tell me what kind of environment you want to create...');
    this.recognition.start();
  }

  async processVoiceCommand(transcript) {
    this.updateStatus(`🤖 Processing: "${transcript}"`);
    
    try {
      // Parse the voice command to extract preferences
      const preferences = await this.parseEnvironmentPreferences(transcript);
      
      // Generate the scene
      const scene = await this.generateScene(preferences);
      
      // Redirect to the generated scene
      if (scene.success) {
        this.updateStatus('✅ Environment created! Redirecting...');
        setTimeout(() => {
          window.location.href = scene.sceneUrl;
        }, 2000);
      }
      
    } catch (error) {
      this.updateStatus(`❌ Error: ${error.message}`);
    }
  }

  async parseEnvironmentPreferences(transcript) {
    // Use a simple keyword-based approach or call an AI service
    const preferences = {
      environmentType: 'tropical', // default
      mood: 'relaxing',
      activities: ['exploration'],
      weather: 'sunny',
      timeOfDay: 'midday'
    };

    // Simple keyword matching
    if (transcript.toLowerCase().includes('forest')) preferences.environmentType = 'forest';
    if (transcript.toLowerCase().includes('space')) preferences.environmentType = 'space';
    if (transcript.toLowerCase().includes('underwater')) preferences.environmentType = 'underwater';
    
    if (transcript.toLowerCase().includes('energetic')) preferences.mood = 'energetic';
    if (transcript.toLowerCase().includes('mysterious')) preferences.mood = 'mysterious';
    if (transcript.toLowerCase().includes('cozy')) preferences.mood = 'cozy';
    
    if (transcript.toLowerCase().includes('night')) preferences.timeOfDay = 'night';
    if (transcript.toLowerCase().includes('sunset')) preferences.timeOfDay = 'sunset';
    if (transcript.toLowerCase().includes('dawn')) preferences.timeOfDay = 'dawn';

    return preferences;
  }

  async generateScene(preferences) {
    const response = await fetch('/xr/generate-scene', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ preferences })
    });

    if (!response.ok) {
      throw new Error(`Failed to generate scene: ${response.statusText}`);
    }

    return await response.json();
  }

  updateStatus(message) {
    const statusElement = document.getElementById('voice-status');
    if (statusElement) {
      statusElement.textContent = message;
    }
    console.log(message);
  }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
  window.voiceGenerator = new VoiceSceneGenerator();
});
```

### 3. Updated Landing Page with Voice Interface

Add to your `public/index.html`:

```html
<!-- Add this section after the existing hero section -->
<section class="py-20 bg-gradient-to-br from-blue-50 to-green-50">
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
    <h2 class="text-3xl font-bold text-gray-900 mb-8">
      🎤 Voice-Powered Environment Creation
    </h2>
    <p class="text-lg text-gray-600 mb-8">
      Tell us what kind of virtual environment you want, and our AI will create it for you instantly.
    </p>
    
    <div class="bg-white p-8 rounded-xl shadow-lg max-w-2xl mx-auto">
      <div id="voice-status" class="text-gray-600 mb-6">
        Ready to create your perfect virtual environment
      </div>
      
      <button 
        onclick="window.voiceGenerator?.startEnvironmentCreation()"
        class="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition duration-200">
        🎤 Start Voice Creation
      </button>
      
      <div class="mt-6 text-sm text-gray-500">
        <p>Example: "Create a mystical forest with glowing mushrooms at sunset"</p>
        <p>or "I want an underwater cave with bioluminescent fish"</p>
      </div>
    </div>
  </div>
</section>

<!-- Add the voice generator script -->
<script src="/js/voice-scene-generator.js"></script>
```

### 4. Environment File Setup

Add to your `.env` file:

```env
# OpenAI API Key for scene generation
OPENAI_API_KEY=your_openai_api_key_here

# Optional: Other AI service keys
ANTHROPIC_API_KEY=your_anthropic_key_here
```

### 5. Package Dependencies

Add to your `package.json`:

```json
{
  "dependencies": {
    "openai": "^4.0.0",
    "axios": "^1.5.0"
  }
}
```

## Usage Examples

### Example 1: Forest Environment
**Voice Command:** "Create a mystical forest with glowing mushrooms and fairy lights at twilight"

**Generated Scene Features:**
- Tall trees with animated leaves
- Glowing mushroom clusters
- Particle effects for fairy lights
- Twilight lighting with purple/blue tones
- Forest ambient sounds

### Example 2: Space Station
**Voice Command:** "I want a futuristic space station with Earth visible through windows"

**Generated Scene Features:**
- Metallic corridors and rooms
- Large windows showing Earth
- Floating control panels
- Zero-gravity movement simulation
- Ambient space sounds

### Example 3: Underwater Cave
**Voice Command:** "Create an underwater cave system with schools of tropical fish"

**Generated Scene Features:**
- Rock cave formations
- Animated tropical fish
- Underwater lighting effects
- Bubble particle systems
- Ocean ambient sounds

## Next Steps

1. **Install Dependencies:** `npm install openai axios`
2. **Set up API Keys:** Add your OpenAI API key to `.env`
3. **Test Voice Recognition:** Ensure browser supports WebKit Speech Recognition
4. **Implement Security:** Add proper code validation and sandboxing
5. **Enhance AI Prompts:** Improve scene generation prompts for better results
6. **Add Error Handling:** Implement robust error handling for production use

This implementation provides a foundation for AI-powered dynamic environment generation that can be extended with more sophisticated features like camera-based environment matching, collaborative creation, and advanced voice processing.