import fs from 'fs';
import path from 'path';

interface Deck {
    id: number;
    name: string;
    cards: string[];
}

export function getDecks(jsonFilePath: string): Deck[] {
    try {
        const absolutePath = path.resolve(jsonFilePath);
        const data = fs.readFileSync(absolutePath, 'utf-8');
        const decks: Deck[] = JSON.parse(data);
        return decks;
    } catch (error) {
        console.error('Error reading or parsing the JSON file:', error);
        return [];
    }
}