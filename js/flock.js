var flockInitCount = 0;

var Flock = function() {
    var boids = []; // An ArrayList for all the boids    
    
    this.run = function() {  
        if(flockInitCount < numBoids)
            return;
//        This is for the one that sees others with the dot product
//        var b1 = boids[0];
//        b1.col = color(0, 0, 255);
//        b1.view(boids);

        for (var i = 0; i < boids.length; i++) {
          boids[i].flock(boids);  // Passing the entire list of boids to each boid individually
        }

        for (var i = 0; i < boids.length; i++) {
          boids[i].run();  // Passing the entire list of boids to each boid individually
        }
    }

    this.addBoid = function(b) {
        boids.push(b);
    }
}