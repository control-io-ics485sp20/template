function Game() {
    var _this = this

    console.log("[Control.IO] Starting game instance...");
    init();

    _this.gameLobby;
    _this.gameWindow;
    _this.gameMap;

    _this.gameStatus;

    // var gameRunning;

    function init() {
        window.addEventListener('gamepadconnected', controllerConnectedEvent);
        window.addEventListener('gamepaddisconnected', controllerDisconnectedEvent);
        window.addEventListener('keyup', keyUp);

        // window.addEventListener("MozGamepadButtonDown", function(evt) { buttonPressed(evt, true); } );
        // window.addEventListener("MozGamepadButtonUp", function(evt) { buttonPressed(evt, false); } );

        //if singleplayer selected
        runLocalPlayer();

        //if multiplayer selected
        //totally optional
    };

    function runLocalPlayer() {
        console.log("Starting a local session...")
        _this.gameLobby = new GameLobby("Starting Local Session...");
        _this.gameStatus = "local-lobby"
        var gameLobbyResult = _this.gameLobby.create();
    }

    function runMultiPlayer() {
        console.log("Joining a multiplayer session...");
        //totally optional
    }

    function startGame(controllers) {
        // console.log(controllers);

        _this.gameStatus = "singleplayer-game";
        //start game countdown
        //start game
        //create start game timer
        let dimensions = {width: window.innerWidth, height: window.innerHeight}

        _this.gameWindow = new GameWindow(dimensions);
        _this.gameWindow.init();
        _this.gameMap = new GameMap(dimensions);

        // initMap();

        addPlayers(controllers);
        TotalPlayers = players.length;

        paper.view.onFrame = function() {
            checkGameStatus();

            spawnAsteroids();

            updatePlayers();
            updateAsteroids();
        }
    }

    function spawnAsteroids() {
        if ((asteroids.length < AsteroidSpawnCap) && ((Math.random() * 101) < AsteroidSpawnRate)) {
            let asteroid = new Asteroid(_this.gameWindow, _this.gameMap);
            asteroids.push(asteroid);
        }
    }

    return {
        startGame: startGame,
        checkGameStatus: checkGameStatus
    }       

    /**
     * addPlayers
     *
     * Adds players to the game
     */
    function addPlayers(controllers) { //TODO only add players from lobby
        Object.keys(controllers).forEach(function (id) {
            if (controllers[id]["player"] != null) {
                if (controllers[id]["gamepad"] != null) {
                    players.push(new Player(_this.gameWindow, _this.gameMap, controllers[id]["player"]["color"], controllers[id]["player"]["name"], controllers[id]["gamepad"], null));
                } else if (id == "keyboard1") {
                    players.push(new Player(_this.gameWindow, _this.gameMap, controllers[id]["player"]["color"], controllers[id]["player"]["name"], null, {up: "ArrowUp", down: "ArrowDown", left: "ArrowLeft", right: "ArrowRight", abutton: "Space", bbutton: "ShiftLeft"}) );
                }
                playerCount++;
            }
        });
    }

    function updatePlayers() {
        players.forEach(function (player) {
            player.updatePos();
        });
    }

    function updateAsteroids() {
        asteroids.forEach(function (asteroid, index, object) {
            var result = asteroid.updatePos();
            if (!result) {
                object.splice(index, 1);
            }
        })
    }

    //Literally from https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API/Using_the_Gamepad_API
    /**
     * controllerConnectedEvent
     * Detects when a gamepad is connected and announces it.
     */
    function controllerConnectedEvent(event) {
        if (_this.gameStatus == "local-lobby") {
            _this.gameLobby.controllerJoin(event);
        } else if (_this.gameStatus == "singleplayer-game") {
            //TODO allow for reconnect of disconnected player
        } else if (_this.gameStatus == "debug") {
            var i = 0;
            while(i < players.length) {
                if (players[i].gamepad == undefined) {
                    players[i].gamepad = event.gamepad;
                    console.log("Gamepad connected and assigned to %s with index %d: %s. %d buttons, %d axes.",
                        players[i].name, event.gamepad.index, event.gamepad.id, event.gamepad.buttons.length, event.gamepad.axes.length);
                    break;
                }
                i++;
            }
        }
    };

    function controllerDisconnectedEvent(event) {
        if (_this.gameStatus == "local-lobby") {
            _this.gameLobby.controllerLeave(event);
        } else if (_this.gameStatus == "singleplayer-game") {
            //TODO allow for reconnect of disconnected player
        } else if (_this.gameStatus == "debug") {
            var i = 0;
            while(i < players.length) {
                if (players[i].gamepad == event.gamepad) {
                    players[i].gamepad = undefined;
                    console.log("Gamepad disconnected from %s with index %d: %s. %d buttons, %d axes.",
                        players[i].name, event.gamepad.index, event.gamepad.id, event.gamepad.buttons.length, event.gamepad.axes.length);
                    break;
                }
                i++;
            }
        }
    }

    function keyUp(event) {
        if (_this.gameStatus == "local-lobby") {
            _this.gameLobby.joinLeaveKeyboard(event);
        } else if (_this.gameStatus == "singleplayer-game") {

        } else {

        }
    }
}

console.log("[Control.IO] Loaded game module.")

//TODO can't seem to call checkGameStatus 
function checkGameStatus() {
    if (TotalPlayers == 1) { //if local singleplayer
        //TODO if timer is up
    } else { //if local multiplayer
        if (playerCount <= 1) { //or timer is up
            console.log("Game has finished!");
            console.log(playerCount);
            window.cancelAnimationFrame(gameRunning);
        }
    }
}
