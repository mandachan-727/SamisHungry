export class BootScene {
    private assets: Record<string, HTMLImageElement> = {};
    private assetList: Record<string, string> = {
        // Use Vite's public folder. These paths are absolute from the server root.
        background: '/assets/background.png',
        chest: '/assets/chest.png',
        mushroom: '/assets/mushroom.png',
        croissant: '/assets/croissant.png',
        lemonBar: '/assets/lemon-bar.png',
        pig: '/assets/pig.png',
        milk: '/assets/milk.png',
        samDefault: '/assets/sam-default.png',
        samRun1: '/assets/sam-run-1.png',
        samRun2: '/assets/sam-run-2.png',
        samJump: '/assets/sam-jump.png',
        samIll: '/assets/sam-ill.png',
        samYay: '/assets/sam-yay.png',
        // New assets for end sequence
        minhYay: '/assets/minh-yay.png',
        weKiss: '/assets/we-kiss.png'
    };

    async loadAssets(): Promise<Record<string, HTMLImageElement>> {
        const tasks: Promise<void>[] = [];
        for (const key in this.assetList) {
            const src: string = this.assetList[key];
            tasks.push(new Promise<void>((resolve, reject) => {
                const img = new Image();
                img.onload = () => { this.assets[key] = img; resolve(); };
                img.onerror = (e) => reject(e);
                img.src = src;
            }));
        }
        await Promise.all(tasks);
        return this.assets;
    }
}