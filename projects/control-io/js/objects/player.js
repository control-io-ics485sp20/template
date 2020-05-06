/**
 * Player
 *
 * Class that represents a Player
 */
function Player (gamewindow, gameMap, color, name, gamepad, keybinds) {
    var _this = this;
    _this.id = "player-" + (Date.now() * Math.random()).toString().replace(".", "-");

    _this.score = 0;
    _this.health = PlayerBaseHP;

    _this.coordsArray = [];
    _this.linesArray = [];
    _this.claimedShapesArray = [];

    _this.gamewindow = gamewindow;

    _this.name = name;

    _this.color = {
        normal: color,
        bright: tinycolor(color).brighten(25).toString(),
        dark: tinycolor(color).darken(25).toString()
    };

    //maxrange
    //maxpoints

    _this.gamepad = gamepad;
    _this.keybinds = keybinds;

    // _this.player

    randomSpawn(gamewindow);
        // setCoord();
    // };

    function randomSpawn(gamewindow) {
        var random_x = Math.floor(((Math.random() * Math.floor(max_x))));
        var random_y = Math.floor(((Math.random() * Math.floor(max_y))));

        _this.playerobject = new PlayerObject(_this.gamewindow, random_x, random_y, _this.color.normal);
    }

    /*
        * moveX
        *
        * Given a float modifier value, updates the player's position on the X axis for a frame.
        */
    function moveX (modifier) {
        let nextxcoord = (_this.playerobject.assetgroup.position.x + (PlayerMinVelocityCap * modifier));
        if (nextxcoord < PlayerMinX) {
            nextxcoord = PlayerMinX;
        } else if (nextxcoord > PlayerMaxX) {
            nextxcoord = PlayerMaxX;
        }
        _this.playerobject.assetgroup.position.x = nextxcoord;
        _this.playerobject.movement.velX = modifier;
        updateVisualGuidingLine(_this.playerobject.assetgroup.position.x, null, 1);

        _this.playerobject.sprite_exhaust.visible = true;
    }

    /*
        * moveY
        *
        * Given a float modifier value, updates the player's position on the Y axis for a frame.
        */
    function moveY (modifier) {
        let nextycoord = (_this.playerobject.assetgroup.position.y + (PlayerMinVelocityCap * modifier));
        if (nextycoord < PlayerMinY) {
            nextycoord = PlayerMinY;
        } else if (nextycoord > PlayerMaxY) {
            nextycoord = PlayerMaxY;
        }
        _this.playerobject.assetgroup.position.y = nextycoord;
        _this.translateY = nextycoord - _this.playerobject.assetgroup.position.y;
        _this.playerobject.moveY(_this.translateY);
        _this.playerobject.movement.velY = modifier;
        updateVisualGuidingLine(null, _this.playerobject.assetgroup.position.y, 1);

        _this.playerobject.sprite_exhaust.visible = true;
    }

    function setCoord() {
    //     if (debug) {
    //         console.log(`player.js.Player.setCoord
    // x: ` + _this.playerobject.assetgroup.position.getX() + `
    // y: ` + _this.playerobject.assetgroup.position.getY());
    //     }
    //     if (debug) {
    //         console.log(`player.js.Player.setCoord
    // x: ` + _this.playerobject.assetgroup.position.getX() + `
    // y: ` + _this.playerobject.assetgroup.position.getY());

        var dot_sound = new Audio('../music/dot.wav');
        dot_sound.play();
        // }
        if (_this.coordsArray == undefined || _this.coordsArray.length == 0) {
            var tempPoint = new paper.Point(_this.playerobject.assetgroup.position.x, _this.playerobject.assetgroup.position.y);
            if(!checkPointIntersects(tempPoint)) {
                _this.coordsArray.push(new PlayerCoordinate(_this.gamewindow, _this.playerobject.assetgroup.position.x, _this.playerobject.assetgroup.position.y, _this.color.normal));
                _this.guidingLine = new PlayerGuidingLine(_this.gamewindow, _this.coordsArray[0].x, _this.coordsArray[0].y, _this.playerobject.assetgroup.position.x, _this.playerobject.assetgroup.position.y, _this.color.normal);
            }
        } else {
            if (!checkLineIntersects(_this.guidingLine)) {
                var lastCoord = _this.coordsArray[_this.coordsArray.length - 1];

                _this.coordsArray.push(new PlayerCoordinate(_this.gamewindow, _this.playerobject.assetgroup.position.x, _this.playerobject.assetgroup.position.y, _this.color.normal));

                _this.linesArray.push(new PlayerCoordinateLine(_this.gamewindow, _this.playerobject.assetgroup.position.x, _this.playerobject.assetgroup.position.y, lastCoord.x, lastCoord.y, _this.color.normal));

                updateVisualGuidingLine(_this.playerobject.assetgroup.position.x, _this.playerobject.assetgroup.position.y, 0);
            }
        }
    }

    function updateVisualGuidingLine(x, y, index) {
        if (_this.guidingLine != null) {
            if (x != null) {
                _this.guidingLine.asset.segments[index].point.x = x;
            }
            if (y != null) {
                _this.guidingLine.asset.segments[index].point.y = y;
            }
            _this.guidingLine.asset.bringToFront();
        }
    }

    function removeVisuals() {
        if (_this.playerobject.assetgroup != null) {
            _this.playerobject.assetgroup.remove();
        }
        if (_this.guidingLine != null && _this.guidingLine.asset != null) {
            _this.guidingLine.asset.remove();
        }
        while (_this.coordsArray.length > 0) {
            var n = _this.coordsArray.pop();
            n.asset.remove();
        }
        while (_this.linesArray.length > 0) {
            var n = _this.linesArray.pop();
            n.asset.remove();
        }
    }

    function attemptClaimShape() {
        if (!(_this.coordsArray == undefined || _this.coordsArray.length < 2)) {
            var completingLine = new PlayerCoordinateLine(_this.gamewindow, _this.coordsArray[0].asset.position.x, _this.coordsArray[0].asset.position.y, _this.playerobject.assetgroup.position.x, _this.playerobject.assetgroup.position.y, _this.color.normal);

            if (!(checkLineIntersects(completingLine) || checkLineIntersects(_this.guidingLine))) {
                setCoord();

                game.forcefields.push(new PlayerForcefield(_this.gamewindow, _this.id, _this.coordsArray, _this.color.dark));

                // _this.claimedShapesArray.push(new PlayerPolygon(_this.gamewindow, _this.id, _this.coordsArray, _this.color.dark));

                while (_this.coordsArray.length > 0) {
                    var n = _this.coordsArray.pop();
                    n.asset.remove();
                }

                while (_this.linesArray.length > 0) {
                    var n = _this.linesArray.pop();
                    n.asset.remove();
                }

                _this.guidingLine.asset.remove();
                _this.guidingLine = null;
            }

            completingLine.asset.remove();
        }
    }

    //debug
    function printCoordinates() {
        console.log(_this.playerobject.assetgroup.position.x);
        console.log(_this.playerobject.assetgroup.position.y);

        _this.checkOutOfBounds();
    }

    function checkLineIntersects(line) {
        let claimedshapes = _this.gamewindow.layers["shapes"].children;

        let intersectConflict = false;

        Object.keys(claimedshapes).forEach(function (id) {
            if (claimedshapes[id].intersects(line.asset)) {
                intersectConflict = true;
            }
        });
        return intersectConflict;
    }

    function checkPointIntersects(point) {
        let claimedshapes = _this.gamewindow.layers["shapes"].children;

        let intersectConflict = false;

        Object.keys(claimedshapes).forEach(function (id) {
            if (claimedshapes[id].contains(point)) {
                intersectConflict = true;
            }
        });
        return intersectConflict;
    }

    function checkOutOfBounds() {
        if ((_this.playerobject.assetgroup.position.x <= min_x) || (_this.playerobject.assetgroup.position.x >= max_x) || (_this.playerobject.assetgroup.position.y <= min_y) || (_this.playerobject.assetgroup.position.y >= max_y)) {
            // console.log(_this.playerobject.assetgroup.position.x + " " + _this.playerobject.assetgroup.position.y);
            // _this.die("border");
            if (debug) {
                console.log("   Out of bounds!");
            }
        }
    }

    function die(reason, participant) {
        if (reason == "border") {
            console.log(_this.name + " ran into a wall and died!");
        } else if (reason == "pkill") {
            console.log(_this.name + " was slain!");
        } else {
            console.log(_this.name + " died!");
        }
        _this.removeVisuals();
        game.playerCount -= 1;
        checkGameStatus();
    }

    function updatePos (paused) {
        var moving = false;
        if (_this.gamepad == undefined) { //if keyboard
            let ljx = 0;
            let ljy = 0;

            if (_this.UpPressed) {
                ljy = -1;
            }
            if (_this.DownPressed) {
                ljy = 1;
            }
            if (_this.LeftPressed) {
                ljx = -1;
            }
            if (_this.RightPressed) {
                ljx = 1;
            }

            if (_this.UpPressed && _this.LeftPressed) {
                ljx = -PlayerKeyboardDiagonalVelocityCap;
                ljy = -PlayerKeyboardDiagonalVelocityCap;
            }
            if (_this.UpPressed && _this.RightPressed) {
                ljx = PlayerKeyboardDiagonalVelocityCap;
                ljy = -PlayerKeyboardDiagonalVelocityCap;
            }
            if (_this.DownPressed && _this.LeftPressed) {
                ljx = -PlayerKeyboardDiagonalVelocityCap;
                ljy = PlayerKeyboardDiagonalVelocityCap;
            }
            if (_this.DownPressed && _this.RightPressed) {
                ljx = PlayerKeyboardDiagonalVelocityCap;
                ljy = PlayerKeyboardDiagonalVelocityCap;
            }

            if (_this.UpPressed && _this.DownPressed) {
                ljy = 0;
            }
            if (_this.LeftPressed && _this.RightPressed) {
                ljx = 0;
            }

            if (!paused) {
                moveY(ljy);
                moveX(ljx);

                if (ljx != 0 || ljy != 0) {
                    let angle = Math.atan2(ljy, ljx) * (180/pi) + 90;
                    _this.playerobject.rotate(angle);
                    moving = true;
                }
            }


        } else { //if gamepad
            if (_this.ALocked == false && _this.gamepad.buttons[0].pressed) {
                setCoord();
                _this.ALocked = true;
            } else if (!_this.gamepad.buttons[0].pressed) {
                _this.ALocked = false;
            }

            if (_this.BLocked == false && _this.gamepad.buttons[1].pressed) {
                attemptClaimShape();
                _this.BLocked = true;
            } else if (!_this.gamepad.buttons[1].pressed) {
                _this.BLocked = false;
            }

            if (_this.StartLocked == false && _this.gamepad.buttons[9].pressed) {
                game.togglePauseMenu();
                _this.StartLocked = true;
            } else if (!_this.gamepad.buttons[9].pressed) {
                _this.StartLocked = false;
            }

            let ljx = 0;
            let ljy = 0;

            ljx = refineAxisValue(_this.gamepad.axes[0]);
            ljy = refineAxisValue(_this.gamepad.axes[1]);

            if (!paused) {
                moveY(ljy);
                moveX(ljx);

                if (ljx != 0 || ljy != 0) {
                    let angle = Math.atan2(ljy, ljx) * (180/pi) + 90;
                    _this.playerobject.rotate(angle);
                    moving = true;
                }
            }
        }
        if (!moving) {
            _this.playerobject.sprite_exhaust.visible = false;
        }

        // _this.checkOutOfBounds();
    }

    function keyDown (e) {
        if (_this.keybinds) {
            switch(e.code) {
                case _this.keybinds.abutton:
                    if (!_this.ALocked) {
                        setCoord();
                        _this.ALocked = true;
                    }
                    break;
                case _this.keybinds.bbutton:
                    if (!_this.BLocked) {
                        attemptClaimShape();
                        _this.BLocked = true;
                    }
                    break;
                case _this.keybinds.startbutton:
                    if (!_this.StartLocked) {
                        game.togglePauseMenu();
                        _this.StartLocked = true;
                    }
                    break;
                case _this.keybinds.up:
                    _this.UpPressed = true;
                    break;
                case _this.keybinds.down:
                    _this.DownPressed = true;
                    break;
                case _this.keybinds.left:
                    _this.LeftPressed = true;
                    break;
                case _this.keybinds.right:
                    _this.RightPressed = true;
                    break;
                default:
                    break;
            }
        }
    }

    function keyUp (e) {
        if (_this.keybinds) {
            switch(e.code) {
                case _this.keybinds.abutton:
                    _this.ALocked = false;
                    break;
                case _this.keybinds.bbutton:
                    _this.BLocked = false;
                    break;
                case _this.keybinds.startbutton:
                    _this.StartLocked = false;
                break;
                case _this.keybinds.up:
                    _this.UpPressed = false;
                    break;
                case _this.keybinds.down:
                    _this.DownPressed = false;
                    break;
                case _this.keybinds.left:
                    _this.LeftPressed = false;
                    break;
                case _this.keybinds.right:
                    _this.RightPressed = false;
                    break;
                default:
                    break;
            }
        }
    }

    return {
        updatePos: updatePos,
        keyDown: keyDown,
        keyUp: keyUp,
        id: _this.id,
        score: _this.score,
        health: _this.health,
        playerobject: _this.playerobject,
        hitbox: _this.playerobject.hitbox,
        name: _this.name,
        color: _this.color,
    }
};
