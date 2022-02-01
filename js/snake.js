// Keypress listener
document.querySelector('body').addEventListener('keyup', (e) => {
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
});

// Game colors
const emptyColor = 'black';
const snakeColor = 'green';
const fruitColor = 'red';

// Board dimensions
const colmax = 35;
const rowmax = 35;

// Game window
const board = document.querySelector('#board').getContext('2d');

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

// Update time variable
let TIME = 250;

// Time delay function, parameter is in milliseconds
function setDelay(msDelay)
{
    setTimeout(function(){
        console.log(new Date());
    },
    msDelay);
}

function gameStart() {
    // Fill canvas with black background.
    board.fillStyle = emptyColor;
    board.fillRect(0, 0, 350, 350);

    // Create board state
    boardState = resetBoardState();
    snake = new Snake();
    snake.set();

    gamePlaying = false;
    setInterval(moveSnake, TIME)
    

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

// Creates and draws the new head of the snake.
function moveSnake() {
    removeTail();
    
    // Get old head (x,y) coordinates
    let newX = snake.head.x;
    let newY = snake.head.y;
    board.fillStyle = snakeColor;
    
    if (heading === NORTH) {
        newY--;
        board.fillRect(newX*10+1, newY*10+1, 8, 10);

    } else if (heading === EAST) {
        newX++;
        board.fillRect(newX*10-2, newY*10+1, 11, 8);

    } else if (heading === SOUTH) {
        newY++;
        board.fillRect(newX*10+1, newY*10-2, 8, 11);

    } else {
        newX--;
        board.fillRect(newX*10+1, newY*10+1, 11, 8);
    }

    snake.body.unshift(new Bodypart(newX, newY));
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