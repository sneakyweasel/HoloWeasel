var Boid = function(scene, x, y, z, geo, mat) {
  var obj;
  var velocity;
    
  var acceleration;
  var r;
  
  //TUNING VARIABLES
  //Speeds
  var rMaxS = 120;
  var rMinS = 80;
  var rMaxF = 5;
  var rMinF = 5;

  //Multipliers
  var sepMult = 1.5;
  var aliMult = 1;
  var cohMult = 0.8;
  var boundsMult = 3;

  //Detection ranges
  var sepRange = 25;
  var aliRange = 40;
  var cohRange = 40;
  
  var maxspeed = rMinS;    // Maximum speed
  var maxforce = rMinF;    // Maximum steering force
  var defaultSpeed = rMinS + Math.random() * (rMaxS - rMinS);
  var defaultForce = rMinF + Math.random() * (rMaxF - rMinF);

  var initialized = false;
    
  var worldX = 220;
  var worldY = 120;
  var worldZ = 120;
  
  function init() {
    acceleration = new THREE.Vector3(0, 0, 0);
    velocity = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);
    let pos = new THREE.Vector3(x, y, z);
    r = 5.0;
      
      
    let loader = new THREE.JSONLoader();

    // load a resource
    loader.load(

        // resource URL
        'FishModel.json',

        // Function when resource is loaded
        function ( geometry, materials ) {

            obj = new THREE.Mesh( geometry, mat );
            obj.position.set(pos.x, pos.y, pos.z);

            scene.add( obj );
            initialized = true;
            flockInitCount++;

        }
    );
      
//    obj = new THREE.Mesh(geo, mat);
//    obj.position.set(pos.x, pos.y, pos.z);
//    scene.add(obj);
//    initialized = true;
//    flockInitCount++;
  }

  this.run = function() { 
    if(!initialized)
        return;
      
    update();
//    borders();
    render();
  }
    
  this.getObj = function(){
      return obj;
  }
  this.getVelocity = function(){
      return velocity;
  }

  function applyForce(force) {
    // We could add mass here if we want A = F / M
    acceleration.add(force);
  }

  // We accumulate a new acceleration each time based on three rules
  this.flock = function(boids) {
    if(!initialized)
        return;
      
    var sep = separate(boids);   // Separation
    var ali = align(boids);      // Alignment
    var coh = cohesion(boids);   // Cohesion
    var bounds = turnToCenter();
      
    // Not for every boid yet
    // PVector view = view(boids);      // view

    // Arbitrarily weight these forces
    let sMult = sepMult + Math.max(0.9, sepSine) * 7 - (0.9 * 7);  
    let aMult = aliMult - Math.max(0.9, sepSine) * 2 + (0.9 * 2);
    let cMult = cohMult - Math.max(0.9, sepSine) * 2 + (0.9 * 2);
      
    sep.multiplyScalar(sMult);
    ali.multiplyScalar(aMult);
    coh.multiplyScalar(cMult);
    bounds.multiplyScalar(boundsMult);

    // Not for every boid yet
    // view.mult(1.0);

    // Add the force vectors to acceleration
    applyForce(sep);
    applyForce(ali);
    applyForce(coh);
    applyForce(bounds);

    // Not for every boid yet
    // applyForce(view);
  }
  
  function outOfBounds(){
      if(Math.abs(obj.position.x + velocity.x) > worldX){
          return true;
      }
      if(Math.abs(obj.position.y + velocity.y) > worldY){
          return true;
      }
      if(Math.abs(obj.position.z + velocity.z) > worldZ){
          return true;
      }
      return false;
  }
    
  function turnToCenter(){
      if(outOfBounds()){
          let force = new THREE.Vector3(-obj.position.x - velocity.x, -obj.position.y - velocity.y, -obj.position.z - velocity.z);
          force.normalize();
          force.multiplyScalar(maxforce);
          return force;
      } else{
          return new THREE.Vector3(0,0,0);
      }
  }

  // Method to update position
  function update() {
    maxspeed = defaultSpeed * deltaTime;
    maxforce = defaultForce * deltaTime;
    // Update velocity
    velocity.add(acceleration);
    // Limit speed
    velocity.clampLength(0, maxspeed);
    obj.position.add(velocity);
    // Reset accelertion to 0 each cycle
    acceleration.multiplyScalar(0);
  }

  // A method that calculates and applies a steering force towards a target
  // STEER = DESIRED MINUS VELOCITY
  function seek(target) {
    let desired = new THREE.Vector3(target.x - obj.position.x, target.y - obj.position.y, target.z - obj.position.z); // A vector pointing from the position to the target
    // Normalize desired and scale to maximum speed
    desired.normalize();
    desired.multiplyScalar(maxspeed);
    // Steering = Desired minus Velocity
    var steer = new THREE.Vector3(desired.x - velocity.x, desired.y - velocity.y, desired.z - velocity.z);
    steer.clampLength(0, maxforce);  // Limit to maximum steering force
    return steer;
  }

    var worldForward = new THREE.Vector3(0,0,1);
    
  function render() {
    // Draw a triangle rotated in the direction of velocity
    obj.position.add(velocity);
      
    var facing = new THREE.Vector3(obj.position.x + velocity.x, obj.position.y + velocity.y, obj.position.z + velocity.z);
      
    obj.lookAt(facing);
  }

  // Wraparound
//  void borders() {
//    if (position.x < -r) position.x = width+r;
//    if (position.y < -r) position.y = height+r;
//    if (position.x > width+r) position.x = -r;
//    if (position.y > height+r) position.y = -r;
//  }

  // Separation
  // Method checks for nearby boids and steers away
  function separate (boids) {
    let currentSep = Math.max(0.9, sepSine) * 200 + sepRange - (200 * 0.9);
    let desiredseparation = currentSep;
    let steer = new THREE.Vector3();
    let count = 0;
    // For every boid in the system, check if it's too close
    for (let i = 0; i < boids.length; i++) {
      let d = obj.position.distanceTo(boids[i].getObj().position);
      // If the distance is greater than 0 and less than an arbitrary amount (0 when you are yourself)
      if ((d > 0) && (d < desiredseparation)) {
        // Calculate vector pointing away from neighbor
        let other = boids[i].getObj();
        let diff = new THREE.Vector3(obj.position.x - other.position.x, obj.position.y - other.position.y, obj.position.z - other.position.z);
        diff.normalize();
        diff.divideScalar(d);        // Weight by distance
        steer.add(diff);
        count++;            // Keep track of how many
      }
    }
    // Average -- divide by how many
    if (count > 0) {
      steer.divideScalar(count);
    }

    // As long as the vector is greater than 0
    if (steer.length() > 0) {
      // Implement Reynolds: Steering = Desired - Velocity
      steer.normalize();
      steer.multiplyScalar(maxspeed);
      steer.sub(velocity);
      steer.clampLength(0, maxforce);
    }
    return steer;
  }

  // Alignment
  // For every nearby boid in the system, calculate the average velocity
  function align (boids) {
    let neighbordist = aliRange;
    let sum = new THREE.Vector3();
    let count = 0;
    for (let i = 0; i < boids.length; i++) {
      let d = obj.position.distanceTo(boids[i].getObj().position);
      if ((d > 0) && (d < neighbordist)) {
        sum.add(boids[i].getVelocity());
        count++;
      }
    }
    if (count > 0) {
      sum.divideScalar(count);
      sum.normalize();
      sum.multiplyScalar(maxspeed);
      let steer = new THREE.Vector3(sum.x - velocity.x, sum.y - velocity.y, sum.z - velocity.z);
      steer.clampLength(0, maxforce);
      return steer;
    } 
    else {
      return new THREE.Vector3(0,0,0);
    }
  }

  // Cohesion
  // For the average position (i.e. center) of all nearby boids, calculate steering vector towards that position
  function cohesion (boids) {
    let neighbordist = cohRange;
    let sum = new THREE.Vector3();   // Start with empty vector to accumulate all positions
    let count = 0;
    for (let i = 0; i < boids.length; i++) {
      let d = obj.position.distanceTo(boids[i].getObj().position);
      if ((d > 0) && (d < neighbordist)) {
        sum.add(boids[i].getObj().position);
        count++;
      }
    }
    if (count > 0) {
      sum.divideScalar(count);
      return seek(sum);  // Steer towards the position
    } 
    else {
      return new THREE.Vector3(0, 0, 0);
    }
  }
    
  init();
}