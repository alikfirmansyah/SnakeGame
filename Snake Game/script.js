// Snake Game JavaScript
class SnakeGame {
    constructor() {
        // Game configuration
        this.boardSize = 20; // 20x20 grid
        this.gameSpeed = 150; // milliseconds between moves
        
        // Game state
        this.gameRunning = false;
        this.score = 0;
        this.highScore = localStorage.getItem('snakeHighScore') || 0;
        
        // Snake properties
        this.snake = [
            { x: 10, y: 10 } // Starting position (center of board)
        ];
        this.direction = { x: 0, y: 0 }; // Current direction
        this.nextDirection = { x: 0, y: 0 }; // Next direction (prevents reverse movement)
        
        // Food properties
        this.food = { x: 15, y: 15 }; // Starting food position
        
        // DOM elements
        this.gameBoard = document.getElementById('game-board');
        this.scoreElement = document.getElementById('score');
        this.highScoreElement = document.getElementById('high-score');
        this.startBtn = document.getElementById('start-btn');
        this.restartBtn = document.getElementById('restart-btn');
        this.gameOverScreen = document.getElementById('game-over');
        this.finalScoreElement = document.getElementById('final-score');
        this.playAgainBtn = document.getElementById('play-again-btn');
        
        // Game loop
        this.gameLoop = null;
        
        this.init();
    }
    
    // Initialize the game
    init() {
        this.updateHighScore();
        this.setupEventListeners();
        this.renderBoard();
        this.renderSnake();
        this.renderFood();
    }
    
    // Set up event listeners for controls
    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            this.handleKeyPress(e);
        });
        
        // Button controls
        this.startBtn.addEventListener('click', () => {
            this.startGame();
        });
        
        this.restartBtn.addEventListener('click', () => {
            this.restartGame();
        });
        
        this.playAgainBtn.addEventListener('click', () => {
            this.restartGame();
        });
    }
    
    // Handle keyboard input
    handleKeyPress(e) {
        if (!this.gameRunning && e.code === 'Space') {
            e.preventDefault();
            this.startGame();
            return;
        }
        
        if (!this.gameRunning) return;
        
        // Prevent reverse movement
        switch (e.code) {
            case 'ArrowUp':
            case 'KeyW':
                if (this.direction.y !== 1) {
                    this.nextDirection = { x: 0, y: -1 };
                }
                break;
            case 'ArrowDown':
            case 'KeyS':
                if (this.direction.y !== -1) {
                    this.nextDirection = { x: 0, y: 1 };
                }
                break;
            case 'ArrowLeft':
            case 'KeyA':
                if (this.direction.x !== 1) {
                    this.nextDirection = { x: -1, y: 0 };
                }
                break;
            case 'ArrowRight':
            case 'KeyD':
                if (this.direction.x !== -1) {
                    this.nextDirection = { x: 1, y: 0 };
                }
                break;
            case 'Space':
                e.preventDefault();
                this.pauseGame();
                break;
        }
    }
    
    // Start the game
    startGame() {
        if (this.gameRunning) return;
        
        this.gameRunning = true;
        this.direction = { x: 1, y: 0 }; // Start moving right
        this.nextDirection = { x: 1, y: 0 };
        
        this.startBtn.style.display = 'none';
        this.restartBtn.style.display = 'inline-block';
        this.gameOverScreen.style.display = 'none';
        
        this.gameLoop = setInterval(() => {
            this.update();
        }, this.gameSpeed);
    }
    
    // Pause the game
    pauseGame() {
        if (!this.gameRunning) return;
        
        this.gameRunning = false;
        clearInterval(this.gameLoop);
        
        this.startBtn.textContent = 'Resume';
        this.startBtn.style.display = 'inline-block';
    }
    
    // Restart the game
    restartGame() {
        this.gameRunning = false;
        clearInterval(this.gameLoop);
        
        // Reset game state
        this.score = 0;
        this.snake = [{ x: 10, y: 10 }];
        this.direction = { x: 0, y: 0 };
        this.nextDirection = { x: 0, y: 0 };
        this.generateFood();
        
        // Reset UI
        this.startBtn.textContent = 'Start Game';
        this.startBtn.style.display = 'inline-block';
        this.restartBtn.style.display = 'none';
        this.gameOverScreen.style.display = 'none';
        
        // Update display
        this.updateScore();
        this.renderSnake();
        this.renderFood();
    }
    
    // Main game update loop
    update() {
        this.direction = { ...this.nextDirection };
        
        // Move snake
        this.moveSnake();
        
        // Check collisions
        if (this.checkCollisions()) {
            this.gameOver();
            return;
        }
        
        // Check if food is eaten
        if (this.checkFoodCollision()) {
            this.eatFood();
        }
        
        // Render the game
        this.renderSnake();
        this.renderFood();
    }
    
    // Move the snake
    moveSnake() {
        const head = { ...this.snake[0] };
        head.x += this.direction.x;
        head.y += this.direction.y;
        
        this.snake.unshift(head);
        
        // Remove tail if no food was eaten
        if (!this.checkFoodCollision()) {
            this.snake.pop();
        }
    }
    
    // Check for collisions (walls or self)
    checkCollisions() {
        const head = this.snake[0];
        
        // Check wall collision
        if (head.x < 0 || head.x >= this.boardSize || 
            head.y < 0 || head.y >= this.boardSize) {
            return true;
        }
        
        // Check self collision
        for (let i = 1; i < this.snake.length; i++) {
            if (head.x === this.snake[i].x && head.y === this.snake[i].y) {
                return true;
            }
        }
        
        return false;
    }
    
    // Check if snake head collides with food
    checkFoodCollision() {
        const head = this.snake[0];
        return head.x === this.food.x && head.y === this.food.y;
    }
    
    // Handle eating food
    eatFood() {
        this.score += 10;
        this.updateScore();
        this.generateFood();
        
        // Increase game speed slightly
        if (this.gameSpeed > 80) {
            this.gameSpeed -= 2;
            clearInterval(this.gameLoop);
            this.gameLoop = setInterval(() => {
                this.update();
            }, this.gameSpeed);
        }
    }
    
    // Generate new food position
    generateFood() {
        let newFood;
        do {
            newFood = {
                x: Math.floor(Math.random() * this.boardSize),
                y: Math.floor(Math.random() * this.boardSize)
            };
        } while (this.isPositionOnSnake(newFood));
        
        this.food = newFood;
    }
    
    // Check if a position is occupied by the snake
    isPositionOnSnake(position) {
        return this.snake.some(segment => 
            segment.x === position.x && segment.y === position.y
        );
    }
    
    // Game over
    gameOver() {
        this.gameRunning = false;
        clearInterval(this.gameLoop);
        
        // Update high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('snakeHighScore', this.highScore);
            this.updateHighScore();
        }
        
        // Show game over screen
        this.finalScoreElement.textContent = this.score;
        this.gameOverScreen.style.display = 'block';
        
        // Hide other buttons
        this.startBtn.style.display = 'none';
        this.restartBtn.style.display = 'none';
    }
    
    // Update score display
    updateScore() {
        this.scoreElement.textContent = this.score;
    }
    
    // Update high score display
    updateHighScore() {
        this.highScoreElement.textContent = this.highScore;
    }
    
    // Render the game board
    renderBoard() {
        this.gameBoard.innerHTML = '';
        
        // Create grid cells
        for (let i = 0; i < this.boardSize * this.boardSize; i++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            this.gameBoard.appendChild(cell);
        }
    }
    
    // Render the snake
    renderSnake() {
        // Clear all snake segments
        document.querySelectorAll('.snake-segment, .snake-head').forEach(el => {
            el.classList.remove('snake-segment', 'snake-head');
        });
        
        // Render each snake segment
        this.snake.forEach((segment, index) => {
            const cellIndex = segment.y * this.boardSize + segment.x;
            const cell = this.gameBoard.children[cellIndex];
            
            if (index === 0) {
                cell.classList.add('snake-head');
            } else {
                cell.classList.add('snake-segment');
            }
        });
    }
    
    // Render the food
    renderFood() {
        // Clear food
        document.querySelectorAll('.food').forEach(el => {
            el.classList.remove('food');
        });
        
        // Render food
        const cellIndex = this.food.y * this.boardSize + this.food.x;
        const cell = this.gameBoard.children[cellIndex];
        cell.classList.add('food');
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new SnakeGame();
});
