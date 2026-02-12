export interface Item {
    id: number;
    type: 'positive' | 'negative';
    position: { x: number; y: number };
    width: number;
    height: number;
}

export interface SamCharacter {
    position: { x: number; y: number };
    width: number;
    height: number;
    score: number;
    jump(): void;
    run(): void;
    collideWith(item: Item): void;
}