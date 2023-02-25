// ---------------------------------------------------------------------
// ---------------------------- Init Server ----------------------------
// ---------------------------------------------------------------------

let express = require('express');
let app = express();
let server = require('http').createServer(app);
let io = require('socket.io')(server);

app.use(express.static(__dirname + '/node_modules'));
app.get('/', function(req, res,next) {
    res.sendFile(__dirname + '/pong.html');
});

// -------------------------------------------------------------------
// ---------------------------- Init Pong ----------------------------
// -------------------------------------------------------------------

let gameState = 'notStarted';
let maxPoints = 5;
let player1 = undefined;
let player2 = undefined;
let players = [];
let ball;
let nbrSpectators = 0;
let spectators = [];

const Direction = {
    UP:  -1,
    DOWN: 1
}
const Do = {
    CONTINUE: 0,
    END: 1
}

// Class player /!\ : size and position in %
class Player {
    constructor(position, id, client, board) {
        this.keyPress = {};
        this.id = id;
        this.name = 'player' + id;
        this.client = client;
        this.speed = 1;
        this.score = 0;
        //
        this.size = {
            width: (position.width / board.width) * 100,
            height: (position.height / board.height) * 100
        };
        this.coordCenter = {
            x: (this.size.width / 2) + (((position.left - board.left) / board.width) * 100),
            y: (this.size.height / 2) + (((position.top - board.top) / board.height) * 100)
        };
        this.coord = {
            top: this.coordCenter.y - this.size.height / 2,
            bottom: this.coordCenter.y + this.size.height / 2,
            left: this.coordCenter.x - this.size.width / 2,
            right: this.coordCenter.x + this.size.width / 2
        };
    }

    // Calcul coord of the new position of the paddle
    getNewPosition() {
        this.coord.top = this.coordCenter.y - this.size.height / 2;
        this.coord.bottom = this.coordCenter.y + this.size.height / 2;
        this.coord.left = this.coordCenter.x - this.size.width / 2;
        this.coord.right = this.coordCenter.x + this.size.width / 2;
    }


    /*
      * GAME OBJECT
      * SOCKETID: PLAYER1
      * SOCKETID: PLAYER2
      *

     */

    // Function to move the paddle on the board, and sending to everyone the new position
    move(way) {

        if ((player1.keyPress['w'] || player2.keyPress['ArrowUp']) && this.coord.top - this.speed < 0) {
            this.coordCenter.y = this.size.height / 2;
        } else if ((player1.keyPress['s'] || player2.keyPress['ArrowDown']) && this.coord.bottom + this.speed > 100) {
            this.coordCenter.y = 100 - this.size.height / 2;
        } else {
            this.coordCenter.y += this.speed * way;
        }

        this.getNewPosition();

        this.client.emit('movePaddle', {top: this.coord.top, id: this.id});
        for (let id in spectators) {
            spectators[id].emit('movePaddle', {top: this.coord.top, id: this.id});
        }
    }

    // Function to reset the place of the paddle in the board
    resetPlace() {
        this.coordCenter.y = 50;
        this.getNewPosition();

        this.client.emit('resetPaddle', this.coord.top);
        for (let id in spectators) {
            spectators[id].emit('resetPaddle', this.coord.top);
        }
    }
}

// Function to send the good event to everyone
function emitToEveryone(event, args) {
    player1.client.emit(event, args);
    player2.client.emit(event, args);
    for (let id in spectators) {
        spectators[id].emit(event, args);
    }
}

// Class Ball /!\ : size and position in %
class Ball {
    constructor(position, board) {
        this.speed = 0.5;
        this.directionX = Math.floor(Math.random() * 2) === 0 ? -1 * this.speed : this.speed;
        this.directionY = 0;
        this.size = {
            width: (position.width / board.width) * 100,
            height: (position.height / board.height) * 100
        };
        this.coordCenter = {
            x: (this.size.width / 2) + (((position.left - board.left)/ board.width) * 100),
            y: (this.size.height / 2) + (((position.top - board.top)/ board.height) * 100)
        };
        this.coord = {
            top: this.coordCenter.y - this.size.height / 2,
            bottom: this.coordCenter.y + this.size.height / 2,
            left: this.coordCenter.x - this.size.width / 2,
            right: this.coordCenter.x + this.size.width / 2
        };
    }

    // Calcul coord of the new position of the paddle
    getNewPosition() {
        this.coord.top = this.coordCenter.y - this.size.height / 2;
        this.coord.bottom = this.coordCenter.y + this.size.height / 2;
        this.coord.left = this.coordCenter.x - this.size.width / 2;
        this.coord.right = this.coordCenter.x + this.size.width / 2;
    }

    // Function to move the paddle on the board, and sending to everyone the new position
    move() {
        this.coordCenter.x += this.directionX * this.speed;
        this.coordCenter.y += this.directionY * this.speed;
        this.getNewPosition();

        emitToEveryone('moveBall', {top: this.coord.top, left: this.coord.left});
    }

    // Function to reset the place of the paddle in the board
    resetPlace() {
        this.coordCenter.x = 50;
        this.coordCenter.y = 50;
        this.getNewPosition();

        this.directionX = Math.floor(Math.random() * 2) === 0 ? -1 * this.speed : this.speed;
        this.directionY = 0;

        emitToEveryone('resetBall', {top: this.coord.top, left: this.coord.left});
    }
}

// when someone score, function to wait press space
async function waitForSpacePress(otherPlayer) {
    while (!otherPlayer.keyPress['Space']) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }
}

// When someone score, function to update to all players and spectators the score
// param1: the player who score
// param2: the other player
function getPoint(playerWhoScore, otherPlayer) {
    playerWhoScore.score++;
    emitToEveryone('updateScore', {id: playerWhoScore.id, score: playerWhoScore.score});
    if (playerWhoScore.score === maxPoints) {
        emitToEveryone('someoneWin', playerWhoScore.id);
        gameState = 'notStarted';
        return Do.END;
    }

    // emitToEveryone('newMessage', otherPlayer.name + ' you have to press space to play !');
    // await waitForSpacePress(otherPlayer);
    
    // TODO : wait that the player who doesn't score press the enter key and the ball will go in the direction of the player who score
    ball.resetPlace();
    return Do.CONTINUE;
}

// When the ball hit a paddle, function to calcul the new direction of the ball, direction x and direction y
// param : the player who hit the ball with his paddle
// function getNewDirection(playerWhoHitTheBall) {
//     ball.directionY = Math.tan((ball.coordCenter.y - playerWhoHitTheBall.coordCenter.y) / (playerWhoHitTheBall.size.height / 2)) * 1.5;
//
//     if (playerWhoHitTheBall === player1) {
//         ball.directionX = ball.speed + (Math.abs(ball.directionY) / 2);
//     } else {
//         ball.directionX = -ball.speed - (Math.abs(ball.directionY) / 2);
//     }
// }

// When we press the good key to move, function to update the place of the paddle who moved
function movePaddle() {
    if (player1.keyPress['w']) {
        player1.move(Direction.UP);
        player2.client.emit('movePaddle', {top: player1.coord.top, id: player1.id});
        for (let id in spectators) {
            spectators[id].emit('movePaddle', {top: player1.coord.top, id: player1.id});
        }
    }
    if (player1.keyPress['s']) {
        player1.move(Direction.DOWN);
        player2.client.emit('movePaddle', {top: player1.coord.top, id: player1.id});
        for (let id in spectators) {
            spectators[id].emit('movePaddle', {top: player1.coord.top, id: player1.id});
        }
    }
    if (player2.keyPress['ArrowUp']) {
        player2.move(Direction.UP);
        player1.client.emit('movePaddle', {top: player2.coord.top, id: player2.id});
        for (let id in spectators) {
            spectators[id].emit('movePaddle', {top: player2.coord.top, id: player2.id});
        }
    }
    if (player2.keyPress['ArrowDown']) {
        player2.move(Direction.DOWN);
        player1.client.emit('movePaddle', {top: player2.coord.top, id: player2.id});
        for (let id in spectators) {
            spectators[id].emit('movePaddle', {top: player2.coord.top, id: player2.id});
        }
    }
}

// This function is call all the time every 10ms, function to check if the ball hit something and do calculs if it's touch something
function moveBall() {
    // if the ball touch the left or right of the board
    if (ball.coord.left <= 0) {
        if (getPoint(player2, player1))
            return Do.END;
    }
    if (ball.coord.right >= 100) {
        if (getPoint(player1, player2))
            return Do.END;
    }

    // if the ball touch the left or right paddle
    if (ball.coord.left <= player1.coord.right
        && ball.coord.bottom >= player1.coord.top
        && ball.coord.top <= player1.coord.bottom
        && ball.coord.left >= player1.coord.left) {
        getNewDirection(player1);
    }
    if (ball.coord.right >= player2.coord.left
        && ball.coord.bottom >= player2.coord.top
        && ball.coord.top <= player2.coord.bottom
        && ball.coord.right <= player2.coord.right) {
        getNewDirection(player2);
    }

    // if the ball touch the top or bottom of the board
    if (ball.coord.top <= 0) {
        ball.directionY = -ball.directionY;
    }
    if (ball.coord.bottom >= 100) {
        ball.directionY = -ball.directionY;
    }

    // if the ball the top or bottom of the paddle
    if ((ball.coord.top == player1.coord.bottom
        || ball.coord.bottom == player1.coord.top)
        && ball.coord.left <= player1.coord.right
        && ball.coord.right >= player1.coord.left) {
        ball.directionY = -ball.directionY;
    }
    if ((ball.coord.bottom == player2.coord.top
        || ball.coord.top == player2.coord.bottom)
        && ball.coord.left <= player2.coord.right
        && ball.coord.right >= player2.coord.left) {
        ball.directionY = -ball.directionY;
    }

    ball.move();
}

// Function to check if the game started and if the players are still there
function moveAll() {
    if (gameState === 'notStarted') {
        return;
    }
    if (player1 === null || player2 === null) {
        return;
    }
    if (moveBall() === Do.END)
        return ;
    movePaddle();
    setTimeout(moveAll, 10);
}

// Fucntion to reset the place of the ball and players adn reset the score to 0
function resetGame() {
    console.log('reset');
    player1.score = 0;
    player2.score = 0;
    emitToEveryone('updateScore', {id: player1.id, score: player1.score});
    emitToEveryone('updateScore', {id: player2.id, score: player2.score});
    player1.resetPlace();
    player2.resetPlace();
    ball.resetPlace();
}

// When we press the key enter, function to start the game
function startGame() {
    if (gameState === 'notStarted') {
        gameState = 'started';
        resetGame();
        moveAll();
    }
}

// ---------------------------------------------------------------------
// ---------------------------- Socket Part ----------------------------
// ---------------------------------------------------------------------

io.on('connection', function(client) {

    console.log('Client connected...');

    // Sending notification to client to tell them who there are (player1, player2 or spectators)
    if (players[0] === null) {
        players[0] = player1;
        client.emit('nbrPlayer', 1);
    } else if (players[1] === null) {
        players[1] = player2;
        client.emit('nbrPlayer', 2);
    } else {
        nbrSpectators++;
        client.emit('nbrPlayer', nbrSpectators);
    }

    // Getting informations of player1 and player2 and spectators if there are, just after sending notification
    client.on('player_join', function(data) {
        if (data.id === 1) {
            console.log('Player ' + data.id + ' join');
            player1 = new Player(data.position, data.id, client, data.board);
        } else if (data.id === 2) {
            console.log('Player ' + data.id + ' join');
            player2 = new Player(data.position, data.id, client, data.board);
        } else {
            spectators[data.id] = client;
            console.log('Spectator ' + data.id + ' join');
        }
        if (!ball && player1 && player2) {
            ball = new Ball(data.ballPosition, player1, player2, data.board);
        }
    });

    // Getting notifications if someone press a key
    client.on('keyDown', function(data) {
        if (player1 && client === player1.client) {
            player1.keyPress[data] = true;
        } else if (player2 && client === player2.client) {
            player2.keyPress[data] = true;
        }
        if (data === 'Enter' && gameState === 'notStarted' && player1 && player2 && (client === player1.client || client === player2.client)) {
            emitToEveryone('startGame');
            startGame();
        }
    });
    // Getting notifications if someone release a key
    client.on('keyUp', function(data) {
        if (player1 && client === player1.client) {
            player1.keyPress[data] = false;
        } else if (player2 && client === player2.client) {
            player2.keyPress[data] = false;
        }
    });

    // Getting notifications if someone leave the game 
    client.on('disconnect', function() {
        if (player1 && client === player1.client) {
            console.log('Player 1 leave');
            if (gameState === 'started') {
                player1.client.emit('someoneLeave');
                player2.client.emit('someoneLeave');
                gameState = 'notStarted';
                resetGame();
            }
            players[0] = null;
            player1 = null;
        } else if (player2 && client === player2.client) {
            console.log('Player 2 leave');
            if (gameState === 'started') {
                player1.client.emit('someoneLeave');
                player2.client.emit('someoneLeave');
                gameState = 'notStarted';
                resetGame();
            }
            players[1] = null;
            player2 = null;
        } else {
            console.log('Spectator leave');
            nbrSpectators--;
            for (let id in spectators) {
                if (spectators[id] === client) {
                    delete spectators[id];
                }
            }
        }
    });
});


server.listen(3000, () => {
    console.log('Server is running on port 3000');
});
