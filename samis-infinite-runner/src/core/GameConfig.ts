export class GameConfig {
    static BASE_WIDTH = 960;
    static BASE_HEIGHT = 540;
    static GRAVITY = 1800; // pixels/s^2 for canvas physics (base units)
    static ITEM_SPAWN_RATE = 1200; // ms
    static TARGET_SCORE = 138;

    static getScreenDimensions() {
        // Fullscreen canvas size
        const w = Math.max(this.BASE_WIDTH, window.innerWidth || this.BASE_WIDTH);
        const h = Math.max(this.BASE_HEIGHT, window.innerHeight || this.BASE_HEIGHT);
        return { width: w, height: h };
    }
    static getBaseDimensions() { return { width: this.BASE_WIDTH, height: this.BASE_HEIGHT }; }
    static getScale(canvasWidth: number, canvasHeight: number) {
        return Math.min(canvasWidth / this.BASE_WIDTH, canvasHeight / this.BASE_HEIGHT);
    }
    static getGravity() { return this.GRAVITY; }
    static getItemSpawnRate() { return this.ITEM_SPAWN_RATE; }
    static getTargetScore() { return this.TARGET_SCORE; }
}