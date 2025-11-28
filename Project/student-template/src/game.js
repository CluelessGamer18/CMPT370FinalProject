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

  // Create a box collider to detect hitboxes possibly
  // Using a halfsize for each coordinate (xyz) allows for simpler math and faster compution times (no division during actual computions)
  createBoxCollider(object, width, height, depth, onCollide = null) {
    object.collider = {
      type: "BOX",
      halfsize: [
        width / 2,
        height / 2,
        depth / 2
      ],
      onCollide: onCollide ? onCollide: (otherObject) => {
        console.log(`Collided with ${otherObject.name}`);
      }
    };
    this.collidableObjects.push(object);
  }

  // Collision logic for two box colliders colliding
  checkBoxvsBox(objA, objB){
    const aPos = objA.model.position; // Box A's position
    const bPos = objB.model.position; // Box B's position

    const aHalfsize = objA.collider.halfsize; // Box A's halfsize
    const bHalfsize = objB.collider.halfsize; // Box B's halfsize

    // Return true if collided, false if not
    return (
      Math.abs(aPos[0] - bPos[0]) < (aHalfsize[0] + bHalfsize[0]) && Math.abs(aPos[1] - bPos[1]) < (aHalfsize[1] + bHalfsize[1]) && Math.abs(aPos[2] - bPos[2]) < (aHalfsize[2] + bHalfsize[2])
    );
  }

  // Collision logic for two sphere colliders colliding
  checkSpherevsSphere(objA, objB) {
    let dx = objB.model.position[0] - objA.model.position[0]; // X distance from Sphere A to Sphere B
    let dy = objB.model.position[1] - objA.model.position[1]; // Y distance from Sphere A to Sphere B
    let dz = objB.model.position[2] - objA.model.position[2]; // Z distance from Sphere A to Sphere B
    let distSquared = (dx*dx) + (dy*dy) + (dz*dz); // Total Distance
    let radSquare = objA.collider.radius + objB.collider.radius; // Add together both Sphere's Radii

    // Return squared distance to limit use or sqrt functions
    return distSquared < (radSquare * radSquare);
  }

  // Collision logic for a sphere colliding with a box and vice versa
  checkSpherevsBox(sphereObj, boxObj){
    const sPos = sphereObj.model.position; // Sphere object position
    const bPos = boxObj.model.position; // Box object position
    const bHalf = boxObj.collider.halfsize; // Halfsize of box object
    const rad = sphereObj.collider.radius; // Radius of sphere object

    // Find the closest spot on the box to the sphere's center
    let closestX = Math.max(bPos[0] - bHalf[0], Math.min(sPos[0], bPos[0] + bHalf[0]));
    let closestY = Math.max(bPos[1] - bHalf[1], Math.min(sPos[1], bPos[1] + bHalf[1]));
    let closestZ = Math.max(bPos[2] - bHalf[2], Math.min(sPos[2], bPos[2] + bHalf[2]));

    // Distance from the sphere's center to the closest point on the box
    let dx = closestX - sPos[0];
    let dy = closestY - sPos[1];
    let dz = closestZ - sPos[2];

    // Total distance
    let distanceSq = (dx*dx) + (dy*dy) + (dz*dz);

    // Return squared distance to limit use or sqrt functions
    return distanceSq < (rad * rad);
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

      // Check for collisions between two sphere colliders
      if  (object.collider.type === "SPHERE" && otherObject.collider.type === "SPHERE"){
        if (this.checkSpherevsSphere(object, otherObject)){
          collided = true;
          object.collider.onCollide(otherObject);
        }
      }

      // Check for collisions between to box colliders
      if (object.collider.type === "BOX" && otherObject.collider.type === "BOX"){
        if (this.checkBoxvsBox(object, otherObject)){
          collided = true;
          object.collider.onCollide(otherObject);
        }
      }

      // Check for collisions between a sphere and a box collider
      if (object.collider.type === "SPHERE" && otherObject.collider.type === "BOX"){
        if (this.checkSpherevsBox(object, otherObject)){
          collided = true;
          object.collider.onCollide(otherObject);
        }
      }

      // Check for collision between a sphere and a box collider
      if (object.collider.type === "BOX" && otherObject.collider.type === "SPHERE") {
        if (this.checkSpherevsBox(otherObject, object)){
          collided = true; 
          object.collider.onCollide(otherObject);
        }
      }
      
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

    // Set the objects
    this.cube = getObject(this.state, "Cube1"); // Character object
    this.cube1 = getObject(this.state, "Cube2"); 
    this.plane = getObject(this.state, "Ground"); // Ground

    // Create the colliders
    // this.createSphereCollider(this.cube, 0.5);
    this.createBoxCollider(this.cube, this.cube.model.scale[0]*0.5, this.cube.model.scale[1]*0.5, this.cube.model.scale[2]*0.5); // Multiple by 0.5 to properly set scale
    this.createBoxCollider(this.plane, this.plane.model.scale[0]*0.5, this.plane.model.scale[1]*0.5, this.plane.model.scale[2]*0.5); // Multiply by 0.5 to properly set the scale (objects are 0.5x0.5 normally)
    this.createBoxCollider(this.cube1, this.cube1.model.scale[0]*0.5, this.cube1.model.scale[1]*0.5, this.cube1.model.scale[2]*0.5); // Multiply by 0.5 to properly set the scale (objects are 0.5x0.5 normally)

    // Listen for key presses and add them to a list to keep track of for another function below
    document.addEventListener("keydown", (e) => {
      this.cube.pressedKeys[e.key] = true;
    });

    // Once user lets go of those keys remove them from the list to stop using them
    document.addEventListener("keyup", (e) =>{
      // delete this.cube.pressedKeys[e.key];
      this.cube.pressedKeys[e.key] = false;
      
    });

    document.addEventListener("keypress", (e) => {
      e.preventDefault();

      switch (e.key) {
        // Test if the spacebar is pressed
        case " ":
          if (!this.cube.isJumping){
            this.cube.velocity[1] = this.cube.jumpSpeed; // Assign a preset jumpspeed to the object
            this.cube.isJumping = true; // Set the isJumping flag to true
          }
          break;

        case "m": // This sets a toggle for the first person camera angle, it also locks and hides the cursor while active to allow for smooth movement
          if (this.cube.firstPersonToggle == false){
            this.cube.firstPersonToggle = true; // Toggle on our first person view
            document.body.requestPointerLock(); // 'Locks' cursor, allows for tracking of motion on a wider range
            this.cube.material.alpha = 0.0; // Sets our objects alpha value to 0 so we dont see ourselves while we move
          } else {
            this.cube.firstPersonToggle = false; // Toggle off our first person view
            document.exitPointerLock(); // Unlock our cursor
            this.cube.material.alpha = 1.0; // Reset alpha value for our character (in this instance we are fully opaque)
          }

        default:
          break;
      }
    });

    // Music Player for our Background Music ;)
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
        
        // Adds mouse movements to a set value within the RenderObject Cube file
        this.cube.accumulatedX += e.movementX;
        this.cube.accumulatedY += e.movementY;
      }
    });

  }

  // New Movement Option
  updateMovement(keys) {
      let moveX = 0; // Set temp value for movement
      let moveY = 0; // Set temp value for Y movement (camera only)
      let moveZ = 0; // Set temp value for movement
      let rotationSpeed = 1; // Camera Rotation Speed (camera only)

      // Determine what key was pressed and what values to set
      if (keys['w']) moveX += 1;
      if (keys['s']) moveX -= 1;
      if (keys['a']) moveZ -= 1;
      if (keys['d']) moveZ += 1;
      if (keys['Shift']) moveY += 1;
      if (keys['Control']) moveY -= 1;

      // No movement detected, return out of the function because we don't need to modify the values
      // if (moveX === 0 && moveZ === 0 && moveY === 0) return;

      if (this.cube.firstPersonToggle){
        // const originalPos = vec3.clone(this.cube.model.position); // Save original position in case we collide with something
        const localMove = vec3.fromValues(moveX, 0, moveZ); // This is our temporary movement value, this will be used later
        vec3.normalize(localMove, localMove); // Normalize the direction values

        const speed = 0.25; // Set a scaleable speed value to set movement to be the same speed
        vec3.scale(localMove, localMove, speed); // Scale the movement vector by the speed
        const rotationMat3 = mat3.create();
        const worldMove = vec3.create();

        mat3.fromMat4(rotationMat3, this.cube.model.rotation); // Get the cube's rotation matrix, but only the rotations (we dont need the translations / scale)
        vec3.transformMat3(worldMove, localMove, rotationMat3); // Set the worldMove value based on the localMove and the rotation matrix

        // vec3.add(this.cube.model.position, this.cube.model.position, worldMove); // Attempt to move to the new location

        // Move X
        const originalX = this.cube.model.position[0];
        this.cube.model.position[0] += worldMove[0];
        if (this.checkCollision(this.cube)) this.cube.model.position[0] = originalX;

        // Move Z
        const originalZ = this.cube.model.position[2];
        this.cube.model.position[2] += worldMove[2];
        if (this.checkCollision(this.cube)) this.cube.model.position[2] = originalZ;
      } else {
        const localMove = vec3.fromValues(moveX, moveY, moveZ);
        vec3.normalize(localMove, localMove);

        const speed = 0.25;
        vec3.scale(localMove, localMove, speed);

        const forward = state.camera.front;
        vec3.normalize(forward, forward);

        const right = vec3.fromValues(forward[2], 0, -forward[0]);

        const worldMoveCamera = vec3.create();
        vec3.scale(worldMoveCamera, forward, localMove[0]);
        const rightMove = vec3.create();
        vec3.scale(rightMove, right, -localMove[2]);
        const upMove = vec3.fromValues(0, localMove[1], 0);

        vec3.add(worldMoveCamera, worldMoveCamera, rightMove);
        vec3.add(worldMoveCamera, worldMoveCamera, upMove);

        state.camera.position[0] += worldMoveCamera[0];
        state.camera.position[1] += worldMoveCamera[1];
        state.camera.position[2] += worldMoveCamera[2];

        if (keys['ArrowRight']){
          const rotationMat = mat4.create();
          mat4.rotateY(rotationMat, rotationMat, (-rotationSpeed*Math.PI / 180)); // Rotate around Y
          vec3.transformMat4(state.camera.front, state.camera.front, rotationMat);
        }
        
        if (keys['ArrowLeft']){
          const rotationMat = mat4.create();
          mat4.rotateY(rotationMat, rotationMat, (rotationSpeed*Math.PI / 180)); // Rotate around Y
          vec3.transformMat4(state.camera.front, state.camera.front, rotationMat);
        }

      }

    }

    // Uses the set values given to the cube to rotate around the Y axis, giving us horizontal vision (Vertical may be too hard for the scope right now)
    updateFirstPerson() {
      if (this.cube.firstPersonToggle) {
        let rotationY = this.cube.accumulatedX * this.cube.mouseSpeedY * this.cube.smoothing;

        this.cube.rotate('y', rotationY);

        this.cube.accumulatedX *= (1 - this.cube.smoothing);
        this.cube.accumulatedY *= (1 - this.cube.smoothing);
      }
    }
  // Function to get the height of a collided with object
  getCollisionHeight(object){
    for (let obj of this.collidableObjects){
      if (this.checkCollision(object)){
        return obj.model.position[1];
      }
    }

    return null;
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


    let falling = this.cube.isJumping  || !this.checkCollision(this.cube);

    // Modified jumping / falling code
    // This code is not perfect, because of the above flag it causes it to always be "falling" after adjusting the collision box height to be above the ground
    if (falling) {
      // Apply gravity
      this.cube.velocity[1] += this.cube.gravity * deltaTime;
      this.cube.model.position[1] += this.cube.velocity[1] * deltaTime;

      // Check if cube lands
      if (this.checkCollision(this.cube)){

        // Get the height of the object that our player runs into
        const collisionHeight = this.getCollisionHeight(this.cube);

        // Check to see if it has a value
        if (collisionHeight != null){
          // Adjust for collision, allow for character to be above the "hitbox"
          this.cube.model.position[1] = collisionHeight + this.cube.collider.halfsize[1]; 

          // Set velocity to 0
          this.cube.velocity[1] = 0;

          // Stop jumping
          this.cube.isJumping = false;
          falling = false; // This doesn't do anything to my knowledge because it gets reset above every frame and will always be true
        }
      }
    } 



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
