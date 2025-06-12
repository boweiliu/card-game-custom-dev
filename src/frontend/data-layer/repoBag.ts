import { DataRepo, DataRepoImpl } from './dataRepo';

// Example types for different data repositories
interface Card {
    id: string;
    name: string;
}

interface Game {
    id: string;
    title: string;
}

// RepoBag object
export const repoBag = {
    cards: new DataRepoImpl<Card>(),
    games: new DataRepoImpl<Game>(),
};

// Example usage
repoBag.cards.create({ id: 'card1', name: 'Ace of Spades' });
repoBag.games.create({ id: 'game1', title: 'Chess' });
