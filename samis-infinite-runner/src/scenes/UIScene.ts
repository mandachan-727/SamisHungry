export class UIScene {
    constructor() {
        this.score = 0;
        this.gameOver = false;
    }

    create() {
        this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#fff' });
        this.chestText = this.add.text(16, 100, 'Reach 138 points and click the chest!', { fontSize: '24px', fill: '#fff' });
    }

    update() {
        if (this.gameOver) {
            this.showGameOver();
        } else {
            this.scoreText.setText('Score: ' + this.score);
        }
    }

    updateScore(points) {
        this.score += points;
        if (this.score === 138) {
            this.showChest();
        }
    }

    showChest() {
        this.chestText.setText('Click the chest to end the game!');
        this.input.on('pointerdown', this.endGame, this);
    }

    endGame() {
        if (this.score === 138) {
            this.gameOver = true;
            this.chestText.setText('Game Over! You collected 138 points!');
        }
    }

    showGameOver() {
        // Logic to display game over screen
    }
}