class Game {
  constructor(state) {
    this.state = state;
    this.spawnedObjects = [];
    this.collidableObjects = [];
  }

  // example - we can add our own custom method to our game and call it using 'this.customMethod()'
  customMethod() {
    console.log("Custom method!");
  }

  // example - create a collider on our object with various fields we might need (you will likely need to add/remove/edit how this works)
  createSphereCollider(object, radius, onCollide = null) {
    object.collider = {
      type: "SPHERE",
      radius: radius,
      onCollide: onCollide ? onCollide : (otherObject) => {
        console.log(`Collided with ${otherObject.name}`);
      }
    };
    this.collidableObjects.push(object);
  }

  // example - function to check if an object is colliding with collidable objects
  checkCollision(object) {
    let collided = false;
    // loop over all the other collidable objects 
    this.collidableObjects.forEach(otherObject => {
      // probably don't need to collide with ourselves
      if (object.name === otherObject.name) {
        return;
      }
      // Getting all the information together regarding the collision points
      let xDistance = otherObject.model.position[0] - object.model.position[0];
      let yDistance = otherObject.model.position[1] - object.model.position[1];
      let zDistance = otherObject.model.position[2] - object.model.position[2];
      let totalDistance = (xDistance * xDistance) + (yDistance * yDistance) + (zDistance * zDistance);
      let obj1Radii = object.collider.radius * object.collider.radius;
      let obj2Radii = otherObject.collider.radius * otherObject.collider.radius;

      // If they collide (ie. closer than the radii combined) then run the onCollide commands.
      if (totalDistance < (obj1Radii + obj2Radii)) {
        collided = true;
        object.collider.onCollide(otherObject);
        
      }
      // do a check to see if we have collided, if we have we can call object.onCollide(otherObject) which will
      // call the onCollide we define for that specific object. This way we can handle collisions identically for all
      // objects that can collide but they can do different things (ie. player colliding vs projectile colliding)
      // use the modeling transformation for object and otherObject to transform position into current location
      // ie: 
      // if (collide){ object.collider.onCollide(otherObject) } // fires what we defined our object should do when it collides
      
    });

    return collided;

    
  }

  // runs once on startup after the scene loads the objects
  async onStart() {
    console.log("On start");

    // this just prevents the context menu from popping up when you right click
    document.addEventListener("contextmenu", (e) => {
      e.preventDefault();
    }, false);

    // example - set an object in onStart before starting our render loop!
    this.cube = getObject(this.state, "Cube1");
    this.cube1 = getObject(this.state, "Cube2");
    this.cube2 = getObject(this.state, "Cube3");
    const otherCube = getObject(this.state, "cube2"); // we wont save this as instance var since we dont plan on using it in update

    // example - create sphere colliders on our two objects as an example, we give 2 objects colliders otherwise
    // no collision can happen
    // this.createSphereCollider(this.cube, 0.5, (otherObject) => {
    //   console.log(`This is a custom collision of ${otherObject.name}`)
    // });
    // this.createSphereCollider(this.cube1, 0.5);
    // this.createSphereCollider(this.cube2, 0.5); //Testing multiple collisions
    // example - setting up a key press event to move an object in the scene

    // Listen for key presses and add them to a list to keep track of for another function below
    document.addEventListener("keydown", (e) => {
      this.cube.pressedKeys[e.key] = true;
      
    });

    // Once user lets go of those keys remove them from the list to stop using them
    document.addEventListener("keyup", (e) =>{
      delete this.cube.pressedKeys[e.key];
      
    });

    // These are outdated Comments
    // *let firstPersonToggle = false;
    // let originalPos = vec3.create();
    // let worldMove = vec3.create();
    // let localMove = vec3.create();
    // let rotationMat3 = mat3.create();
    // let collision = false;
    // let isJumping = false;*
    document.addEventListener("keypress", (e) => {
      e.preventDefault();

      switch (e.key) {
        // These movements are outdated, see below for smoother option
        // ************************************************************************************************
        // case "w":
        //   originalPos = vec3.clone(this.cube.model.position); //Keep original value in case of collision
        //   localMove = vec3.fromValues(0.5, 0.0, 0.0);
      
        //   mat3.fromMat4(rotationMat3, this.cube.model.rotation);
        //   vec3.transformMat3(worldMove, localMove, rotationMat3);
        //   vec3.add(this.cube.model.position, this.cube.model.position, worldMove);

        //   collision = this.checkCollision(this.cube);

        //   if (collision){
        //     this.cube.model.position = originalPos;
        //     console.log("Collided")
        //   } 
          
        //   break;
        
        // case "s":
        //   originalPos = vec3.clone(this.cube.model.position); //Keep original value in case of collision
        //   localMove = vec3.fromValues(-0.5, 0.0, 0.0);

        //   mat3.fromMat4(rotationMat3, this.cube.model.rotation);
        //   vec3.transformMat3(worldMove, localMove, rotationMat3);
        //   vec3.add(this.cube.model.position, this.cube.model.position, worldMove);

        //   collision = this.checkCollision(this.cube);

        //   if (collision){
        //     this.cube.model.position = originalPos;
        //     console.log("Collided")
        //   } 
          
        //   break;
        
        // case "a":
        //   originalPos = vec3.clone(this.cube.model.position); //Keep original value in case of collision
        //   localMove = vec3.fromValues(0.0, 0.0, -0.5);

        //   mat3.fromMat4(rotationMat3, this.cube.model.rotation);
        //   vec3.transformMat3(worldMove, localMove, rotationMat3);
        //   vec3.add(this.cube.model.position, this.cube.model.position, worldMove);

        //   collision = this.checkCollision(this.cube);

        //   if (collision){
        //     this.cube.model.position = originalPos;
        //     console.log("Collided")
        //   } 
          
        //   break;

        // case "d":
        //   originalPos = vec3.clone(this.cube.model.position); //Keep original value in case of collision
        //   localMove = vec3.fromValues(0.0, 0.0, 0.5);

        //   mat3.fromMat4(rotationMat3, this.cube.model.rotation);
        //   vec3.transformMat3(worldMove, localMove, rotationMat3);
        //   vec3.add(this.cube.model.position, this.cube.model.position, worldMove);

        //   collision = this.checkCollision(this.cube);

        //   if (collision){
        //     this.cube.model.position = originalPos;
        //     console.log("Collided")
        //   } 
          
        //   break;
        // ************************************************************************************************

        case " ":
          if (!this.cube.isJumping){
            this.cube.velocity[1] = this.cube.jumpSpeed;
            this.cube.isJumping = true;
          }
          break;
        
          // case " ": //Testing other key presses
          // this.cube.translate(vec3.fromValues(0, 0.5, 0));
          // break;

        case "m": // This sets a toggle for the first person camera angle, it also locks and hides the cursor while active to allow for smooth movement
          if (this.cube.firstPersonToggle == false){
            this.cube.firstPersonToggle = true;
            document.body.requestPointerLock();
            this.cube.material.alpha = 0.0;
          } else {
            this.cube.firstPersonToggle = false;
            document.exitPointerLock();
            this.cube.material.alpha = 1.0;
          }

        default:
          break;
      }
    });

    document.addEventListener("click", () => {
      startMusic();
    }, {once: true});

    const bgMusic = document.getElementById("bgMusic");
    function startMusic() {
      bgMusic.volume = 0.01;
      bgMusic.play();
    }
    let threshold = 1; // Minimum pixels that the mouse has to move to rotate

    // Allows for cube to rotate around in the direction of the mouse (only around y for now, x and z are a pain and might be too complicated for the remainin scope)
    document.addEventListener("mousemove", (e) => {
      e.preventDefault();
      if (this.cube.firstPersonToggle){
        if (Math.abs(e.movementX) < threshold && Math.abs(e.movementY) < threshold) return;
        
        this.cube.accumulatedX += e.movementX;
        this.cube.accumulatedY += e.movementY;
      }
    });

    this.customMethod(); // calling our custom method! (we could put spawning logic, collision logic etc in there ;) )

    // example: spawn some stuff before the scene starts
    // for (let i = 0; i < 10; i++) {
    //     for (let j = 0; j < 10; j++) {
    //         for (let k = 0; k < 10; k++) {
    //             spawnObject({
    //                 name: `new-Object${i}${j}${k}`,
    //                 type: "cube",
    //                 material: {
    //                     diffuse: randomVec3(0, 1)
    //                 },
    //                 position: vec3.fromValues(4 - i, 5 - j, 10 - k),
    //                 scale: vec3.fromValues(0.5, 0.5, 0.5)
    //             }, this.state);
    //         }
    //     }
    // }

    // example: spawn in objects, set constantRotate to true for them (used below) and give them a collider
      // for (let i = 0; i < 2; i++) {
      //   let tempObject = await spawnObject({
      //     name: `new-Object${i}`,
      //     type: "cube",
      //     material: {
      //       diffuse: randomVec3(0, 1)
      //     },
      //     position: vec3.fromValues(4 - i, 0, 0),
      //     scale: vec3.fromValues(0.5, 0.5, 0.5)
      //   }, this.state);


      //   tempObject.constantRotate = true;         // lets add a flag so we can access it later
      //   this.spawnedObjects.push(tempObject);     // add these to a spawned objects list
      //   this.collidableObjects.push(tempObject);  // say these can be collided into
      // }

    // this.collidableObjects.push(this.cube);
    // this.collidableObjects.push(this.cube1);
  }

  // New Movement Option
  updateMovement(keys) {
      let moveX = 0; // Set temp value for movement
      let moveZ = 0; // Set temp value for movement

      // Determine what key was pressed and what values to set
      if (keys['w']) moveX += 1;
      if (keys['s']) moveX -= 1;
      if (keys['a']) moveZ -= 1;
      if (keys['d']) moveZ += 1;

      // No movement detected, return out of the function because we don't need to modify the values
      if (moveX === 0 && moveZ === 0) return;

      const originalPos = vec3.clone(this.cube.model.position); // Save original position in case we collide with something
      const localMove = vec3.fromValues(moveX, 0, moveZ); // This is our temporary movement value, this will be used later
      vec3.normalize(localMove, localMove); // Normalize the direction values

      const speed = 0.5; // Set a scaleable speed value to set movement to be the same speed
      vec3.scale(localMove, localMove, speed); // Scale the movement vector by the speed
      const rotationMat3 = mat3.create();
      const worldMove = vec3.create();

      mat3.fromMat4(rotationMat3, this.cube.model.rotation); // Get the cube's rotation matrix, but only the rotations (we dont need the translations / scale)
      vec3.transformMat3(worldMove, localMove, rotationMat3); // Set the worldMove value based on the localMove and the rotation matrix

      vec3.add(this.cube.model.position, this.cube.model.position, worldMove); // Attempt to move to the new location
      
      // Check if it collides with anything
      if (this.checkCollision(this.cube)){
        vec3.copy(this.cube.model.position, originalPos); // If it does reset position back to normal
      };


    }

    updateFirstPerson() {
      if (this.cube.firstPersonToggle) {
        let rotationY = this.cube.accumulatedX * this.cube.mouseSpeedY * this.cube.smoothing;

        this.cube.rotate('y', rotationY);

        this.cube.accumulatedX *= (1 - this.cube.smoothing);
        this.cube.accumulatedY *= (1 - this.cube.smoothing);
      }
    }

  // Runs once every frame non stop after the scene loads
  onUpdate(deltaTime) {
    // TODO - Here we can add game logic, like moving game objects, detecting collisions, you name it. Examples of functions can be found in sceneFunctions
    if (this.cube.firstPersonToggle){
      let localOffset = vec3.fromValues(0, 0.5, 0); // Set an offset to position the POV inside the cube
      let worldOffset = vec3.create(); // Initialize a value
      vec3.transformMat4(worldOffset, localOffset, this.cube.modelMatrix); // Add to the above value the transformation of local offset and the cube's modelMatrix
      // Set new camera position based on the above values
      state.camera.position = vec3.fromValues(this.cube.model.position[0] + worldOffset[0], this.cube.model.position[1] + worldOffset[1], this.cube.model.position[2] + worldOffset[2]);
      let rot = this.cube.model.rotation; // Get the rotation matrix from the cube
      let forward = vec3.fromValues(rot[0], rot[1], rot[2]); // Create a forwards vector to determine which way the cube is facing
      vec3.normalize(forward, forward); // Normalize that value
      state.camera.front = forward // Set that value to direct the camera's front in the same direction
    };

    // Velocity, gravity and Jumpspeed are set in the RenderObject.js file, these can be modified to change around some values.
    if (this.cube.isJumping) {
      this.cube.velocity[1] += this.cube.gravity * deltaTime; // Slow / speed up downwards velocity using gravity over time
      this.cube.model.position[1] += this.cube.velocity[1] * deltaTime; // Adjust the cube's position based on the gravity

      // This is a temp way of checking if the object is colliding with the floor (before we get collisions running)
      if (this.cube.model.position[1] <= 1) {
        this.cube.model.position[1] = 1;
        this.cube.velocity[1] = 0;
        this.cube.isJumping = false;
      }
    };

    // example: Rotate a single object we defined in our start method
    // this.cube1.rotate('x', deltaTime * 0.5);
    // this.cube2.rotate('y', deltaTime * 0.5);
    // this.cube.rotate('y', deltaTime * 0.5);

    // example: Rotate all objects in the scene marked with a flag
    // this.state.objects.forEach((object) => {
    //   if (object.constantRotate) {
    //     object.rotate('y', deltaTime * 0.5);
    //   }
    // });

    // simulate a collision between the first spawned object and 'cube' 
    // if (this.spawnedObjects[0].collidable) {
    //     this.spawnedObjects[0].onCollide(this.cube);
    // }

    // example: Rotate all the 'spawned' objects in the scene
    // this.spawnedObjects.forEach((object) => {
    //     object.rotate('y', deltaTime * 0.5);
    // });

    this.updateMovement(this.cube.pressedKeys); // Call movement for our object using the pressedKeys list that has been added to
    this.updateFirstPerson();
    this.checkCollision(this.cube); // Call collision checks on our object
  }
}
