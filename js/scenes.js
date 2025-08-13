// scenes.js - Scene management and story flow

// ============== NEW SCENE MANAGEMENT SYSTEM ==============

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

// ⭐ NEW: Updated for user-relative positioning
ARExperience.prototype.addModelsToScene = function(modelConfigs, useUserPosition = true) {
    modelConfigs.forEach(config => {
        const model = this[config.name];
        if (model) {
            if (useUserPosition && config.distance) {
                // Use new relative positioning system
                this.positionRelativeToUser(model, {
                    distance: config.distance || 3,
                    angle: config.angle || 0,
                    height: config.height || 0,
                    faceUser: config.faceUser !== false
                });
            } else {
                // Fallback to absolute positioning
                model.position.set(config.x || 0, config.y || 0, config.z || -7);
            }
            
            if (config.rotation) model.rotation.y = config.rotation;
            this.scene.add(model);
            model.name = config.name;
        } else {
            console.warn(`⚠️ Model ${config.name} not found`);
        }
    });
};

ARExperience.prototype.showNextButton = function(targetScene) {
    if (!this.nextButtonModel) {
        console.error("nextButtonModel not found. Please ensure it is loaded.");
        return;
    }

    // ⭐ CHANGED: Position button relative to user instead of fixed position
    this.positionRelativeToUser(this.nextButtonModel, {
        distance: 1.5,
        angle: this.STORY_POSITIONS.FRONT,
        height: -0.3, // Slightly below eye level
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
        
    // Initial text plate creation
    this.createTextPlate('Welcome - use START below to begin', {
        backgroundColor: 0x3366cc,
        width: 0.5,
        height: 0.2,
        yOffset: 0.29  // Slightly below center
    });    
    
    this.playAudio('audioIntroMsg');

    // ⭐ CHANGED: Position start button relative to user
    this.positionRelativeToUser(this.startButtonModel, {
        distance: 1.5,
        angle: this.STORY_POSITIONS.FRONT,
        height: -0.5, // Below eye level for easy clicking
        faceUser: true
    });
    
    this.scaleModel(this.startButtonModel, 1);
    this.scene.add(this.startButtonModel);  
    
    // ⭐ CHANGED: Position Wendy NT relative to user (behind for surprise)
    this.positionRelativeToUser(this.wendyNTModel, {
        distance: 4,
        angle: this.STORY_POSITIONS.BEHIND,
        height: 0,
        faceUser: true
    });
    
    this.scene.add(this.wendyNTModel);     
    this.wendyNTModel.name = "wendyNTModel";

    this.playModelAnimation('wendyNTModel', 'humping');
        
    this.makeModelClickable(this.startButtonModel, () => {
        // Move Wendy up and away
        const cameraPos = this.camera.position;
        this.moveModel("wendyNTModel", 
            {x: cameraPos.x + 1, y: cameraPos.y + 10, z: cameraPos.z - 5.5},  
            7                   
        );  

        setTimeout(() => {
            this.wendyNTModel.visible = false;
            this.startButtonModel.visible = false;
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

    // ⭐ CHANGED: Use storytelling-based positioning for immersive experience
    const scene2Models = [
        // Main cafe scene front and center
        { 
            name: 'cafeModelS3', 
            distance: 4,
            angle: this.STORY_POSITIONS.FRONT,
            height: 0
        },
        // Documents positioned for easy viewing
        { 
            name: 'doc1Model', 
            distance: 2.5,
            angle: this.STORY_POSITIONS.FRONT_LEFT,
            height: 0.5
        },
        { 
            name: 'doc2Model', 
            distance: 2.5,
            angle: this.STORY_POSITIONS.FRONT_RIGHT,
            height: 0.5
        },
        // Wendy as main character, close and personal
        { 
            name: 'wendyModel', 
            distance: 2,
            angle: this.STORY_POSITIONS.FRONT,
            height: 0
        },
        // Mendy behind user for surprise effect
        { 
            name: 'mendyModel', 
            distance: 2.5,
            angle: this.STORY_POSITIONS.BEHIND,
            height: 0
        },
        // Words floating around user in a circle
        { 
            name: 'word1Model', 
            distance: 3.5,
            angle: this.STORY_POSITIONS.LEFT,
            height: 1
        },
        { 
            name: 'word2Model', 
            distance: 3.5,
            angle: this.STORY_POSITIONS.FRONT,
            height: 1.5
        },
        { 
            name: 'word3Model', 
            distance: 3.5,
            angle: this.STORY_POSITIONS.RIGHT,
            height: 1
        },
        // Sunglasses close for interaction
        { 
            name: 'sunglassesModel', 
            distance: 1.8,
            angle: this.STORY_POSITIONS.FRONT_RIGHT,
            height: 0.3
        },
        // Wendy with glasses to the side
        { 
            name: 'wendyGlassesModelS3', 
            distance: 3,
            angle: this.STORY_POSITIONS.RIGHT,
            height: 0
        }
    ];

    // Position all models using new system
    scene2Models.forEach(config => {
        const model = this[config.name];
        if (model) {
            this.positionRelativeToUser(model, {
                distance: config.distance,
                angle: config.angle,
                height: config.height,
                faceUser: true
            });
            this.scene.add(model);
            model.name = config.name;
        }
    });
    
    this.playback3D(this.scene2ModelAnimations, this.scene2AudioTracks, 10);
    
    const estimatedDuration = 35000; // 35 seconds
    setTimeout(() => {       
         this.showNextButton('scene3');        
    }, estimatedDuration);
};

ARExperience.prototype.scene3 = function() {    
      
    this.createTextPlate('Welcome to the Quiz!', {
        backgroundColor: 0x3366cc,
        width: 0.5,
        height: 0.2,
        yOffset: 0.29
    }); 

    this.playAudio('audioQuizIntro');
    
    // ⭐ CHANGED: Position quiz elements in a circle around user for VR comfort
    const quizModels = [
        // Wendy as quiz host in front
        { 
            name: 'wendyNTModel', 
            distance: 3,
            angle: this.STORY_POSITIONS.FRONT,
            height: 0,
            startHidden: false
        },
        // Quiz options positioned around user in hexagon pattern
        { 
            name: 'laptopModel', 
            distance: 2.5,
            angle: this.STORY_POSITIONS.FRONT_RIGHT,
            height: 0.2
        },
        { 
            name: 'tabletModel', 
            distance: 2.5,
            angle: this.STORY_POSITIONS.RIGHT,
            height: 0.2
        },
        { 
            name: 'tableModel', 
            distance: 2.5,
            angle: this.STORY_POSITIONS.BACK_RIGHT,
            height: 0.2
        },
        { 
            name: 'flatTableModel', 
            distance: 2.5,
            angle: this.STORY_POSITIONS.BACK_LEFT,
            height: 0.2
        },
        { 
            name: 'notebookModel', 
            distance: 2.5,
            angle: this.STORY_POSITIONS.LEFT,
            height: 0.2
        }
    ];

    // Position and animate quiz models
    quizModels.forEach(config => {
        const model = this[config.name];
        if (model) {
            if (config.startHidden !== false) {
                // Start hidden, then animate into position
                const hiddenPos = this.camera.position.clone();
                hiddenPos.y += 10; // High above user
                model.position.copy(hiddenPos);
                model.visible = true;
                this.scene.add(model);
                model.name = config.name;
                
                // Animate to final position
                setTimeout(() => {
                    this.positionRelativeToUser(model, {
                        distance: config.distance,
                        angle: config.angle,
                        height: config.height,
                        faceUser: true
                    });
                }, 1000);
            } else {
                // Position immediately
                this.positionRelativeToUser(model, {
                    distance: config.distance,
                    angle: config.angle,
                    height: config.height,
                    faceUser: true
                });
                this.scene.add(model);
                model.name = config.name;
            }
        }
    });
    
    // Quiz interactions
    this.makeModelClickable(this.laptopModel, () => {
        console.log('💻 Laptop clicked!');
        this.playAudio('audioCorrectAnswer'); 
        this.playModelAnimation('wendyNTModel', 'humping');
        this.showNextButton('scene4');
    });   

    this.makeModelClickable(this.notebookModel, () => {
        console.log('📓 Notebook clicked!');
        this.playAudio('audioWrongAnswer');       
    });  

    this.makeModelClickable(this.tableModel, () => {
        console.log('🪑 Table clicked!');
        this.playAudio('audioWrongAnswer');       
    });  

    this.makeModelClickable(this.flatTableModel, () => {
        console.log('📋 Flat Table clicked!');
        this.playAudio('audioWrongAnswer');       
    }); 
    
    this.makeModelClickable(this.tabletModel, () => {
        console.log('📱 Tablet clicked!');
        this.playAudio('audioWrongAnswer');       
    });    
};

ARExperience.prototype.scene4 = function() {
   
    this.createTextPlate('Thanks for looking around - use QUIT below to finish', {
        backgroundColor: 0x3366cc,
        width: 0.5,
        height: 0.2,
        yOffset: 0.29
    });   

    // ⭐ CHANGED: Position quit button relative to user
    this.positionRelativeToUser(this.quitButtonModel, {
        distance: 1.5,
        angle: this.STORY_POSITIONS.FRONT,
        height: -0.5, // Below eye level
        faceUser: true
    });
    
    this.scaleModel(this.quitButtonModel, 0.3);      
    this.scene.add(this.quitButtonModel);  

    this.makeModelClickable(this.quitButtonModel, () => {
        this.finishAR();
    });

    // ⭐ CHANGED: Position farewell Wendy to the side
    if (this.wendyModel) {
        this.positionRelativeToUser(this.wendyModel, {
            distance: 3,
            angle: this.STORY_POSITIONS.LEFT,
            height: 0,
            faceUser: true
        });
        this.scene.add(this.wendyModel);
    }
};

// ============== LEGACY METHODS (IMPROVED) ==============

ARExperience.prototype.clearScene = function() {
    console.log('🧹 Clearing scene - hiding all assets');

    const hideSafely = (obj) => {
        if (!obj) return;
        
        obj.visible = false;
        if (obj.parent) { 
            obj.parent.remove(obj); 
        }
        console.log(`Hidden: ${obj.name || obj.type}`);
    };

    if (this.scene) {
        [...this.scene.children].forEach(object => {                
            // PRESERVE XR COMPONENTS DURING SCENE TRANSITIONS
            if (object.type.includes('Light') || 
                object.type === 'PerspectiveCamera' ||
                object === this.controller ||           // Don't remove XR controller!
                object === this.raycasterLine ||        // Don't remove ray!
                (this.uiGroup && object === this.uiGroup)) {  // Don't remove UI
                return;
            }
            
            hideSafely(object);
        });
    }

    // Don't clear interaction map completely - preserve XR controller interactions
    if (this.modelInteractions) {
        const modelsToRemove = [];
        this.modelInteractions.forEach((data, model) => {
            // Only remove interactions for models that are actually being cleaned up
            if (!model.parent || (!model.visible && 
                model.name !== 'nextButtonModel' && 
                model.name !== 'startButtonModel')) {
                modelsToRemove.push(model);
            }
        });
        modelsToRemove.forEach(model => {
            this.modelInteractions.delete(model);
        });
        console.log(`🧹 Cleaned up ${modelsToRemove.length} stale interactions, ${this.modelInteractions.size} remaining`);
    }

    // Don't reset animation callbacks in XR mode (they might be needed for controller updates)
    if (!this.isXRActive && this._animationCallbacks) {
        this._animationCallbacks = [];        
    }
   
    this.mixers?.forEach(mixer => {
        try { mixer.stopAllAction(); mixer.uncacheRoot?.(mixer.getRoot()); } 
        catch(e) {}
    });
    this.mixers = [];
    
    console.log('✅ Scene cleared (XR components preserved)');
};