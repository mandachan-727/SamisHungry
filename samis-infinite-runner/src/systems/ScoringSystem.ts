export class ScoringSystem {
    private score: number;
    private readonly targetScore: number;
    private readonly onChestClick: () => void;

    constructor(onChestClick: () => void) {
        this.score = 0;
        this.targetScore = 138;
        this.onChestClick = onChestClick;
    }

    public addScore(points: number): void {
        this.score += points;
        this.checkScore();
    }

    private checkScore(): void {
        if (this.score === this.targetScore) {
            this.triggerChest();
        }
    }

    private triggerChest(): void {
        // Logic to display the chest and wait for click
        console.log("Chest is available! Click to end the game.");
        this.onChestClick();
    }

    public getScore(): number {
        return this.score;
    }
}