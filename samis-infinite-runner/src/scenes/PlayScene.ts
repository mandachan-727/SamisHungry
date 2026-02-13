import { GameConfig } from '../core/GameConfig';
import { SamCharacter } from '../core/SamCharacter';

type ItemType = 'mushroom' | 'croissant' | 'lemonBar' | 'pig' | 'milk';
interface Item {
    type: ItemType;
    x: number;
    y: number;
    w: number;
    h: number;
    vx: number;
    points: number; // positive for good items, negative for bad
}

export class PlayScene {
    private sam: SamCharacter;
    private score = 0;
    private items: Item[] = [];
    private spawnTimer = 0;
    private groundY: number;
    private runningToChest = false;
    private chestVisible = false;
    private ended = false;
    private spawningEnabled = true;
    private visualOffsetY = -60; // lift visuals by 30px without changing physics
    private kissVisible = false; // show we-kiss after clicking Amanda
    // Amanda/kiss sizing and baseline
    private amandaW = 70;
    private amandaH = 50;
    private kissW = 96;
    private kissH = 60;
    private amandaBaselineOffset = -35; // adjust if needed

    constructor(private canvas: HTMLCanvasElement, private ctx: CanvasRenderingContext2D, private assets: Record<string, HTMLImageElement>) {
        // Ground based on base resolution
        this.groundY = GameConfig.getBaseDimensions().height - 80;
        this.sam = new SamCharacter(GameConfig.getGravity(), assets);
        this.sam.initialize(this.groundY);
    }

    start() {}

    handleJump() {
        if (!this.runningToChest && !this.ended) this.sam.jump();
    }

    // Compute Amanda rect in base units; includeVisual applies the same visual Y lift used in rendering
    private getAmandaRect(includeVisual = false) {
        const base = GameConfig.getBaseDimensions();
        const x = base.width - 140;
        const yBase = this.groundY - this.amandaH - 40 - this.amandaBaselineOffset;
        const y = includeVisual ? yBase + this.visualOffsetY : yBase;
        return { x, y, w: this.amandaW, h: this.amandaH };
    }

    // Compute kiss rect bottom-aligned to Amanda
    private getKissRect(includeVisual = false) {
        const amanda = this.getAmandaRect(false);
        const bottom = amanda.y + amanda.h;
        const x = amanda.x - (this.kissW - this.amandaW) / 2;
        const yBase = bottom - this.kissH;
        const y = includeVisual ? yBase + this.visualOffsetY : yBase;
        return { x, y, w: this.kissW, h: this.kissH };
    }

    handleClick(e: MouseEvent) {
        if (!this.chestVisible || this.ended) return;
        const rect = this.canvas.getBoundingClientRect();
        const base = GameConfig.getBaseDimensions();
        const scale = GameConfig.getScale(this.canvas.width, this.canvas.height);
        const offX = (this.canvas.width - base.width * scale) / 2;
        const offY = (this.canvas.height - base.height * scale) / 2;
        const mx = (e.clientX - rect.left - offX) / scale;
        const my = (e.clientY - rect.top - offY) / scale;
        // Use the same visual-lift-adjusted rect for click hitbox
        const a = this.getAmandaRect(true);
        if (mx >= a.x && mx <= a.x + a.w && my >= a.y && my <= a.y + a.h) {
            this.kissVisible = true;
            this.ended = true; // stop updates
        }
    }

    update(dt: number) {
        if (this.ended) return;
        this.sam.update(dt, this.groundY);
        if (!this.runningToChest) {
            if (this.spawningEnabled) {
                this.spawnTimer += dt * 1000;
                if (this.spawnTimer >= GameConfig.getItemSpawnRate()) {
                    this.spawnTimer = 0;
                    this.spawnItem();
                }
            }
            this.updateItems(dt);
            this.checkCollisions();
            // Be lenient: trigger chest when score >= target
            if (this.score >= GameConfig.getTargetScore()) {
                this.score = GameConfig.getTargetScore();
                this.triggerChestSequence();
            }
        } else {
            const chestX = GameConfig.getBaseDimensions().width - 140;
            if (this.sam.x < chestX - 40) this.sam.x += 3; // slightly faster run to chest
        }
    }

    render() {
        const base = GameConfig.getBaseDimensions();
        const scale = GameConfig.getScale(this.canvas.width, this.canvas.height);
        const offX = (this.canvas.width - base.width * scale) / 2;
        const offY = (this.canvas.height - base.height * scale) / 2;

        // Clear and reset
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Stretch background to full canvas size (fills horizontally)
        const bg = this.assets.background;
        if (bg) {
            this.ctx.drawImage(bg, 0, 0, this.canvas.width, this.canvas.height);
        }

        // Now render game in base units, centered with uniform scale
        this.ctx.translate(offX, offY);
        this.ctx.scale(scale, scale);

        // Items (visual lift in base units)
        for (const it of this.items) {
            const img = this.getItemImage(it.type);
            if (img) this.ctx.drawImage(img, it.x, it.y + this.visualOffsetY, it.w, it.h);
        }
        // Amanda/kiss (end sequence) in base units
        if (this.chestVisible) {
            if (!this.kissVisible) {
                const a = this.getAmandaRect(false);
                // Draw Amanda with same visual Y lift as Sam/items
                this.ctx.save();
                this.ctx.translate(0, this.visualOffsetY);
                const amandaImg = this.assets.minhYay;
                if (amandaImg) this.ctx.drawImage(amandaImg, a.x, a.y, a.w, a.h);
                // Prompt above Amanda
                this.ctx.fillStyle = '#ffe082';
                this.ctx.font = '14px "Bitova", sans-serif';
                const promptX = a.x - 4;
                const promptY = a.y - 28;
                this.ctx.fillText('Click on', promptX, promptY);
                this.ctx.fillText('Amanda', promptX, promptY + 14);
                this.ctx.restore();
            } else {
                const k = this.getKissRect(false);
                this.ctx.save();
                this.ctx.translate(0, this.visualOffsetY);
                const kissImg = this.assets.weKiss;
                if (kissImg) this.ctx.drawImage(kissImg, k.x, k.y, k.w, k.h);
                this.ctx.restore();
            }
        }
        // Sam (visual lift) — hide Sam once kiss appears
        this.ctx.save();
        this.ctx.translate(0, this.visualOffsetY);
        if (!this.kissVisible) this.sam.render(this.ctx);
        this.ctx.restore();
        // UI in base units
        this.ctx.fillStyle = '#ffe082';
        this.ctx.font = '24px "Bitova", sans-serif';
        this.ctx.fillText(`Score: ${this.score}`, 16, 32);

        // If ended, optional overlay (suppress when kiss is shown)
        if (this.ended && !this.kissVisible) {
            // Reset transform to draw overlay to full window size
            this.ctx.setTransform(1, 0, 0, 1, 0, 0);
            this.ctx.fillStyle = 'rgba(0,0,0,0.6)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = '#ffd54f';
            this.ctx.font = '32px "Bitova", sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('Yay! Sam found the treasure!', this.canvas.width / 2, this.canvas.height / 2);
        }
    }

    onResize(width: number, height: number) {
        this.canvas.width = width;
        this.canvas.height = height;
        // Ground remains in base units; keep Sam on ground
        const sb = this.sam.getBounds();
        this.sam['y'] = this.groundY - sb.h;
        this.sam['vy'] = 0;
        this.sam.onGround = true;
    }

    private getItemImage(type: ItemType) {
        switch (type) {
            case 'mushroom': return this.assets.mushroom;
            case 'croissant': return this.assets.croissant;
            case 'lemonBar': return this.assets.lemonBar;
            case 'pig': return this.assets.pig;
            case 'milk': return this.assets.milk;
        }
    }

    private spawnItem() {
        const remaining = GameConfig.getTargetScore() - this.score;
        const types: Array<{ type: ItemType; points: number }> = [
            { type: 'mushroom', points: 6 },
            { type: 'croissant', points: 12 },
            { type: 'lemonBar', points: 18 },
            { type: 'pig', points: 36 },
            { type: 'milk', points: -12 },
        ];
        const candidates = types.filter(t => t.points <= remaining || t.points < 0);
        const t = candidates[Math.floor(Math.random() * candidates.length)];
        const h = 56;
        const w = 56;
        // Spawn band raised by ~30px compared to previous values
        const yMin = this.groundY - 190; // was -160
        const yMax = this.groundY - h -40; // was groundY - h
        const y = Math.random() * (yMax - yMin) + yMin;
        const item: Item = {
            type: t.type,
            points: t.points,
            x: GameConfig.getBaseDimensions().width + 20,
            y,
            w,
            h,
            vx: -220
        };
        this.items.push(item);
    }

    private updateItems(dt: number) {
        for (const it of this.items) it.x += it.vx * dt;
        this.items = this.items.filter(it => it.x + it.w > -50);
    }

    private checkCollisions() {
        // If already transitioning to chest or ended, ignore collisions
        if (this.runningToChest || this.ended) return;
        const sb = this.sam.getBounds();
        const target = GameConfig.getTargetScore();
        for (let i = this.items.length - 1; i >= 0; i--) {
            const it = this.items[i];
            if (this.aabb(sb, it)) {
                if (it.points > 0) {
                    // Platforming assist
                    const feetY = sb.y + sb.h;
                    if (feetY <= it.y + 10 && this.sam.onGround === false && this.sam['vy'] > 0) {
                        this.sam['y'] = it.y - sb.h;
                        this.sam['vy'] = 0;
                        this.sam.onGround = true;
                    }
                    // Clamp addition to remaining points and consume item
                    const remaining = Math.max(0, target - this.score);
                    const add = Math.min(remaining, it.points);
                    this.score += add;
                    this.sam.showEmote('yay');
                    this.items.splice(i, 1);
                    if (this.score >= target) {
                        // Ensure exact target and start chest sequence; stop processing further items this frame
                        this.score = target;
                        this.triggerChestSequence();
                        break;
                    }
                } else {
                    // Negative items still reduce score but never below 0
                    this.score = Math.max(0, this.score + it.points);
                    this.sam.showEmote('ill');
                    this.items.splice(i, 1);
                }
            }
        }
    }

    private aabb(a: { x: number; y: number; w: number; h: number }, b: { x: number; y: number; w: number; h: number }) {
        return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + b.h > b.y;
    }

    private triggerChestSequence() {
        // Do not blank the screen; just stop gameplay and show Amanda
        this.runningToChest = true;
        this.spawningEnabled = false;
        this.items = [];
        this.chestVisible = true; // repurposed to mean Amanda visible
    }
}