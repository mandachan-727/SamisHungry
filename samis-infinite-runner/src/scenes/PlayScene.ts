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

    constructor(private canvas: HTMLCanvasElement, private ctx: CanvasRenderingContext2D, private assets: Record<string, HTMLImageElement>) {
        // Restore original ground level
        this.groundY = GameConfig.getScreenDimensions().height - 80;
        this.sam = new SamCharacter(GameConfig.getGravity(), assets);
        this.sam.initialize(this.groundY);
        // Remove previous direct y tweaks; physics stays tied to groundY
    }

    start() {}

    handleJump() {
        if (!this.runningToChest && !this.ended) this.sam.jump();
    }

    handleClick(e: MouseEvent) {
        if (!this.chestVisible || this.ended) return;
        const rect = this.canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        const chestX = this.canvas.width - 140;
        const chestY = this.groundY - 96; // chest sits on ground
        const w = 96, h = 96;
        if (mx >= chestX && mx <= chestX + w && my >= chestY && my <= chestY + h) {
            this.ended = true;
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
            const chestX = this.canvas.width - 140;
            if (this.sam.x < chestX - 40) this.sam.x += 3; // slightly faster run to chest
        }
    }

    render() {
        // Background
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        const bg = this.assets.background;
        if (bg) this.ctx.drawImage(bg, 0, 0, this.canvas.width, this.canvas.height);
        // Ground line: make transparent by not drawing it

        // Items (visual lift)
        for (const it of this.items) {
            const img = this.getItemImage(it.type);
            if (img) this.ctx.drawImage(img, it.x, it.y + this.visualOffsetY, it.w, it.h);
        }
        // Chest — do NOT apply visualOffsetY so it sits exactly at groundY - chestH
        if (this.chestVisible) {
            const chestImg = this.assets.chest;
            const chestX = this.canvas.width - 140;
            const chestW = 96;
            const chestH = 96;
            const chestY = this.groundY - chestH - 40; // fixed: use chest height
            if (chestImg) this.ctx.drawImage(chestImg, chestX, chestY, chestW, chestH);
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '20px sans-serif';
            this.ctx.fillText('Click chest!', chestX - 10, chestY - 10);
        }
        // Sam (visual lift). We draw Sam higher, but physics stays the same.
        // Temporarily translate context to apply visual Y offset only to Sam.
        this.ctx.save();
        this.ctx.translate(0, this.visualOffsetY);
        this.sam.render(this.ctx);
        this.ctx.restore();
        // UI
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '24px sans-serif';
        this.ctx.fillText(`Score: ${this.score}`, 16, 32);
        if (this.ended) {
            this.ctx.fillStyle = 'rgba(0,0,0,0.6)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '32px sans-serif';
            this.ctx.fillText('Yay! Sam found the treasure!', 220, 240);
        }
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
            x: this.canvas.width + 20,
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
        const sb = this.sam.getBounds();
        for (let i = this.items.length - 1; i >= 0; i--) {
            const it = this.items[i];
            if (this.aabb(sb, it)) {
                if (it.points > 0) {
                    const feetY = sb.y + sb.h;
                    if (feetY <= it.y + 10 && this.sam.onGround === false && this.sam['vy'] > 0) {
                        this.sam['y'] = it.y - sb.h;
                        this.sam['vy'] = 0;
                        this.sam.onGround = true;
                    }
                    const newTotal = this.score + it.points;
                    if (newTotal >= GameConfig.getTargetScore()) {
                        // Consume item, clamp to target, and start chest sequence
                        this.score = GameConfig.getTargetScore();
                        this.items.splice(i, 1);
                        if (this.sam.state !== 'yay') this.sam.showEmote('yay');
                        this.triggerChestSequence();
                        continue;
                    } else {
                        this.score = newTotal;
                        if (this.sam.state !== 'yay') this.sam.showEmote('yay');
                    }
                } else {
                    const newScore = Math.max(0, this.score + it.points);
                    this.score = newScore;
                    if (this.sam.state !== 'ill') this.sam.showEmote('ill');
                }
                this.items.splice(i, 1);
            }
        }
    }

    private aabb(a: { x: number; y: number; w: number; h: number }, b: { x: number; y: number; w: number; h: number }) {
        return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
    }

    private triggerChestSequence() {
        // Do not blank the screen; just stop gameplay and show chest
        this.runningToChest = true;
        this.spawningEnabled = false;
        this.items = [];
        this.chestVisible = true;
    }
}