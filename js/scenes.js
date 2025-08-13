// scenes.js - Scene management and story flow (Refactored)

ARExperience.prototype.startExperience = function() {
    console.log('🎬 Starting AR Experience...');
    this.currentScene = 'scene1';
    this.scene1();
};

ARExperience.prototype.goToScene = function(sceneName) {
    console.log(`🔄 Transitioning to ${sceneName}`);
    this.clearScene();
    this.currentScene = sceneName;
    
    if (typeof this[sceneName] === 'function') {
        setTimeout(() => {
            this[sceneName]();
        }, 300);
    } else {
        console.error(`❌ Scene ${sceneName} not found`);
    }
};

ARExperience.prototype.positionRelativeToUser = function(model, config = {}) {
    if (!model || !this.camera) return;
    
    const {
        distance = 3,
        angle = 0,
        height = 0,
        faceUser = true
    } = config;
    
    const cameraPosition = this.camera.position.clone();
    const cameraDirection = new THREE.Vector3();
    this.camera.getWorldDirection(cameraDirection);
    
    const baseAngle = Math.atan2(cameraDirection.x, cameraDirection.z);
    const finalAngle = baseAngle + angle;
    
    const x = cameraPosition.x + Math.sin(finalAngle) * distance;
    const z = cameraPosition.z + Math.cos(finalAngle) * distance;
    const y = cameraPosition.y + height;
    
    model.position.set(x, y, z);
    
    if (faceUser) {
        model.lookAt(cameraPosition);
    }
    
    return model;
};

// Story positions for easy use
ARExperience.prototype.STORY_POSITIONS = {
    FRONT: 0,
    FRONT_RIGHT: Math.PI / 4,
    RIGHT: Math.PI / 2,
    BACK_RIGHT: (3 * Math.PI) / 4,
    BEHIND: Math.PI,
    BACK_LEFT: (-3 * Math.PI) / 4,
    LEFT: -Math.PI / 2,
    FRONT_LEFT: -Math.PI / 4
};

ARExperience.prototype.showNextButton = function(targetScene) {
    if (!this.nextButtonModel) {
        console.error("nextButtonModel not found. Please ensure it is loaded.");
        return;
    }

    this.positionRelativeToUser(this.nextButtonModel, {
        distance: 1.5,
        angle: this.STORY_POSITIONS.FRONT,
        height: -0.3,
        faceUser: true
    });
    
    this.nextButtonModel.rotation.set(0, 0, 0);
    this.nextButtonModel.scale.set(0.5, 0.5, 0.5);
    this.nextButtonModel.visible = true;
    this.nextButtonModel.updateMatrixWorld(true);
    
    this.scene.add(this.nextButtonModel);
    this.nextButtonModel.name = 'nextButtonModel';   
    
    this.makeModelClickable(this.nextButtonModel, () => {
        this.goToScene(targetScene);
    });
};

// ============== INDIVIDUAL SCENES ==============

ARExperience.prototype.scene1 = function() {    
    this.createTextPlate('Welcome - use START below to begin', {
        backgroundColor: 0x3366cc,
        width: 0.5,
        height: 0.2,
        yOffset: 0.29
    });    
    
    this.playAudio('audioIntroMsg');

    // Start Button
    if (this.startButtonModel) {
        this.positionRelativeToUser(this.startButtonModel, {
            distance: 1.5,
            angle: this.STORY_POSITIONS.FRONT,
            height: -0.5,
            faceUser: true
        });
        
        this.scaleModel(this.startButtonModel, 1);
        this.startButtonModel.visible = true;
        this.scene.add(this.startButtonModel);
        this.startButtonModel.name = "startButtonModel";
        console.log('✅ Start button added to scene');
    }
    
    // Wendy NT Model
    if (this.wendyNTModel) {
        this.positionRelativeToUser(this.wendyNTModel, {
            distance: 4,
            angle: this.STORY_POSITIONS.BEHIND,
            height: 0,
            faceUser: true
        });
        
        this.wendyNTModel.visible = true;
        this.scene.add(this.wendyNTModel);     
        this.wendyNTModel.name = "wendyNTModel";
        console.log('✅ Wendy NT added to scene');

        this.playModelAnimation('wendyNTModel', 'humping');
    }
        
    this.makeModelClickable(this.startButtonModel, () => {
        const cameraPos = this.camera.position;
        this.moveModel("wendyNTModel", 
            {x: cameraPos.x + 1, y: cameraPos.y + 10, z: cameraPos.z - 5.5},  
            7                   
        );  

        setTimeout(() => {
            if (this.wendyNTModel) this.wendyNTModel.visible = false;
            if (this.startButtonModel) this.startButtonModel.visible = false;
            this.goToScene('scene2');
        }, 2000);
    });         
};

ARExperience.prototype.scene2 = function() {     
    this.createTextPlate('Chapter 1: 3D Video', {
       backgroundColor: 0x3366cc,
        width: 0.5,
        height: 0.2,
        yOffset: 0.29
    });    

    // Position scene 2 models
    const scene2Models = [
        { name: 'cafeModelS3', distance: 4, angle: this.STORY_POSITIONS.FRONT, height: 0 },
        { name: 'doc1Model', distance: 2.5, angle: this.STORY_POSITIONS.FRONT_LEFT, height: 0.5 },
        { name: 'doc2Model', distance: 2.5, angle: this.STORY_POSITIONS.FRONT_RIGHT, height: 0.5 },
        { name: 'wendyModel', distance: 2, angle: this.STORY_POSITIONS.FRONT, height: 0 },
        { name: 'mendyModel', distance: 2.5, angle: this.STORY_POSITIONS.BEHIND, height: 0 },
        { name: 'word1Model', distance: 3.5, angle: this.STORY_POSITIONS.LEFT, height: 1 },
        { name: 'word2Model', distance: 3.5, angle: this.STORY_POSITIONS.FRONT, height: 1.5 },
        { name: 'word3Model', distance: 3.5, angle: this.STORY_POSITIONS.RIGHT, height: 1 },
        { name: 'sunglassesModel', distance: 1.8, angle: this.STORY_POSITIONS.FRONT_RIGHT, height: 0.3 },
        { name: 'wendyGlassesModelS3', distance: 3, angle: this.STORY_POSITIONS.RIGHT, height: 0 }
    ];

    let modelsAdded = 0;
    scene2Models.forEach(config => {
        const model = this[config.name];
        if (model) {
            this.positionRelativeToUser(model, {
                distance: config.distance,
                angle: config.angle,
                height: config.height,
                faceUser: true
            });
            model.visible = true;
            this.scene.add(model);
            model.name = config.name;
            modelsAdded++;
            console.log(`✅ Added ${config.name} to scene 2`);
        } else {
            console.warn(`❌ Model ${config.name} not found or not loaded yet`);
        }
    });
    
    console.log(`📊 Scene 2: Added ${modelsAdded}/${scene2Models.length} models`);
    
    // Play scene 2 animations and audio (defined in loadScene2Resources)
    if (this.scene2ModelAnimations && this.scene2AudioTracks) {
        this.playback3D(this.scene2ModelAnimations, this.scene2AudioTracks, 10);
    } else {
        console.warn('⚠️ Scene 2 animations or audio tracks not loaded yet');
    }
    
    setTimeout(() => {       
         this.showNextButton('scene3');        
    }, 35000); // 35 seconds
};

ARExperience.prototype.scene3 = function() {    
    this.createTextPlate('Welcome to the Quiz!', {
        backgroundColor: 0x3366cc,
        width: 0.5,
        height: 0.2,
        yOffset: 0.29
    }); 

    this.playAudio('audioQuizIntro');
    
    // Position quiz elements
    const quizModels = [
        { name: 'wendyNTModel', distance: 3, angle: this.STORY_POSITIONS.FRONT, height: 0, startHidden: false },
        { name: 'laptopModel', distance: 2.5, angle: this.STORY_POSITIONS.FRONT_RIGHT, height: 0.2 },
        { name: 'tabletModel', distance: 2.5, angle: this.STORY_POSITIONS.RIGHT, height: 0.2 },
        { name: 'tableModel', distance: 2.5, angle: this.STORY_POSITIONS.BACK_RIGHT, height: 0.2 },
        { name: 'flatTableModel', distance: 2.5, angle: this.STORY_POSITIONS.BACK_LEFT, height: 0.2 },
        { name: 'notebookModel', distance: 2.5, angle: this.STORY_POSITIONS.LEFT, height: 0.2 }
    ];

    let modelsAdded = 0;
    quizModels.forEach(config => {
        const model = this[config.name];
        if (model) {
            if (config.startHidden !== false) {
                // Start hidden, then animate into position
                const hiddenPos = this.camera.position.clone();
                hiddenPos.y += 10;
                model.position.copy(hiddenPos);
                model.visible = true;
                this.scene.add(model);
                model.name = config.name;
                modelsAdded++;
                
                setTimeout(() => {
                    this.positionRelativeToUser(model, {
                        distance: config.distance,
                        angle: config.angle,
                        height: config.height,
                        faceUser: true
                    });
                }, 1000);
            } else {
                this.positionRelativeToUser(model, {
                    distance: config.distance,
                    angle: config.angle,
                    height: config.height,
                    faceUser: true
                });
                model.visible = true;
                this.scene.add(model);
                model.name = config.name;
                modelsAdded++;
            }
            console.log(`✅ Added ${config.name} to scene 3`);
        } else {
            console.warn(`❌ Model ${config.name} not found or not loaded yet`);
        }
    });
    
    console.log(`📊 Scene 3: Added ${modelsAdded}/${quizModels.length} models`);
    
    // Quiz interactions
    if (this.laptopModel) {
        this.makeModelClickable(this.laptopModel, () => {
            console.log('💻 Laptop clicked!');
            this.playAudio('audioCorrectAnswer'); 
            this.playModelAnimation('wendyNTModel', 'humping');
            this.showNextButton('scene4');
        });
    }

    const wrongAnswerModels = ['notebookModel', 'tableModel', 'flatTableModel', 'tabletModel'];
    wrongAnswerModels.forEach(modelName => {
        const model = this[modelName];
        if (model) {
            this.makeModelClickable(model, () => {
                console.log(`❌ ${modelName} clicked! Wrong answer.`);
                this.playAudio('audioWrongAnswer');       
            });
        }
    });
};

ARExperience.prototype.scene4 = function() {
    this.createTextPlate('Thanks for looking around - use QUIT below to finish', {
        backgroundColor: 0x3366cc,
        width: 0.5,
        height: 0.2,
        yOffset: 0.29
    });   

    // Quit Button
    if (this.quitButtonModel) {
        this.positionRelativeToUser(this.quitButtonModel, {
            distance: 1.5,
            angle: this.STORY_POSITIONS.FRONT,
            height: -0.5,
            faceUser: true
        });
        
        this.scaleModel(this.quitButtonModel, 0.3);
        this.quitButtonModel.visible = true;
        this.scene.add(this.quitButtonModel);
        console.log('✅ Quit button added to scene');

        this.makeModelClickable(this.quitButtonModel, () => {
            this.finishAR();
        });
    }

    // Farewell Wendy
    if (this.wendyModel) {
        this.positionRelativeToUser(this.wendyModel, {
            distance: 3,
            angle: this.STORY_POSITIONS.LEFT,
            height: 0,
            faceUser: true
        });
        this.wendyModel.visible = true;
        this.scene.add(this.wendyModel);
        console.log('✅ Wendy farewell added to scene');
    }
};

ARExperience.prototype.clearScene = function() {
    console.log('🧹 Clearing scene - hiding all assets');

    if (this.scene) {
        [...this.scene.children].forEach(object => {                
            // Preserve essential XR and lighting components
            if (object.type.includes('Light') || 
                object.type === 'PerspectiveCamera' ||
                object === this.controller ||
                object === this.raycasterLine ||
                (this.uiGroup && object === this.uiGroup)) {
                return;
            }
            
            object.visible = false;
            if (object.parent) { 
                object.parent.remove(object); 
            }
        });
    }

    // Clean up stale interactions
    if (this.modelInteractions) {
        const modelsToRemove = [];
        this.modelInteractions.forEach((data, model) => {
            if (!model.parent || !model.visible) {
                modelsToRemove.push(model);
            }
        });
        modelsToRemove.forEach(model => {
            this.modelInteractions.delete(model);
        });
    }

    // Clean up animation mixers
    if (this.mixers) {
        this.mixers.forEach(mixer => {
            try { 
                mixer.stopAllAction(); 
                if (mixer.uncacheRoot) {
                    mixer.uncacheRoot(mixer.getRoot());
                }
            } catch(e) {
                console.warn('Error cleaning up mixer:', e);
            }
        });
        this.mixers = [];
    }
    
    console.log('✅ Scene cleared');
};