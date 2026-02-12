class ItemSpawner {
    private positiveItems: string[] = ['apple', 'banana', 'coin'];
    private negativeItems: string[] = ['rock', 'thorn', 'spike'];
    private spawnRate: number = 1000; // milliseconds

    constructor(private gameWidth: number, private gameHeight: number) {
        this.startSpawning();
    }

    private startSpawning() {
        setInterval(() => {
            this.spawnItem();
        }, this.spawnRate);
    }

    private spawnItem() {
        const itemType = Math.random() < 0.5 ? this.getRandomPositiveItem() : this.getRandomNegativeItem();
        const xPosition = this.gameWidth;
        const yPosition = Math.random() * (this.gameHeight - 50); // Adjust for item height

        this.createItem(itemType, xPosition, yPosition);
    }

    private getRandomPositiveItem(): string {
        return this.positiveItems[Math.floor(Math.random() * this.positiveItems.length)];
    }

    private getRandomNegativeItem(): string {
        return this.negativeItems[Math.floor(Math.random() * this.negativeItems.length)];
    }

    private createItem(itemType: string, x: number, y: number) {
        // Logic to create and display the item on the screen
        console.log(`Spawned ${itemType} at (${x}, ${y})`);
    }
}