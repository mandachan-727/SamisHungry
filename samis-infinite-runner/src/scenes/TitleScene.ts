import { GameConfig } from '../core/GameConfig';

export class TitleScene {
    ready = false;
    constructor(private canvas: HTMLCanvasElement, private ctx: CanvasRenderingContext2D, private assets?: Record<string, HTMLImageElement>) {}

    private drawOutlinedText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, font: string, fillColor: string, outlineColor = '#000', outlineSize = 2) {
        ctx.save();
        ctx.font = font;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        // Outline (draw slightly larger/behind)
        ctx.fillStyle = outlineColor;
        ctx.translate(0, 0);
        ctx.shadowColor = 'transparent';
        // Simulate thickness by drawing multiple offsets
        ctx.fillText(text, x + outlineSize, y);
        ctx.fillText(text, x - outlineSize, y);
        ctx.fillText(text, x, y + outlineSize);
        ctx.fillText(text, x, y - outlineSize);
        // Fill main text on top
        ctx.fillStyle = fillColor;
        ctx.fillText(text, x, y);
        ctx.restore();
    }

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

        // Title text centered using Bitova
        const titleX = base.width / 2;
        const titleY = base.height / 2 - 120;
        this.drawOutlinedText(this.ctx, 'Eat, Sam!', titleX, titleY, '64px "Bitova", sans-serif', '#ffd54f');
        // Subtitle
        const subY = base.height / 2 - 70;
        this.drawOutlinedText(this.ctx, 'Press Space or Enter to start', titleX, subY, '24px "Bitova", sans-serif', '#ffe082');
    }
}