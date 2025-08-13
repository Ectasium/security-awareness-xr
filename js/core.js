// core.js - Main class initialization and WebXR setup

class ARExperience {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.session = null;
        
        // State
        this.experienceStarted = false;
        this.isXRActive = false;
        this.isPaused = false;
        this.currentScene = null;
        
        // For managing interactive objects
        this.modelInteractions = new Map();

        // Raycaster for XR interaction
        this.raycasterLine = null;
        this.rayLength = 5;

        this.mixers = [];
        this.clock = new THREE.Clock();

        this.init();
    }
    
    async init() {        
        document.getElementById('endPage').style.display = 'none';
    
        document.getElementById('startButton').addEventListener('click', async () => {
            try {                  
                document.getElementById('landingPage').style.display = 'none';
                document.getElementById('arView').style.display = 'block';
                
                this.showLoadingProgress();
                
                this.updateLoadingProgress('Initializing 3D environment...');
                this.initializeThreeJS();
                
                this.updateLoadingProgress('Loading essential resources...');
                await this.loadEssentialResources();
                
                this.updateLoadingProgress('Setting up controls...');
                this.renderer.xr.enabled = true;
                await this.setupControls();
                
                this.updateLoadingProgress('Starting experience...');
                
                this.renderer.setAnimationLoop((timestamp, frame) => {
                    this.render(timestamp, frame);
                });
                
                this.hideLoadingProgress();
                this.startExperience();
                
                // Load remaining scenes in background
                this.loadRemainingResources();
                
            } catch (error) {
                this.hideLoadingProgress();
                console.error('Failed to start:', error);
                alert('Failed to start project: ' + error.message);
            }
        });    
        
        window.addEventListener('resize', () => this.onWindowResize());
    }

    initializeThreeJS() {
        this.scene = new THREE.Scene();
        
        this.camera = new THREE.PerspectiveCamera(
            70,
            window.innerWidth / window.innerHeight,
            0.01,
            100
        );
        
        const canvas = document.getElementById('arCanvas');
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: canvas, 
            antialias: true,
            alpha: true,
            precision: 'mediump'
        });
        
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.shadowMap.enabled = false;
        
        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
        directionalLight.position.set(1, 1, 1);
        this.scene.add(directionalLight);
        
        const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight2.position.set(-1, -1, -1);
        this.scene.add(directionalLight2);
    }

    showLoadingProgress() {
        const loadingDiv = document.createElement('div');
        loadingDiv.id = 'loadingProgress';
        loadingDiv.innerHTML = `
            <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(0,0,0,0.8); color: white; padding: 30px; border-radius: 15px; text-align: center; z-index: 1000; min-width: 300px;">
                <h3 style="margin-bottom: 20px; color: #fff;">Loading...</h3>
                <div id="loadingText" style="margin-bottom: 15px;">Preparing experience...</div>
                <div style="background: #333; height: 4px; border-radius: 2px; overflow: hidden;">
                    <div id="loadingBar" style="background: #4CAF50; height: 100%; width: 0%; transition: width 0.3s ease;"></div>
                </div>
            </div>
        `;
        document.body.appendChild(loadingDiv);
    }

    updateLoadingProgress(text, progress = null) {
        const loadingText = document.getElementById('loadingText');
        if (loadingText) loadingText.textContent = text;
        
        if (progress !== null) {
            const loadingBar = document.getElementById('loadingBar');
            if (loadingBar) loadingBar.style.width = progress + '%';
        }
    }

    hideLoadingProgress() {
        const loadingDiv = document.getElementById('loadingProgress');
        if (loadingDiv) document.body.removeChild(loadingDiv);
    }

    async loadEssentialResources() {
        const loader = new THREE.GLTFLoader();
        
        const loadGLB = (path, name) => {
            return new Promise((resolve, reject) => {
                loader.load(
                    path,
                    (gltf) => {
                        console.log(`✅ Loaded: ${name}`);
                        resolve(gltf);
                    },
                    (progress) => {
                        const percent = Math.round((progress.loaded / progress.total) * 100);
                        this.updateLoadingProgress(`Loading ${name}: ${percent}%`, percent);
                    },
                    (error) => {
                        console.error(`❌ Failed to load ${path}:`, error);
                        reject(error);
                    }
                );
            });
        };

        try {
            // Scene 1 essentials
            this.startButtonModelGLB = await loadGLB('./assets/models/startButtonModel.glb', 'Start Button');
            this.startButtonModel = this.startButtonModelGLB.scene;
            
            this.wendyNTModelGLB = await loadGLB('./assets/models/wendyNTModel.glb', 'Wendy NT');
            this.wendyNTModel = this.wendyNTModelGLB.scene;

            // Navigation buttons
            this.nextButtonModelGLB = await loadGLB('./assets/models/nextButtonModel.glb', 'Next Button');
            this.nextButtonModel = this.nextButtonModelGLB.scene;
            
            this.quitButtonModelGLB = await loadGLB('./assets/models/quitButtonModel.glb', 'Quit Button');
            this.quitButtonModel = this.quitButtonModelGLB.scene;

            // Essential audio
            this.audioIntroMsg = new Audio('./assets/audio/audioIntroMsg.mp3');
            
            console.log('✅ Essential resources loaded');
            
        } catch (error) {
            console.error('❌ Essential loading failed:', error);
            throw error;
        }
    }

    async loadRemainingResources() {
        console.log('🔄 Loading remaining scenes in background...');
        
        try {
            await this.loadScene2Resources();
            await this.loadScene3Resources();
            console.log('✅ All scenes loaded successfully');
            this.showModelsAnimations();
        } catch (error) {
            console.warn('⚠️ Some background loading failed:', error);
        }
    }

    async loadScene2Resources() {
        const loader = new THREE.GLTFLoader();
        
        const loadGLB = (path) => {
            return new Promise((resolve, reject) => {
                loader.load(path, resolve, undefined, reject);
            });
        };

        try {
            console.log('📦 Loading Scene 2 Resources...');
            
            const results = await Promise.all([
                loadGLB('./assets/models/cafeModelS3.glb'),
                loadGLB('./assets/models/wendyModel.glb'),
                loadGLB('./assets/models/mendyModel.glb'),
                loadGLB('./assets/models/doc1Model.glb'),
                loadGLB('./assets/models/doc2Model.glb'),
                loadGLB('./assets/models/word1Model.glb'),
                loadGLB('./assets/models/word2Model.glb'),
                loadGLB('./assets/models/word3Model.glb'),
                loadGLB('./assets/models/sunglassesModel.glb'),
                loadGLB('./assets/models/wendyGlassesModelS3.glb')
            ]);
            
            [this.cafeModelS3GLB, this.wendyModelGLB, this.mendyModelGLB, 
             this.doc1ModelGLB, this.doc2ModelGLB, this.word1ModelGLB, 
             this.word2ModelGLB, this.word3ModelGLB, this.sunglassesModelGLB, 
             this.wendyGlassesModelS3GLB] = results;
            
            this.cafeModelS3 = this.cafeModelS3GLB.scene;
            this.wendyModel = this.wendyModelGLB.scene;
            this.mendyModel = this.mendyModelGLB.scene;
            this.doc1Model = this.doc1ModelGLB.scene;
            this.doc2Model = this.doc2ModelGLB.scene;
            this.word1Model = this.word1ModelGLB.scene;
            this.word2Model = this.word2ModelGLB.scene;
            this.word3Model = this.word3ModelGLB.scene;
            this.sunglassesModel = this.sunglassesModelGLB.scene;
            this.wendyGlassesModelS3 = this.wendyGlassesModelS3GLB.scene;

            this.audioS2 = new Audio('./assets/audio/audioS2.mp3');
            
            this.scene2ModelAnimations = [
                { modelName: 'cafeModelS3', animationName: 'CafeAction' },
                { modelName: 'doc1Model', animationName: 'document_1Action' },
                { modelName: 'doc2Model', animationName: 'document_2Action' },
                { modelName: 'mendyModel', animationName: 'MendyAction' },
                { modelName: 'wendyModel', animationName: 'Romy-WendyAction' },
                { modelName: 'word1Model', animationName: 'S1_wordAction' },
                { modelName: 'word2Model', animationName: 'S2_wordAction' },
                { modelName: 'word3Model', animationName: 'S3_wordAction' },
                { modelName: 'sunglassesModel', animationName: 'sunglassesAction' },
                { modelName: 'wendyGlassesModelS3', animationName: 'Romy-Wendy+glassesAction' }
            ];

            this.scene2AudioTracks = ['audioS2'];
            
            console.log('✅ Scene 2 resources loaded');
            
        } catch (error) {
            console.warn('⚠️ Scene 2 loading failed:', error);
        }
    }

    async loadScene3Resources() {
        const loader = new THREE.GLTFLoader();
        
        const loadGLB = (path) => {
            return new Promise((resolve, reject) => {
                loader.load(path, resolve, undefined, reject);
            });
        };

        try {
            console.log('📦 Loading Scene 3 Resources...');
            
            const results = await Promise.all([
                loadGLB('./assets/models/laptopModel.gltf'),
                loadGLB('./assets/models/tabletModel.gltf'),
                loadGLB('./assets/models/tableModel.glb'),
                loadGLB('./assets/models/flatTableModel.glb'),
                loadGLB('./assets/models/notebookModel.gltf')
            ]);
            
            [this.laptopModelGLB, this.tabletModelGLB, this.tableModelGLB,
             this.flatTableModelGLB, this.notebookModelGLB] = results;
            
            this.laptopModel = this.laptopModelGLB.scene;
            this.tabletModel = this.tabletModelGLB.scene;
            this.tableModel = this.tableModelGLB.scene;
            this.flatTableModel = this.flatTableModelGLB.scene;
            this.notebookModel = this.notebookModelGLB.scene;

            this.audioQuizIntro = new Audio('./assets/audio/audioQuizIntro.mp3');
            this.audioCorrectAnswer = new Audio('./assets/audio/audioCorrectAnswer.mp3');
            this.audioWrongAnswer = new Audio('./assets/audio/audioWrongAnswer.mp3');
            
            console.log('✅ Scene 3 resources loaded');
            
        } catch (error) {
            console.warn('⚠️ Scene 3 loading failed:', error);
        }
    }

    async setupControls() {
        if (navigator.xr) {
            try {
                const isARSupported = await navigator.xr.isSessionSupported('immersive-ar');
                const isVRSupported = await navigator.xr.isSessionSupported('immersive-vr');
                
                if (isARSupported || isVRSupported) {
                    console.log(`Starting immersive ${isARSupported ? 'AR' : 'VR'} session`);
                    const sessionType = isARSupported ? 'immersive-ar' : 'immersive-vr';
                    
                    this.session = await navigator.xr.requestSession(sessionType, {
                        requiredFeatures: ['local'],
                        optionalFeatures: ['local-floor', 'bounded-floor', 'hand-tracking', 'hit-test']
                    });
                    
                    await this.renderer.xr.setSession(this.session);
                    this.isXRActive = true;
                    this.adjustCameraForVR();
                    
                    if (this.session) {
                        this.controller = this.renderer.xr.getController(0);
                        this.scene.add(this.controller);
                        
                        this.createRaycasterRay();
                        
                        this.controller.addEventListener('select', (event) => {
                            const tempMatrix = new THREE.Matrix4();
                            tempMatrix.identity().extractRotation(this.controller.matrixWorld);
                            
                            const controllerRaycaster = new THREE.Raycaster();
                            controllerRaycaster.ray.origin.setFromMatrixPosition(this.controller.matrixWorld);
                            controllerRaycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);
                            
                            this.checkInteractions(controllerRaycaster);
                        });
                    }
                } else {
                    console.log('XR not supported, using fallback 3D mode');
                    this.setupFallbackCameraControls();
                }
            } catch (error) {
                console.log('WebXR failed, using fallback:', error.message);
                this.setupFallbackCameraControls();
            }
        } else {
            console.log('WebXR not available, using fallback mode');
            this.setupFallbackCameraControls();
        }
        
        this.setupMouseTouchInteraction();
    }

    adjustCameraForVR() {
        if (this.isXRActive) {
            console.log('📐 Adjusting camera for VR headset');
            this.camera.position.y = 1.6;
            this.camera.position.x = 0;
            this.camera.position.z = 0;
            console.log(`🥽 VR camera positioned at height: ${this.camera.position.y}m`);
        } else {
            console.log('📱 Using mobile/desktop camera positioning');
            this.camera.position.set(0, 0.7, 0);
        }
    }

    setupMouseTouchInteraction() {
        if (!this.modelInteractionHandlerActive) {
            this.modelInteractionHandlerActive = true;
            
            this.interactionRaycaster = new THREE.Raycaster();
            this.interactionPointer = new THREE.Vector2();
            
            let pointerStartX = 0;
            let pointerStartY = 0;
            let isDragging = false;
            
            const handlePointerDown = (event) => {
                pointerStartX = event.clientX;
                pointerStartY = event.clientY;
                isDragging = false;
            };
            
            const handlePointerMove = (event) => {
                if (!isDragging) {
                    const deltaX = Math.abs(event.clientX - pointerStartX);
                    const deltaY = Math.abs(event.clientY - pointerStartY);
                    if (deltaX > 5 || deltaY > 5) {
                        isDragging = true;
                    }
                }
            };
            
            const handlePointerUp = (event) => {
                if (!isDragging) {
                    this.interactionPointer.x = (event.clientX / window.innerWidth) * 2 - 1;
                    this.interactionPointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
                    this.interactionRaycaster.setFromCamera(this.interactionPointer, this.camera);
                    this.checkInteractions(this.interactionRaycaster);
                }
            };
            
            document.addEventListener('pointerdown', handlePointerDown);
            document.addEventListener('pointermove', handlePointerMove);
            document.addEventListener('pointerup', handlePointerUp);
            
            this.interactionHandlers = {
                pointerDown: handlePointerDown,
                pointerMove: handlePointerMove,
                pointerUp: handlePointerUp
            };
        }
    }

    setupFallbackCameraControls() {
        console.log('Setting up camera controls for non-AR mode');
        this.camera.position.set(0, 0.7, 0);
        this.camera.rotation.set(0, 0, 0); 
        
        let isPointerDown = false;
        let pointerX = 0;
        let pointerY = 0;
        
        const onPointerMove = (event) => {
            if (!isPointerDown) return;
            
            const deltaX = event.clientX - pointerX;
            const deltaY = event.clientY - pointerY;
            
            this.camera.rotation.y -= deltaX * 0.005;
            this.camera.rotation.x -= deltaY * 0.005;
            this.camera.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, this.camera.rotation.x));
            
            pointerX = event.clientX;
            pointerY = event.clientY;
        };
        
        document.addEventListener('pointerdown', (event) => {
            isPointerDown = true;
            pointerX = event.clientX;
            pointerY = event.clientY;
        });
        
        document.addEventListener('pointermove', onPointerMove);
        document.addEventListener('pointerup', () => { isPointerDown = false; });
    } 

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    render(timestamp) {
        if (this.startButtonModel) {
            this.idleMove(this.startButtonModel, timestamp);
        }
        
        if (this.nextButtonModel) {
            this.idleMove(this.nextButtonModel, timestamp);
        }
        
        if (this.wendy && this.wendy.visible) {
            this.idleMove(this.wendy, timestamp, 0.03, 0.001);
        }
        
        if (this.mendy && this.mendy.visible) {
            this.idleMove(this.mendy, timestamp, 0.03, 0.0001);
        }

        if (this.isXRActive && this.raycasterLine) {
            this.updateRaycastRay();
        }

        const delta = this.clock ? this.clock.getDelta() : 0;
    
        if (this.mixers) {
            this.mixers.forEach(mixer => {
                if (mixer) mixer.update(delta);
            });
        }
        
        this.renderer.render(this.scene, this.camera);
    }
}