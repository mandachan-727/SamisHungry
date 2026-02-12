export type SamState = 'default' | 'run1' | 'run2' | 'jump' | 'ill' | 'yay';

export class SamCharacter {
    x = 120;
    y = 0;
    vx = 180; // auto-run speed px/s
    vy = 0;
    width = 64;
    height = 64;
    onGround = true;
    state: SamState = 'default';
    private runFrame = 0;
    private emoteTimer = 0;

    constructor(private gravity: number, private assets: Record<string, HTMLImageElement>) {}

    initialize(groundY: number) {
        this.y = groundY - this.height;
        this.onGround = true;
        this.state = 'run1';
    }

    update(dt: number, groundY: number) {
        // Auto-run moves background/items; Sam stays mostly fixed horizontally
        // Apply gravity
        this.vy += this.gravity * dt;
        this.y += this.vy * dt;
        if (this.y + this.height >= groundY) {
            this.y = groundY - this.height;
            this.vy = 0;
            this.onGround = true;
            // Return to run after landing from any non-run/jump state
            if (this.state === 'jump') {
                this.state = 'run1';
            } else if (this.state === 'yay' || this.state === 'ill') {
                this.state = 'run1';
            }
        } else {
            this.onGround = false;
        }
        // Run animation toggle
        if (this.onGround && (this.state === 'run1' || this.state === 'run2')) {
            this.runFrame += dt;
            if (this.runFrame > 0.15) {
                this.state = this.state === 'run1' ? 'run2' : 'run1';
                this.runFrame = 0;
            }
        }
        // Emote timeout
        if (this.emoteTimer > 0) {
            this.emoteTimer -= dt;
            if (this.emoteTimer <= 0 && this.onGround) this.state = 'run1';
        }
    }

    jump() {
        if (this.onGround) {
            this.vy = -700; // jump impulse
            this.state = 'jump';
            this.onGround = false;
        }
    }

    showEmote(type: 'ill' | 'yay') {
        this.state = type;
        // Shorten emote time to reduce linger for both 'yay' and 'ill'
        this.emoteTimer = 0.2;
    }

    getBounds() {
        return { x: this.x, y: this.y, w: this.width, h: this.height };
    }

    render(ctx: CanvasRenderingContext2D) {
        let img: HTMLImageElement | undefined;
        switch (this.state) {
            case 'run1': img = this.assets.samRun1; break;
            case 'run2': img = this.assets.samRun2; break;
            case 'jump': img = this.assets.samJump; break;
            case 'ill': img = this.assets.samIll; break;
            case 'yay': img = this.assets.samYay; break;
            default: img = this.assets.samDefault; break;
        }
        if (img) ctx.drawImage(img, this.x, this.y, this.width, this.height);
    }
}