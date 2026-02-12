import { GameConfig } from '../core/GameConfig';

export class TitleScene {
    ready = false;
    constructor(private canvas: HTMLCanvasElement, private ctx: CanvasRenderingContext2D, private assets?: Record<string, HTMLImageElement>) {}

    handleClick() {
        // Click optional; keep for convenience
        this.ready = true;
    }

    handleKey(code: string) {
        if (code === 'Space' || code === 'Enter') this.ready = true;
    }

    update(dt: number) {
        // no-op
    }

    render() {
        const base = { width: GameConfig.BASE_WIDTH, height: GameConfig.BASE_HEIGHT };
        const scale = GameConfig.getScale(this.canvas.width, this.canvas.height);
        const offX = (this.canvas.width - base.width * scale) / 2;
        const offY = (this.canvas.height - base.height * scale) / 2;
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Stretch background to full canvas size
        const bg = this.assets?.background;
        if (bg) this.ctx.drawImage(bg, 0, 0, this.canvas.width, this.canvas.height);
        else { this.ctx.fillStyle = '#000'; this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height); }

        // Now render title elements in base units, centered with uniform scale
        this.ctx.translate(offX, offY);
        this.ctx.scale(scale, scale);

        // Draw Sam default sprite at same starting position as gameplay, with visual lift
        const sam = this.assets?.samDefault;
        if (sam) {
            const samW = 64, samH = 64;
            const groundY = base.height - 80;
            const samX = 120;
            const samY = groundY - samH;
            this.ctx.save();
            this.ctx.translate(0, -60); // same visual lift used in game
            this.ctx.drawImage(sam, samX, samY, samW, samH);
            this.ctx.restore();
        }

        // Title text centered using Bitova, with subtle shadow for contrast
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.font = '64px "Bitova", sans-serif';
        this.ctx.fillStyle = '#ffd54f'; // warm yellow for snowy background contrast
        this.ctx.shadowColor = 'rgba(0,0,0,0.6)';
        this.ctx.shadowBlur = 0;
        this.ctx.shadowOffsetX = 2;
        this.ctx.shadowOffsetY = 2;
        this.ctx.fillText('Eat, Sam!', base.width / 2, base.height / 2 - 120);
        this.ctx.font = '24px "Bitova", sans-serif';
        this.ctx.fillStyle = '#ffe082';
        this.ctx.fillText('Press Space or Enter to start', base.width / 2, base.height / 2 - 70);
        // Reset shadow
        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
    }
}