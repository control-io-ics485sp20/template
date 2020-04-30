/**
 * Asteroid
 *
 * Class that represents an Asteroid
 */

function Asteroid (gameWindow, gameMap) {
    var _this = this
    _this.id = (Date.now() * Math.random())

    _this.gamewindow = gameWindow;
    _this.gamemap = gameMap;

    //set random size
    _this.sizemodifier = (Math.random() * (AsteroidMaxSize - AsteroidMinSize) + AsteroidMinSize);
    //set random velocity
    _this.velocitymodifier = (Math.random() * (AsteroidMaxSpeed - AsteroidMinSpeed) + AsteroidMinSpeed);
    //set random spin speed
    _this.spinmodifier = (Math.random() * (AsteroidMaxSpinSpeed - AsteroidMinSpinSpeed) + AsteroidMinSpinSpeed);
    //set random spin direction
    if (AsteroidAllowNoSpin) { //if spindirection includes 0
        _this.spindirection = ((Math.floor(Math.random() * 2)) * ((Math.floor(Math.random() * 2)) == 1 ? 1 : -1));
    } else { //if spindirection excludes 0
        _this.spindirection = ((Math.floor(Math.random() * 2)) == 1 ? 1 : -1); 
    }

    _this.assetgroup = new paper.Group();
    _this.assetgroup.applyMatrix = false;

    _this.spritescaling = 0.11 * _this.sizemodifier;
    _this.sprite = new paper.Raster({
        source: '../img/sprites/asteroid-min.png',
        position: [0, 0],
        scaling: _this.spritescaling,
        applyMatrix: false
    });

    _this.mass = 1 * _this.sizemodifier;
    _this.radius = 11 * _this.sizemodifier;
    _this.hitbox = new paper.Path.Circle({
        radius: _this.radius,
        applyMatrix: false
    });
    if (showHitboxes == true) {
        _this.hitbox.strokeColor = AsteroidHitboxColor;
    } else {
        _this.hitbox.visible = false;
    }

    _this.assetgroup.addChild(_this.sprite);
    _this.assetgroup.addChild(_this.hitbox);

    _this.gamewindow.layers["asteroids"].addChild(_this.assetgroup);

    _this.velocity = spawn(_this);
    _this.velX = _this.velocity.x;
    _this.velY = _this.velocity.y;
    // }

    // console.log("Creating asteroid!");


    function spawn() {
        var x;
        var y;
        var velX;
        var velY;
        //TODO spawn at edge
        var xyspawn = (Math.floor(Math.random() * 4));
        if (xyspawn == 0) { //spawn top side
            x = Math.floor((Math.random() * Math.floor(GameObjectBorderMaxX)));
            y = GameObjectBorderMinY;

            velX = ((Math.random() * 1) * (Math.floor(Math.random() * 2) == 1 ? 1 : -1));
            velY = ((Math.random() * 1) * (1));
        } else if (xyspawn == 1) { //spawn bottom side
            x = Math.floor((Math.random() * Math.floor(GameObjectBorderMaxX)));
            y = GameObjectBorderMaxY;

            velX = ((Math.random() * 1) * (Math.floor(Math.random() * 2) == 1 ? 1 : -1));
            velY = ((Math.random() * 1) * (-1));
        } else if (xyspawn == 2) { //spawn left side
            x = GameObjectBorderMinX;
            y = Math.floor((Math.random() * Math.floor(GameObjectBorderMaxY)));

            velX = ((Math.random() * 1) * (1));
            velY = ((Math.random() * 1) * (Math.floor(Math.random() * 2) == 1 ? 1 : -1));
        } else if (xyspawn == 3) { //spawn right side
            x = GameObjectBorderMaxX;
            y = Math.floor((Math.random() * Math.floor(GameObjectBorderMaxY)));

            velX = ((Math.random() * 1) * (-1));
            velY = ((Math.random() * 1) * (Math.floor(Math.random() * 2) == 1 ? 1 : -1));
        }

        _this.assetgroup.position = [x, y];
        return {x: velX, y: velY};
    }

    function updatePos() {
        if (_this.assetgroup) {
            let newx = _this.assetgroup.position.x + _this.velocity.x * _this.velocitymodifier;
            let newy = _this.assetgroup.position.y + _this.velocity.y * _this.velocitymodifier;

            if (_this.gamemap.GameObjectIsOutOfBounds(newx, newy)) {
                remove(_this.hitbox, _this.sprite, _this.assetgroup);
                delete _this.hitbox;
                delete _this.sprite;
                delete _this.assetgroup;
            } else {
                _this.assetgroup.position.x = newx;
                _this.assetgroup.position.y = newy;

                _this.assetgroup.rotate(_this.spindirection * _this.spinmodifier);

                var asteroidHitBox = _this.hitbox;
                // var asteroidAssetGroup = _this.assetgroup;
                _this.asteroidHitboxRadius = _this.radius;

                var asteroidHitbox = {
                    id: _this.id,
                    x: _this.assetgroup.position.x,
                    y: _this.assetgroup.position.y,
                    radius: _this.radius
                }

                Object.keys(players).forEach(function (index) {
                    var playerHitbox = {
                        x: players[index].playerobject.assetgroup.position.x,
                        y: players[index].playerobject.assetgroup.position.y,
                        radius: players[index].playerobject.radius
                    }

                    if (checkHit(playerHitbox, asteroidHitbox)) {
                        if (players[index].playerobject) {
                            players[index].playerobject.hitbox.strokeColor = "red";
                        }
                        asteroidHitBox.strokeColor = "red";

                        //everything here should technically run
                        console.log("asteroid colliding with ship!");
                    } else {
                        if (players[index].playerobject) {
                            players[index].playerobject.hitbox.strokeColor = "white";
                        }
                        asteroidHitBox.strokeColor = "yellow";
                    }
                });

                Object.keys(asteroids).forEach(function (index) {
                    let asteroid2Hitbox = {
                        id: asteroids[index].id,
                        x: asteroids[index].assetgroup.position.x,
                        y: asteroids[index].assetgroup.position.y,
                        radius: asteroids[index].radius,
                    }
                    if (asteroidHitbox.id === asteroid2Hitbox.id) {
                        // console.log("same asteroid!");
                    } else {
                        if (checkHit(asteroidHitbox, asteroid2Hitbox)) {
                            resolveAsteroidToAsteroidCollision(_this, asteroids[index])
                        } else {
                        }
                    }
                });
            }
            return true;
        } else {
            return false;
        }
    }

    

    function remove(hitbox, sprite, assetgroup) {
        hitbox.remove();
        sprite.remove();
        assetgroup.remove();

        hitbox = null;
        sprite = null;
        assetgroup = null;

        
    }

    return {
        updatePos: updatePos,
        assetgroup: _this.assetgroup,
        gamemap: _this.gamemap,
        radius: _this.radius,
        sprite: _this.sprite,
        hitbox: _this.hitbox,
        id: _this.id,
        velocity: _this.velocity,
        mass: _this.mass,
    }
}

//gameitem
//base object
// function GameItem(id) {
//     this.id = id;
//     this.position.x = 0;
//     this.position.y = 0;

//     this.image = "";
// }

// //ship
// //controlled by player or ai
// //has hp
// function Ship(id) {
//     GameItem.call(this, id);

//     //these are ideas. Not sure if our ships will use these statistics.
//     this.health = 0;
//     this.deployables = 0;
//     this.fuel = 0;   //might not need fuel. 
// }

// //asteroid
// //has hp
// function Asteroid(id) {
//     GameItem.call(this, id);

//     this.health = 0;
//     this.damage = 0;
// }

// //space station
// //capturable
// //has hp
// function Station(id) {
//     GameItem.call(this, id);

//     // this.health = 0;
//     this.status = "unclaimed";
//     this.owner = null;
// }

// //planet
// //capturable
// function Planet() {
//     GameItem.call(this, id);
// }