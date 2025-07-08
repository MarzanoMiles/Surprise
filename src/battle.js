import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118.1/build/three.module.js';
import { FBXLoader } from 'https://cdn.jsdelivr.net/npm/three@0.118.1/examples/jsm/loaders/FBXLoader.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.118.1/examples/jsm/loaders/GLTFLoader.js';
import { AIService } from './ai-service.js';

// === Scene Setup ===
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xddeeff);

// === Gradient Sky ===
const skyUniforms = {
  topColor: { value: new THREE.Color(0x0077ff) },
  bottomColor: { value: new THREE.Color(0xffffff) },
  offset: { value: 33 },
  exponent: { value: 0.6 },
};

const skyGeo = new THREE.SphereGeometry(6000, 32, 15);
const skyMat = new THREE.ShaderMaterial({
  uniforms: skyUniforms,
  vertexShader: `
    varying vec3 vWorldPosition;
    void main() {
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }`,
  fragmentShader: `
    uniform vec3 topColor;
    uniform vec3 bottomColor;
    uniform float offset;
    uniform float exponent;
    varying vec3 vWorldPosition;
    void main() {
      float h = normalize(vWorldPosition + offset).y;
      gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
    }`,
  side: THREE.BackSide,
});
const sky = new THREE.Mesh(skyGeo, skyMat);
scene.add(sky);

// === Camera & Renderer ===
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 1000);
camera.position.set(-1.66, 3, 15.25);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.shadowMap.enabled = true;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// === Lighting ===
scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 0.5));
const sun = new THREE.DirectionalLight(0xffffff, 1.0);
sun.position.set(5, 10, 1);
sun.castShadow = true;
sun.shadow.mapSize.width = 2048;
sun.shadow.mapSize.height = 2048;
scene.add(sun);
scene.add(new THREE.AmbientLight(0xffffff, 0.35));

// === Loaders & Character References ===
const loader = new FBXLoader();
const mixers = [];
const characterMap = {};

// === Character Loader ===
function loadAnimatedFBX(path, name, scale = 0.01, position = [0, 0, 0], rotationDeg = 0, keyName, onLoadCallback) {
  loader.load(`${path}${name}`, (fbx) => {
    fbx.scale.set(scale, scale, scale);
    fbx.position.set(...position);
    fbx.rotation.y = THREE.MathUtils.degToRad(rotationDeg);
    fbx.traverse((c) => {
      if (c.isMesh) {
        c.castShadow = true;
        c.receiveShadow = true;
      }
    });
    const mixer = new THREE.AnimationMixer(fbx);
    scene.add(fbx);
    mixers.push(mixer);

    characterMap[keyName] = { fbx, mixer, currentAction: null };

    if (onLoadCallback) onLoadCallback();
  });
}

// === Idle Animation Loader ===
function playIdle(characterKey) {
  const idleFile = 'listen.fbx';
  const path = characterKey === 'player' ? './resources/boy/' : './resources/npc1/';
  loader.load(`${path}${idleFile}`, (anim) => {
    const { mixer, currentAction } = characterMap[characterKey];
    if (currentAction) currentAction.fadeOut(0.2);
    const action = mixer.clipAction(anim.animations[0]);
    action.reset().fadeIn(0.9).play();
    action.setLoop(THREE.LoopRepeat);
    characterMap[characterKey].currentAction = action;
  });
}

// Add this after your scene creation
const textureLoader = new THREE.TextureLoader();
textureLoader.load('./resources/image/bg_battle.jpg', (texture) => {
  scene.background = texture; // This sets the background image
});

// === Map Loader ===
/*
const gltfLoader = new GLTFLoader();
gltfLoader.load('./resources/map/vision/scne.gltf', (gltf) => {
  const mapScene = gltf.scene;
  mapScene.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  mapScene.position.set(0, 75, 0);
  mapScene.scale.set(75, 75, 75);
  mapScene.rotation.y = Math.PI / 3;
  scene.add(mapScene);

  if (gltf.animations?.length > 0) {
    const gltfMixer = new THREE.AnimationMixer(mapScene);
    gltf.animations.forEach((clip) => {
      const action = gltfMixer.clipAction(clip);
      action.play();
    });
    mixers.push(gltfMixer);
  }
});*/

const gltfLoader = new GLTFLoader();
// ==========================1st tile===============================================
// Replace './resources/map/vision/scene.glb' with your GLB file path
gltfLoader.load('./resources/map/tiles/tiles.glb', (gltf) => {
  const mapScene = gltf.scene;
  
  // Enable shadows for all meshes in the scene
  mapScene.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  // Position, scale, and rotate the scene (adjust these values as needed)
  mapScene.position.set(-3, 0, 10);
  mapScene.scale.set(4, 4, 4);
  mapScene.rotation.y = Math.PI / 1;
  
  // Add the loaded scene to your main Three.js scene
  scene.add(mapScene);

  // Since it's a non-animated scene, we can remove the animation mixer part
  // (Optional: If your GLB has animations, keep this block)

}, undefined, (error) => {
  console.error('Error loading GLB file:', error);
});


//===========================2nd tile=======================================================================
gltfLoader.load('./resources/map/tiles/tiles.glb', (gltf) => {
  const map1Scene = gltf.scene;
  
  // Enable shadows for all meshes in the scene
  map1Scene.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  // Position, scale, and rotate the scene (adjust these values as needed)
  map1Scene.position.set(5, 0, 0);
  map1Scene.scale.set(5, 5, 5);
  map1Scene.rotation.y = Math.PI / 1;
  
  // Add the loaded scene to your main Three.js scene
  scene.add(map1Scene);

}, undefined, (error) => {
  console.error('Error loading GLB file:', error);
});






// === Battle System with AI Integration ===
class FlipTopBattleManager {
  constructor() {
    this.aiService = new AIService();
    this.playerConfidence = 100;
    this.npcConfidence = 100;
    this.currentLine = null;
    this.initializeBattleUI();
    this.setupBattle();
    this.lockLandscape();
    this.setupMobileEvents();
  }

  lockLandscape() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
      const lockOrientation = screen.lockOrientation || screen.mozLockOrientation || 
                            screen.msLockOrientation || screen.orientation.lock;
      if (lockOrientation) {
        try {
          lockOrientation('landscape');
        } catch (e) {
          console.log("Orientation lock not supported");
        }
      }
      
      // Check orientation and hide warning if landscape
      const checkOrientation = () => {
        if (Math.abs(window.orientation) === 90) {
          document.getElementById('orientation-warning').style.display = 'none';
        } else {
          document.getElementById('orientation-warning').style.display = 'flex';
        }
      };
      
      window.addEventListener('orientationchange', checkOrientation);
      checkOrientation();
    }
  }

  setupMobileEvents() {
    // Prevent zooming
    document.addEventListener('touchmove', function(e) {
      if (e.scale !== 1) { e.preventDefault(); }
    }, { passive: false });

    // Prevent double tap zoom
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function(event) {
      const now = (new Date()).getTime();
      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }
      lastTouchEnd = now;
    }, false);
  }

  async setupBattle() {
    try {
      const aiResponse = await this.aiService.generateBattlePrompt();
      this.parseAIResponse(aiResponse);
    } catch (error) {
      console.error("AI failed, using fallback:", error);
      this.useFallbackLines();
    }
  }

  parseAIResponse(response) {
    try {
      let text = response.candidates[0].content.parts[0].text;
      const lines = text.split('\n').filter(l => l.trim());
      
      if (lines.length < 4) throw new Error('Invalid response format');
      
      // Create options with original correctness (first option is correct)
      const originalOptions = [
        { 
          text: lines[1].replace(/^1\.\s*/, '').trim(), 
          correct: true,
          playerAnim: "boy_taunt.fbx",
          npcAnim: "npc_lose.fbx"
        },
        { 
          text: lines[2].replace(/^2\.\s*/, '').trim(),
          correct: false,
          playerAnim: "boy_sad.fbx",
          npcAnim: "npc_taunt.fbx"
        },
        { 
          text: lines[3].replace(/^3\.\s*/, '').trim(),
          correct: false,
          playerAnim: "boy_sad.fbx",
          npcAnim: "npc_taunt.fbx"
        }
      ];
  
      // Create a shuffled version while preserving correctness
      const shuffledOptions = this.shuffleArray(originalOptions);
  
      // Find the new index of the correct answer after shuffling
      const correctIndex = shuffledOptions.findIndex(opt => opt.correct);
      
      // Ensure only one correct answer exists
      shuffledOptions.forEach((opt, index) => {
        opt.correct = (index === correctIndex);
        // Update animations based on new correctness
        if (opt.correct) {
          opt.playerAnim = "boy_taunt.fbx";
          opt.npcAnim = "npc_lose.fbx";
        } else {
          opt.playerAnim = "boy_sad.fbx";
          opt.npcAnim = "npc_taunt.fbx";
        }
      });
  
      this.currentLine = {
        text: lines[0],
        options: shuffledOptions
      };
      
      this.displayLine();
    } catch (error) {
      console.error('Error parsing AI response:', error);
      this.useFallbackLines();
    }
  }
  
  shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }

  useFallbackLines() {
    this.currentLine = {
      text: "Without _____, the castle is in danger!",
      options: [
        { text: "defense", correct: true, playerAnim: "boy_taunt.fbx", npcAnim: "npc_lose.fbx" },
        { text: "army", correct: false, playerAnim: "boy_sad.fbx", npcAnim: "npc_taunt.fbx" },
        { text: "leader", correct: false, playerAnim: "boy_sad.fbx", npcAnim: "npc_taunt.fbx" },
      ]
    };
    this.displayLine();
  }

  initializeBattleUI() {
    // Create UI container
    const container = document.createElement('div');
    container.id = 'battle-ui';
    document.body.appendChild(container);

    // Create question element
    const question = document.createElement('div');
    question.id = 'question';
    container.appendChild(question);

    // Create options container
    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'options-container';
    container.appendChild(optionsContainer);

    // Create option buttons
    this.optionButtons = [];
    for (let i = 0; i < 3; i++) {
      const btn = document.createElement('button');
      btn.className = 'battle-option';
      btn.onclick = () => this.handleAnswer(i);
      optionsContainer.appendChild(btn);
      this.optionButtons.push(btn);
    }

    // Create confidence bars container
    const barsContainer = document.createElement('div');
    barsContainer.className = 'confidence-bars';
    document.body.appendChild(barsContainer);

    // Create bars
    this.bars = {
      player: this.createBar('Your Vibe', 'bar-player', barsContainer),
      npc: this.createBar('AI Confidence', 'bar-npc', barsContainer),
    };
    
    // Add orientation warning element
    const warning = document.createElement('div');
    warning.id = 'orientation-warning';
    warning.innerHTML = `
      <div class="warning-content">
        <h2>Please rotate your device to landscape mode</h2>
        <div class="phone-icon">
          <div class="phone"></div>
          <div class="arrow"></div>
        </div>
      </div>
    `;
    document.body.appendChild(warning);
  }

  createBar(label, barClass, container) {
    const barGroup = document.createElement('div');
    
    const labelEl = document.createElement('div');
    labelEl.className = 'bar-label';
    labelEl.innerText = label;
    barGroup.appendChild(labelEl);

    const barContainer = document.createElement('div');
    barContainer.className = 'bar-container';
    barGroup.appendChild(barContainer);

    const fill = document.createElement('div');
    fill.className = `bar-fill ${barClass}`;
    barContainer.appendChild(fill);

    container.appendChild(barGroup);
    return fill;
  }

  displayLine() {
    document.getElementById('question').innerText = this.currentLine.text;
    this.currentLine.options.forEach((opt, i) => {
      const btn = this.optionButtons[i];
      btn.innerText = opt.text;
      btn.className = 'battle-option'; // Reset classes
    });
  }

  async handleAnswer(index) {
    const option = this.currentLine.options[index];
    
    // Disable buttons during animation
    this.optionButtons.forEach(btn => {
      btn.disabled = true;
    });
    
    // Add feedback class
    if (option.correct) {
      this.optionButtons[index].classList.add('correct');
    } else {
      this.optionButtons[index].classList.add('incorrect');
    }
    
    this.playAnimation(option.playerAnim, option.npcAnim);

    if (!option.correct) {
      this.playerConfidence = Math.max(0, this.playerConfidence - 25);
    } else {
      this.npcConfidence = Math.max(0, this.npcConfidence - 25);
    }

    this.updateBars();

    setTimeout(async () => {
      if (this.playerConfidence <= 0 || this.npcConfidence <= 0) {
        this.showResultMessage();
        return;
      }

      try {
        const aiResponse = await this.aiService.generateBattlePrompt();
        this.parseAIResponse(aiResponse);
      } catch (error) {
        console.error("AI failed to generate next line:", error);
        this.useFallbackLines();
      }
      
      // Re-enable buttons
      this.optionButtons.forEach(btn => {
        btn.disabled = false;
      });
    }, 2000);
  }

  updateBars() {
    this.bars.player.style.width = `${this.playerConfidence}%`;
    this.bars.npc.style.width = `${this.npcConfidence}%`;
  }

  playAnimation(playerAnim, npcAnim) {
    const fadeTime = 0.3;

    if (playerAnim && characterMap.player) {
      loader.load(`./resources/boy/${playerAnim}`, (anim) => {
        const { mixer, currentAction } = characterMap.player;
        if (currentAction) currentAction.fadeOut(fadeTime);
        const newAction = mixer.clipAction(anim.animations[0]);
        newAction.reset().fadeIn(fadeTime).play();
        newAction.setLoop(THREE.LoopOnce);
        newAction.clampWhenFinished = true;
        characterMap.player.currentAction = newAction;
        setTimeout(() => playIdle('player'), anim.animations[0].duration * 1000 + 500);
      });
    }

    if (npcAnim && characterMap.npc) {
      loader.load(`./resources/npc1/${npcAnim}`, (anim) => {
        const { mixer, currentAction } = characterMap.npc;
        if (currentAction) currentAction.fadeOut(fadeTime);
        const newAction = mixer.clipAction(anim.animations[0]);
        newAction.reset().fadeIn(fadeTime).play();
        newAction.setLoop(THREE.LoopOnce);
        newAction.clampWhenFinished = true;
        characterMap.npc.currentAction = newAction;
        setTimeout(() => playIdle('npc'), anim.animations[0].duration * 1000 + 500);
      });
    }
  }

  async showResultMessage() {
    const resultText = this.playerConfidence <= 0 ? 'YOU LOSE!' : 'ACHIEVEMENT UNLOCKED!';
    const message = this.playerConfidence <= 0 ? 
      'BETTER LUCK NEXT TIME<br>KEEP PRACTICING' : 
      'YOU\'VE LEARNED THE<br>FUNDAMENTALS';
  
    // Load CSS
    const cssLink = document.createElement('link');
    cssLink.rel = 'stylesheet';
    cssLink.href = './congratulations.css';
    document.head.appendChild(cssLink);
  
    // Load HTML template
    const response = await fetch('./congratulations-template.html');
    let html = await response.text();
    
    // Replace placeholders
    html = html.replace('{{TITLE}}', resultText)
               .replace('{{MESSAGE}}', message);
  
    // Create overlay
    const overlay = document.createElement('div');
    overlay.id = 'congratulations-overlay';
    overlay.innerHTML = html;
    document.body.appendChild(overlay);
  
    // Handle continue button
    overlay.querySelector('.continue-btn').addEventListener('click', () => {
      overlay.remove();
      cssLink.remove();
      window.location.href = './index.html'; // Or your desired action
    });
  }
}

// === Animation Loop ===
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  mixers.forEach((m) => m.update(delta));
  renderer.render(scene, camera);
}
animate();

// === Resize Handler ===
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// === Load Characters Then Start ===
let loadedCount = 0;
function tryStart() {
  loadedCount++;
  if (loadedCount === 2) {
    playIdle('player');
    playIdle('npc');
    new FlipTopBattleManager();
  }
}

loadAnimatedFBX('./resources/boy/', 'player_boy.fbx', 0.035, [-3.5, 0, 10], 120, 'player', tryStart);
loadAnimatedFBX('./resources/npc1/', 'npc_default.fbx', 0.05, [5, 0, 0], -30, 'npc', tryStart);

// === Music Setup ===

// Create an AudioListener and add it to the camera
const listener = new THREE.AudioListener();
camera.add(listener);

// Create an Audio object and load a sound
const sound = new THREE.Audio(listener);
const audioLoader = new THREE.AudioLoader();

// Load and play music when user clicks anywhere
let musicPlaying = false;

function playMusic() {
  if (!musicPlaying) {
    audioLoader.load('./resources/sounds/flip-style.mp3', (buffer) => {
      sound.setBuffer(buffer);
      sound.setLoop(true); // Set to loop the music
      sound.setVolume(0.5); // Set volume (0.0 to 1.0)
      sound.play(); // Start playing
      musicPlaying = true;
    });
  }
}

// Add click event to play music
window.addEventListener('click', playMusic);