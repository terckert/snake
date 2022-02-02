// Keypress listener
const body = document.querySelector('body');

// Game colors
const emptyColor = 'black';
const snakeColor = 'green';
const fruitColor = 'red';

// Board dimensions
const colmax = 35;
const rowmax = 35;

// Game window
const board = document.querySelector('#board').getContext('2d');

// Modals
const isntructionsModal = document.querySelector('#first-load-modal');
const gameoverModal = document.querySelector('#gameover-modal');

// Game pieces
let boardState;                         // 2D array representing board state
let snake;                              // 1D array representing snake

// Snake heading
let heading;

// Cardinal direction constants
const NORTH = 'NORTH';
const SOUTH = 'SOUTH';
const EAST = 'EAST';
const WEST = 'WEST';

// Boardstate constants
const EMPTY = 'EMPTY';
const SNAKE = 'SNAKE';
const FRUIT = 'FRUIT';
const WALL = 'WALL';

// Update time variable
let TIME = 150;

// Game state value : boolean False : not GAMEOVER, true : GAMEOVER
let GAMEOVER;
let gameInterval;

// Sets the starting board values and draws the starting snake.
function boardSet() {
    // Set canvas background to black
    fillCanvas();
    
    // Create board state
    boardState = resetBoardState();
    snake = new Snake();
    snake.set();

    // Draw first fruit
    drawFruit();

    // Set initial keypress listener
    body.addEventListener('keyup', gameStart);
}

function gameStart(e) {

    // Set initial direction request
    setDirection(e);
    
    // Replace event listener
    body.removeEventListener('keyup', gameStart);
    body.addEventListener('keyup', setDirection);

    // Set gameover flag to false
    GAMEOVER = false;
    
    // Set the game into update loop
    gameInterval = setInterval(gameUpdate, TIME);
    
}

// Creates the snake. Snake is a 1D array. Head is the first item in array.
// The tail is the last array item. 
function Snake() {
    // Initial snake alignment. 
    // 0 = Horizontal 
    // 1 = Vertical
    this.body = this.snakeAlign((Math.floor(Math.random()*2)) ? 'HORIZONTAL' : 'VERTICAL');
    this.head;                          // Head of the snake
    this.neck;                          // Neck of the snake
    this.tail;                          // Tail of the snake
}

// (x,y) coordinates of the body of the snake
function Bodypart(x, y) {
    this.x = x;
    this.y = y;
    
}

// SNAKE FUNCTIONS

// Draws the snake. Snake can begin the game either horizontally or vertically. 
// Center point for snake is at (17,17). 
Snake.prototype.snakeAlign = function(alignment) {
    board.fillStyle = snakeColor;
    
    let snakeBody;
    // Begins facing to the east
    if (alignment === 'HORIZONTAL') {
        snakeBody = [
            new Bodypart(18, 17),
            new Bodypart(17, 17),
            new Bodypart(16, 17),
        ];
        heading = EAST;
        board.fillRect(16*10 + 1, 17*10 + 1, 28, 8);
    }
    // Otherwise it begin facing north
    else {
        snakeBody = [
            new Bodypart(17, 16),
            new Bodypart(17, 17),
            new Bodypart(17, 18),
        ];
        heading = NORTH;
        board.fillRect(17*10+1, 16*10+1, 8, 28);
    }
    
    
    // Update boardstate to reflect snake body
    snakeBody.forEach(bodypart => {
        let x = bodypart.x;
        let y = bodypart.y; 
        boardState[x][y] = 'SNAKE';
    });

    // Return the snakebody
    return snakeBody;
}

Snake.prototype.set = function() {
    this.head = this.body[0];
    this.neck = this.body[1];
    this.tail = this.body[this.body.length - 1];
}

// Creates a multi-dimensional array and sets it to empty. boardState corresponds
// to the current state of the board.
function resetBoardState() {       
    let arr = [];
    arr.length = rowmax;
    for (let x = 0; x < rowmax; x++) {
        arr[x] = [];
        arr[x].length = colmax
        for (let y = 0; y < colmax; y++){
            arr[x][y] = EMPTY;
        }
    }
    return arr; 
}

// Game frame update
function gameUpdate() {
    console.log(new Date());
    const newHead = newHeadCoordinates();
    let destVal = destinationValue(newHead);
    
    // Remove the tail if the spot is not a wall or fruit then get the new
    // destination value. New destination value is needed to prevent the snake
    // from dying to it's tail if it would otherwise move. We also don't cut
    // the tail if it eats a fruit
    if (destVal === SNAKE || destVal === EMPTY) {
        removeTail();
        destVal = destinationValue(newHead);
    }

    // If after the check above the value is wall or snake, the game is over
    if (destVal === WALL || destVal === SNAKE) {
        GAMEOVER = true;
    }

    // Draw a new piece of fruit if player successfully navigated to it.
    if (destVal === FRUIT) {
        drawFruit()
    }

    if (!GAMEOVER) {                    // Draw the new head
        moveSnake(newHead);
    }
    else                                // Stop update loop
    {
        clearInterval(gameInterval);
        gameoverModal.style.display = 'flex';
    }
}

// Creates and draws the new head of the snake.
function moveSnake(bodypart) {
    // removeTail();
    
    // Get old head (x,y) coordinates
    const newX = bodypart.x;
    const newY = bodypart.y;
    board.fillStyle = snakeColor;
    
    if (heading === NORTH) {
        board.fillRect(newX*10+1, newY*10+1, 8, 10);
    } else if (heading === EAST) {
        board.fillRect(newX*10-2, newY*10+1, 11, 8);
    } else if (heading === SOUTH) {
        board.fillRect(newX*10+1, newY*10-2, 8, 11);
    } else {
        board.fillRect(newX*10+1, newY*10+1, 11, 8);
    }

    snake.body.unshift(bodypart);
    boardState[newX][newY] = SNAKE;
    
    snake.set();
}


// Remove the snake tail
function removeTail() {
    // Clear the tail if game is not over
    boardState[snake.tail.x][snake.tail.y] = EMPTY;
    board.fillStyle = emptyColor;
    board.fillRect(snake.tail.x*10-1, snake.tail.y*10-1, 12, 12);
    snake.body.pop();
}

// Get coordinates for new head and return
function newHeadCoordinates() {
    let retVal = new Bodypart(snake.head.x, snake.head.y);
    if (heading === NORTH) {
        retVal.y--;
    } else if (heading === EAST) {
        retVal.x++;
    } else if (heading === SOUTH) {
        retVal.y++;
    } else {
        retVal.x--;
    }
    return retVal;
}

function setDirection(e) {
    key = e.key;                        // Get key string
    // Comparison of head and neck x and y values to determine if input should be ignored
    // due to the snake folding into itself.
    if (key === 'ArrowUp') {            
        if (snake.head.y - 1 !== snake.neck.y)
            heading = NORTH;
    }
    else if (key === 'ArrowRight') {    
        if (snake.head.x + 1 !== snake.neck.x)
            heading = EAST;
    }
    else if (key === 'ArrowDown') {     
        if (snake.head.y + 1 !== snake.neck.y)
            heading = SOUTH;
    }
    else {
        if (snake.head.x - 1 !== snake.neck.x)
            heading = WEST;
    }
    console.log(heading);
    //moveSnake();
}

// Fill canvas with black background.
function fillCanvas() {
    board.fillStyle = emptyColor;
    board.fillRect(0, 0, 350, 350);
}

// Get's the boardstate value of a pair of coordinates
function destinationValue(coord) {

    // Check if value is within bounds
    if (
        coord.x < 0 || coord.x > rowmax - 1 ||
        coord.y < 0 || coord.y > colmax - 1
    ) {
        return WALL;
    }

    return boardState[coord.x][coord.y];    
}

// Draw fruit at random spot on board
function drawFruit() {
    let potentialSpot;
    while (true)
    {
        potentialSpot = new Bodypart(
            Math.floor(Math.random()*rowmax),
            Math.floor(Math.random()*colmax)
        )
        if (destinationValue(potentialSpot) === EMPTY) break;
    }
    // Set the board grid to value
    boardState[potentialSpot.x][potentialSpot.y] = FRUIT;
    // Set draw the fruit
    board.fillStyle = fruitColor;
    board.fillRect(potentialSpot.x*10+1, potentialSpot.y*10+1, 8, 8);
}

// Fade out effect for modals. Each button that calls this function has a 
// parent container, followed by the modal container. Get ID and apply fade
// out animation. Then set display to none to remove the element in total.
function fadeOut(e) {
    // Get ancestor ID
    const ancestor = e.parentNode.parentNode.id;
    // Select main modal
    const modal = document.querySelector(`#${ancestor}`);
    console.table(ancestor);            // Logs the ancestor
    console.table(modal);               // Logs the modal
    
    modal.classList.add('fade-out');    // Fade out animation
    // Call delayed function to remove modal view.
    setTimeout(()=> {
        modal.classList.remove('fade-out');
        modal.style.display = 'none';
    }, 680);
}