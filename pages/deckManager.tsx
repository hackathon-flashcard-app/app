import React from 'react';


const Header: React.FC = () => {
    return (
        <header style={{ backgroundColor: '#282c34', padding: '20px', color: 'white' }}>
            <h1>Deck Manager


                HELLLLLO
            </h1>
        </header>
    );
}


const DeckManager: React.FC = () => {
    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h1>Deck Manager</h1>
            <p>Welcome to the Deck Manager page. Use this page to manage your decks.</p>
            {/* Add your components or functionality here */}
        </div>
    );
};





export default DeckManager;