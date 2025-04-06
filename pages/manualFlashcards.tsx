import React from 'react';
import styles from './Flashcard.module.css';
import { useState } from 'react';
import Flashcard from '../static/components/Flashcard'
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import Link from 'next/link';

const BrowserRouter = dynamic(() => import('react-router-dom').then(mod => mod.BrowserRouter), { ssr: false });

const Header: React.FC = () => {


    const handleLogout = () => {
        console.log('User logged out');
    };


    return (
        <header style={{ backgroundColor: '#282c34', padding: '10px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1000 }}>
            <h1>Deck Manager</h1>

            <Link href="/login">
                <button onClick={handleLogout} style={{ backgroundColor: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
                    Logout
                </button>
            </Link>

        </header>
    );
};

const Footer: React.FC = () => {
    return (
        <footer id="footer" style={{ backgroundColor: '#282c34', padding: 20, color: 'white' }}>
            <p>&copy; 2025 BeaverHacks, Beaver Brilliance Team.</p>
        </footer>
    );
}


const Menu: React.FC = () => {
    const importGoogleDrive = () => {

    };
    const importJSON = () => {

    };
    const manualFlashcards = () => {

    };
    return (
        <div
            style={{
                position: 'fixed',
                top: 62,
                left: 0,
                bottom: 0,
                width: 200,
                backgroundColor: '#313640',
                padding: 20,
                color: 'white',
                zIndex: 10
            }}
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button>Import from Google Drive</button>
                <button>Import from JSON</button>
                <Link href="/manualFlashcards">
                <button>Manually create flashcards</button>
                </Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <h2>history of decks...</h2>
            </div>
        </div>
    );
}

const App: React.FC = () => {
    return (
        <BrowserRouter>
            <Header />
            <Menu/>
            <Footer />
        </BrowserRouter>
    );
};

export default App;