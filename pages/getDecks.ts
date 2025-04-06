import * as fs from 'fs';
import * as path from 'path';

interface Deck {
    id: number;
    name: string;
    cards: string[];
}

export function getDecks(): Deck[] {
    const filePath = path.join(__dirname, 'decks.json');
    try {
        const data = fs.readFileSync(filePath, 'utf-8');
        const decks: Deck[] = JSON.parse(data);
        return decks;
    } catch (error) {
        console.error('Error reading or parsing the JSON file:', error);
        return [];
    }
}

