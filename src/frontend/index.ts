interface Card {
    id: number;
    content: string;
    x_position: number;
    y_position: number;
}

class CardManager {
    private cards: Card[] = [];
    private $container: JQuery;

    constructor() {
        this.$container = $('#card-container');
        this.initialize();
    }

    private initialize() {
        this.loadCards();
        this.setupEventListeners();
    }

    private setupEventListeners() {
        $(document).on('click', '.card', (e) => {
            const $card = $(e.currentTarget);
            this.editCard($card);
        });

        $(document).on('click', '.delete-card', (e) => {
            const $card = $(e.currentTarget).closest('.card');
            this.deleteCard($card.data('id'));
        });

        $('#add-card').click(() => this.createCard());
    }

    private async loadCards() {
        try {
            const response = await $.ajax({
                url: '/api/cards',
                method: 'GET'
            });
            this.cards = response;
            this.renderCards();
        } catch (error) {
            console.error('Error loading cards:', error);
        }
    }

    private async createCard() {
        const content = prompt('Enter card content:');
        if (!content) return;

        try {
            const response = await $.ajax({
                url: '/api/cards',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({
                    content,
                    x_position: 100,
                    y_position: 100
                })
            });
            this.loadCards();
        } catch (error) {
            console.error('Error creating card:', error);
        }
    }

    private async editCard($card: JQuery) {
        const content = prompt('Edit card content:', $card.find('.card-content').text());
        if (!content) return;

        const id = $card.data('id');
        try {
            await $.ajax({
                url: `/api/cards/${id}`,
                method: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify({ content })
            });
            $card.find('.card-content').text(content);
        } catch (error) {
            console.error('Error editing card:', error);
        }
    }

    private async deleteCard(id: number) {
        if (!confirm('Are you sure you want to delete this card?')) return;

        try {
            await $.ajax({
                url: `/api/cards/${id}`,
                method: 'DELETE'
            });
            this.loadCards();
        } catch (error) {
            console.error('Error deleting card:', error);
        }
    }

    private renderCards() {
        this.$container.empty();
        this.cards.forEach(card => {
            const $card = $(`
                <div class="card" data-id="${card.id}">
                    <div class="card-content">${card.content}</div>
                    <button class="delete-card">Delete</button>
                </div>
            `);
            this.$container.append($card);
        });
    }
}

// Initialize when DOM is ready
$(document).ready(() => {
    new CardManager();
});
