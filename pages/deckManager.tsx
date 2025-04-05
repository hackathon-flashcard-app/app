import React from 'react';
<<<<<<< Updated upstream
import { Link } from 'react-router-dom';
import dynamic from 'next/dynamic';
import Head from 'next/head';

const BrowserRouter = dynamic(() => import('react-router-dom').then(mod => mod.BrowserRouter), { ssr: false });

const Header: React.FC = () => {


    const handleLogout = () => {
        console.log('User logged out');
        // Add your logout logic here
    };

=======
import styles from './Flashcard.module.css';
import { useState } from 'react';
import Flashcard from '../static/components/Flashcard'
import Image from 'next/image';

{/*make it to load array from JSON*/}
var testTuple: [string, string][];
testTuple = [["Hey", "Steve"], ["Second", "Bill"], ["Third", "Jeff"]];

{/*deck name will be a name property from JSON file*/}

function handleClick() {
    console.log("increment like count")
  }
>>>>>>> Stashed changes

    return (
<<<<<<< Updated upstream
        <header style={{ backgroundColor: '#282c34', padding: '20px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1>Deck Manager</h1>

            <Link to="/login.tsx">
                <button onClick={handleLogout} style={{ backgroundColor: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
                    Logout
                </button>
            </Link>

        </header>
=======
        <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h1>Deck Manager</h1>
            <p>Welcome to the Deck Manager page. Use this page to manage your decks.</p>
            <h1>Deck Name</h1>
            <button onClick={handleClick}>
            <Image
                src="/images/left-arrow.png"
                height={80}
                width={80}
                alt="arrow"
            />
            </button>
            {testTuple.map(([front, back], index) => (
                <Flashcard key={index} front={front} back={back} />
            ))}
            <button onClick={handleClick}>
            <Image
                src="/images/right-arrow.png"
                height={80}
                width={80}
                alt="arrow"
            />
            </button>
        </div>
>>>>>>> Stashed changes
    );
};

const Footer: React.FC = () => {
    return (
        <footer style={{ backgroundColor: '#282c34', padding: '20px', color: 'white' }}>
            <p>&copy; 2025 BeaverHacks, Beaver Brilliance Team.</p>
        </footer>
    );
}


const DeckList: React.FC = () => {
    return (
        <div>
            <h2>DECK LIST GOES HERE</h2>
        </div>
    );
}

const DeckManager: React.FC = () => {
    return (
        
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>    
            <h1>Deck Manager</h1>
            <p>Welcome to the Deck Manager page. Use this page to manage your decks.</p>
            <DeckList />
        </div>

    );
};


const App: React.FC = () => {
    return (
        <BrowserRouter>
            <Header />
            <DeckManager />
            <Footer />
        </BrowserRouter>
    );
};

export default App;