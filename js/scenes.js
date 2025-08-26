// scenes.js - Scene management and story flow (Conservative cleanup)

// ============== SCENE MANAGEMENT SYSTEM ==============

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

ARExperience.prototype.addModelsToScene = function(modelConfigs) {
    modelConfigs.forEach(config => {
        const model = this[config.name];
        if (model) {
            model.position.set(config.x || 0, config.y || 0, config.z || -7);
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

    // Reset and position next button
    this.nextButtonModel.position.set(0, 1.7, -2.5);
    this.nextButtonModel.rotation.set(0, 0, 0);
    this.nextButtonModel.scale.set(0.5, 0.5, 0.5); // Scale to 0.5m 
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
    this.createTextPlate('Welcome!', {
        backgroundColor: 0x3366cc,
        width: 0.5,
        height: 0.2,
        yOffset: 0.29  // Slightly below center
    });    
    
    this.playAudio('audioIntroMsg');
<<<<<<< HEAD
    
    // IMPORTANT: Reset button parent and ensure it's in world space
    if (this.startButtonModel.parent) {
        this.startButtonModel.parent.remove(this.startButtonModel);
    }
    
    this.startButtonModel.scale.set(1, 1, 1);
    this.startButtonModel.position.set(0, 0, -2.5);  // Position in front
    this.startButtonModel.rotation.set(0, 0, 0); // Reset rotation
    this.startButtonModel.updateMatrixWorld(true); // Force update
=======
  
    // this.startButtonModel.position.set(0, 0, 0);  // Reset first
    this.startButtonModel.scale.set(1, 1, 1);
    this.startButtonModel.position.set(0, 0, -1.5);  // Raised from 0 to 1.2
>>>>>>> d980ffd4886ac98500f528225f37b7b5caebefd4

    this.scaleModel(this.startButtonModel, 1);
    this.scene.add(this.startButtonModel);  
    this.startButtonModel.name = "startButtonModel"; // Ensure name is set
    
    // Wendy Jump model creation and placement
    this.wendyJump.position.set(0, 0.7, -7); 
    this.wendyJump.rotation.y = 0;
    this.scene.add(this.wendyJump);     
    this.wendyJump.name = "wendyJump"; 

    // Play both animations on wendyJump
    this.playModelAnimation('wendyJump', 'right_eye.002');
    setTimeout(() => {
        this.playModelAnimation('wendyJump', 'Romy-WendyAction');
    }, 2000); // 2s delay just about for the jump

<<<<<<< HEAD
=======
    this.playModelAnimation('wendyNTModel', 'Jumping', 'SMILE', 'talking');


        
>>>>>>> d980ffd4886ac98500f528225f37b7b5caebefd4
    this.makeModelClickable(this.startButtonModel, () => {
        this.moveModel("wendyJump", 
            {x: 1, y: 10, z: -6.5},  
            7                   
        );  

        setTimeout(() => {
            this.wendyJump.visible = false;
            this.startButtonModel.visible = false;
            this.goToScene('scene2');
        }, 2000);
    });         
};

ARExperience.prototype.scene2 = function() {     

    this.createTextPlate('3D Video', {
       backgroundColor: 0x3366cc,
        width: 0.5,
        height: 0.2,
        yOffset: 0.29  // Slightly below center
    });    

    // ✅ KEPT YOUR EXACT POSITIONING - models in front, mendy behind
    this.addModelsToScene([
        { name: 'cafeModelS3', y:1, z: -7 },        // IN FRONT
        { name: 'doc1Model', y:1, z: -7 },          // IN FRONT
        { name: 'wendyModel', y:1, z: -7 },         // IN FRONT
        { name: 'mendyModel', y:1, z: 3 },          // BEHIND (positive Z)
        { name: 'word1Model', y:1, z: -7 },         // IN FRONT
        { name: 'word2Model', y:1, z: -7 },         // IN FRONT
        { name: 'word3Model', y:1, z: -7 },         // IN FRONT
        { name: 'sunglassesModel', y:1, z: -7 },    // IN FRONT
        { name: 'wendyGlassesModelS3', y:1, z: -7}, // IN FRONT
    ]);       
    
    this.playback3D(this.scene2ModelAnimations, this.scene2AudioTracks, 0);

    // // ✅ MINIMAL ADDITION: Manual Mendy animation trigger (since he's behind)
    // setTimeout(() => {
    //     console.log('🎭 Manually starting Mendy animation (behind user)...');
    //     this.playModelAnimation('mendyModel', 'MendyAction');
    // }, 30000); // 30 seconds - slightly before next button appears

    const estimatedDuration = 35000; // 35 seconds
    setTimeout(() => {       
        this.showNextButton('scene3');        
    }, estimatedDuration);
};

ARExperience.prototype.scene3 = function() {    
      
    this.createTextPlate('Quiz', {
        backgroundColor: 0x3366cc,
        width: 0.5,
        height: 0.2,
        yOffset: 0.29  
    }); 

    this.playAudio('audioQuizIntro');
    
    // ✅ KEPT YOUR EXACT POSITIONING - quiz models around user
    this.addModelsToScene([
        { name: 'wendyNoMove', x: -10, y: -10, z: -5, rotation: 0}, 
        { name: 'A_bird', x: 10, y: 10, z: -5, rotation: -Math.PI / 2 + Math.PI / 9 - Math.PI / 18 - Math.PI / 18 + Math.PI / 4 },
        { name: 'C_sofa', x: 10, y: 10, z: 5, rotation: -3 * Math.PI / 4 - (140 * Math.PI / 180) - (10 * Math.PI / 180) + Math.PI / 4 },
        { name: 'D_park', x: 10, y: 10, z: -5, rotation: -Math.PI + (35 * Math.PI / 180) - (45 * Math.PI / 180) - (30 * Math.PI / 180) - (20 * Math.PI / 180) - (10 * Math.PI / 180) - Math.PI / 4 },
        { name: 'B_laptop', x: 10, y: 10, z: -5, rotation: Math.PI / 2 + (135 * Math.PI / 180)},
        { name: 'Quiz_text1', x: 10, y: 10, z: -5}   
    ]);    
    
    // ✅ KEPT YOUR EXACT MOVEMENT ANIMATIONS
    this.wendyNoMove.visible = true; 
    this.moveModel("wendyNoMove", 
        {x: 0, y: 0.7, z: -5},  // In front
        8                   
    );

    this.A_bird.visible = true; 
    this.moveModel("A_bird", 
        {x: 3.3, y: 0.7, z: -1},  // Right-front
        5                   
    );

    this.C_sofa.visible = true; 
    this.moveModel("C_sofa",       
        {x: -2, y: 0.7, z: 2.8},  // Left-back
        5       
    );

    this.D_park.visible = true; 
    this.moveModel("D_park",        
        {x: -3.3, y: 0.7, z: -1}, // Left-front
        5                   
    );  

    this.B_laptop.visible = true; 
    this.moveModel("B_laptop", 
        {x: 2, y: 0.7, z: 2.8},  // Right-back
        5                    
    );
    
    this.Quiz_text1.visible = true;
    this.moveModel("Quiz_text1", 
        {x: 0, y: 1.5, z: -5},  // Above Wendy
        5  
    );
    this.Quiz_text1.scale.set(1.2, 1.2, 1.2);    

    // ✅ KEPT YOUR EXACT QUIZ INTERACTIONS
    this.makeModelClickable(this.B_laptop, () => {       
        this.playAudio('audioCorrectAnswer'); 
        this.playModelAnimation('B_laptop' , 'sb_check_b_Action');
        this.playModelAnimation('wendyNoMove', 'Jumping'); // Changed from wendyNTModel
        this.showNextButton('scene4');
    });   

    this.makeModelClickable(this.A_bird, () => {       
        this.playAudio('audioWrongAnswer'); 
        this.playModelAnimation('A_bird' , 'sb_xAction');
    });  

    this.makeModelClickable(this.C_sofa, () => {       
        this.playAudio('audioWrongAnswer');  
        this.playModelAnimation('C_sofa' , 'sb_sofa_xAction');
    });  

    this.makeModelClickable(this.D_park, () => {       
        this.playAudio('audioWrongAnswer');    
        this.playModelAnimation('D_park' , 'sb_slide_xAction');
    });  
};

ARExperience.prototype.scene4 = function() {
   
    this.createTextPlate('Goodbye!', {
        backgroundColor: 0x3366cc,
        width: 0.5,
        height: 0.2,
        yOffset: 0.29  // Slightly below center
    });   
    
    this.scene.add(this.wendyJump);  // Changed from wendyNTModel to wendyJump
    
    this.wendyJump.visible = true;   // Changed from wendyNTModel to wendyJump

    this.wendyJump.position.set(0, 0.7, -7);  // IN FRONT for farewell

    // Play farewell animation
    this.playModelAnimation('wendyJump', 'right_eye.002');  // Changed model and animation
    this.playAudio('audioFarewell');   
    setTimeout(() => {
        this.playModelAnimation('wendyJump', 'Romy-WendyAction');
    }, 2000); // 2s delay just about for the jump

    // Fix quit button setup to match working buttons
    this.quitButtonModel.position.set(0, 0, -4);  // IN FRONT, closer than Wendy
    this.quitButtonModel.scale.set(1, 1, 1); // Same scale as start button
    this.quitButtonModel.visible = true; // Ensure it's visible   
    this.scene.add(this.quitButtonModel);    

    // Make sure it's clickable
    this.makeModelClickable(this.quitButtonModel, () => {
        console.log('👋 Quit button clicked!');        
        this.finishAR();
    });   
};

// ============== SCENE CLEANUP ==============

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
<<<<<<< HEAD
};
=======
};
>>>>>>> d980ffd4886ac98500f528225f37b7b5caebefd4
