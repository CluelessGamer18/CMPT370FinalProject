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
    const aPos = objA.model.position;
    const bPos = objB.model.position;

    const aHalfsize = objA.collider.halfsize;
    const bHalfsize = objB.collider.halfsize;

    return (
      Math.abs(aPos[0] - bPos[0]) < (aHalfsize[0] + bHalfsize[0]) && Math.abs(aPos[1] - bPos[1]) < (aHalfsize[1] + bHalfsize[1]) && Math.abs(aPos[2] - bPos[2]) < (aHalfsize[2] + bHalfsize[2])
    );
  }

  // Collision logic for two sphere colliders colliding
  checkSpherevsSphere(objA, objB) {
    let dx = objB.model.position[0] - objA.model.position[0];
    let dy = objB.model.position[1] - objA.model.position[1];
    let dz = objB.model.position[2] - objA.model.position[2];
    let distSquared = (dx*dx) + (dy*dy) + (dz*dz);
    let radSquare = objA.collider.radius + objB.collider.radius;

    return distSquared < (radSquare * radSquare);
  }

  // Collision logic for a sphere colliding with a box and vice versa
  checkSpherevsBox(sphereObj, boxObj){
    const sPos = sphereObj.model.position;
    const bPos = boxObj.model.position;
    const bHalf = boxObj.collider.halfsize;
    const rad = sphereObj.collider.radius;

    // Find the closest spot on the box to the sphere's center
    let closestX = Math.max(bPos[0] - bHalf[0], Math.min(sPos[0], bPos[0] + bHalf[0]));
    let closestY = Math.max(bPos[1] - bHalf[1], Math.min(sPos[1], bPos[1] + bHalf[1]));
    let closestZ = Math.max(bPos[2] - bHalf[2], Math.min(sPos[2], bPos[2] + bHalf[2]));

    // Distance from the sphere's center to the closest point on the box
    let dx = closestX - sPos[0];
    let dy = closestY - sPos[1];
    let dz = closestZ - sPos[2];

    let distanceSq = (dx*dx) + (dy*dy) + (dz*dz);

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
    this.cube = getObject(this.state, "Cube1");
    this.cube1 = getObject(this.state, "Cube2");
    this.plane = getObject(this.state, "Ground");

    // Create the colliders
    this.createSphereCollider(this.cube, 0.5);
    this.createBoxCollider(this.plane, this.plane.model.scale[0], this.plane.model.scale[1], this.plane.model.scale[2]);
    this.createBoxCollider(this.cube1, this.cube1.model.scale[0], this.cube1.model.scale[1], this.cube1.model.scale[2]);

    // Listen for key presses and add them to a list to keep track of for another function below
    document.addEventListener("keydown", (e) => {
      this.cube.pressedKeys[e.key] = true;
      console.log(this.cube.collider.radius);
      console.log(this.plane.collider.halfsize);
      
    });

    // Once user lets go of those keys remove them from the list to stop using them
    document.addEventListener("keyup", (e) =>{
      delete this.cube.pressedKeys[e.key];
      
    });

    document.addEventListener("keypress", (e) => {
      e.preventDefault();

      switch (e.key) {
        case " ":
          if (!this.cube.isJumping){
            this.cube.velocity[1] = this.cube.jumpSpeed;
            this.cube.isJumping = true;
          }
          break;

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
          console.log(this.cube1.model.position);

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
      // if (this.cube.model.position[1] <= 1) {
      //   this.cube.model.position[1] = 1;
      //   this.cube.velocity[1] = 0;
      //   this.cube.isJumping = false;
      // }
      if (this.checkCollision(this.cube)){
        this.cube.model.position[1] = this.cube.model.position[1] + 1;
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
