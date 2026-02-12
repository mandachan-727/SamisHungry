// This file is the entry point of the game. It initializes the game engine, sets up scenes, and starts the main game loop.

import { GameConfig } from './core/GameConfig';
import { BootScene } from './scenes/BootScene';
import { PlayScene } from './scenes/PlayScene';

class Game {
    private config = new GameConfig();
    private canvas!: HTMLCanvasElement;
    private ctx!: CanvasRenderingContext2D;
    private currentScene!: PlayScene;

    constructor() {
        this.setupCanvas();
        this.initialize();
    }

    private setupCanvas() {
        this.canvas = document.createElement('canvas');
        const { width, height } = GameConfig.getScreenDimensions();
        this.canvas.width = width;
        this.canvas.height = height;
        document.body.appendChild(this.canvas);
        const ctx = this.canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas 2D context unavailable');
        this.ctx = ctx;
    }

    private async initialize() {
        const boot = new BootScene();
        const assets = await boot.loadAssets();
        this.currentScene = new PlayScene(this.canvas, this.ctx, assets);
        this.bindInputs();
        this.startGameLoop();
    }

    private bindInputs() {
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space' || e.code === 'ArrowUp') this.currentScene.handleJump();
        });
        this.canvas.addEventListener('click', (e) => this.currentScene.handleClick(e));
    }

    private startGameLoop() {
        let last = performance.now();
        const loop = (now: number) => {
            const dt = (now - last) / 1000; // seconds
            last = now;
            this.currentScene.update(dt);
            this.currentScene.render();
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }
}

window.onload = () => { new Game(); };