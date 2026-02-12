export class GameConfig {
    static SCREEN_WIDTH = 960;
    static SCREEN_HEIGHT = 540;
    static GRAVITY = 1800; // pixels/s^2 for canvas physics
    static ITEM_SPAWN_RATE = 1200; // ms
    static TARGET_SCORE = 138;

    static getScreenDimensions() {
        return { width: this.SCREEN_WIDTH, height: this.SCREEN_HEIGHT };
    }
    static getGravity() { return this.GRAVITY; }
    static getItemSpawnRate() { return this.ITEM_SPAWN_RATE; }
    static getTargetScore() { return this.TARGET_SCORE; }
}