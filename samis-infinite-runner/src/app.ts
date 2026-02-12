// This file is the entry point of the game. It initializes the game engine, sets up scenes, and starts the main game loop.

import { GameConfig } from './core/GameConfig';
import { BootScene } from './scenes/BootScene';
import { PlayScene } from './scenes/PlayScene';
import { TitleScene } from './scenes/TitleScene';

class Game {
    private config = new GameConfig();
    private canvas!: HTMLCanvasElement;
    private ctx!: CanvasRenderingContext2D;
    private currentScene!: PlayScene;
    private titleScene!: TitleScene;

    constructor() {
        this.setupCanvas();
        this.initialize();
    }

    private setupCanvas() {
        this.canvas = document.createElement('canvas');
        document.body.appendChild(this.canvas);
        // Initial size
        const { width, height } = GameConfig.getScreenDimensions();
        this.canvas.width = width;
        this.canvas.height = height;
        const ctx = this.canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas 2D context unavailable');
        this.ctx = ctx;
    }

    private async initialize() {
        const boot = new BootScene();
        const assets = await boot.loadAssets();
        // Create title scene first with assets
        this.titleScene = new TitleScene(this.canvas, this.ctx, assets);
        this.bindInputs();
        this.bindResize();
        this.startGameLoop(() => {
            // When title ready, switch to play scene once
            if (!this.currentScene && this.titleScene.ready) {
                this.currentScene = new PlayScene(this.canvas, this.ctx, assets);
                const { width, height } = GameConfig.getScreenDimensions();
                this.currentScene.onResize(width, height);
            }
        });
    }

    private bindInputs() {
        window.addEventListener('keydown', (e) => {
            if (!this.currentScene) {
                this.titleScene.handleKey(e.code);
            } else {
                if (e.code === 'Space' || e.code === 'ArrowUp') this.currentScene.handleJump();
            }
        });
        this.canvas.addEventListener('click', (e) => {
            if (!this.currentScene) {
                this.titleScene.handleClick();
            } else {
                this.currentScene.handleClick(e);
            }
        });
    }

    private bindResize() {
        const resize = () => {
            const { width, height } = GameConfig.getScreenDimensions();
            if (this.currentScene) {
                this.currentScene.onResize(width, height);
            }
        };
        window.addEventListener('resize', resize);
        window.addEventListener('orientationchange', resize);
    }

    private startGameLoop(onPreUpdate?: () => void) {
        let last = performance.now();
        const loop = (now: number) => {
            const dt = (now - last) / 1000; // seconds
            last = now;
            // Allow pre-update hook every frame (used to transition from title)
            if (onPreUpdate) onPreUpdate();
            if (!this.currentScene) {
                this.titleScene.update(dt);
                this.titleScene.render();
            } else {
                this.currentScene.update(dt);
                this.currentScene.render();
            }
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }
}

window.onload = () => { new Game(); };