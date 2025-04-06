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
        <header style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            backgroundColor: '#282c34',
            padding: '10px',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 1000
        }}>
            <div style={{ alignItems: 'left', display: 'flex' }}>
                <Image
                    src="/images/beaver_cropped.png"
                    height={50}
                    width={50}
                    alt="logo"
                />
                <h1 style={{
                    fontFamily: '"Quicksand", sans-serif',
                    fontSize: '2rem',
                    marginLeft: 10
                }}>Beaver Brilliance</h1>
            </div>
            <Link href="/login">
                <button onClick={handleLogout} style={{ width: 90 }}>
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
    return (
        <div
            style={{
                position: 'fixed',
                top: 75.7,
                left: 0,
                bottom: 64,
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

interface AddFlashcardProps {
    setFlashcards: React.Dispatch<React.SetStateAction<[string, string][]>>
}

const AddFlashcard: React.FC<AddFlashcardProps> = ({ setFlashcards }) => {
    const [frontText, setFrontText] = useState("");
    const [backText, setBackText] = useState("");
    const [isFormOpen, setIsFormOpen] = useState(false);

    const handleAdd = () => {
        if (frontText.trim() === "" && backText.trim() === "") return;
        setFlashcards(prev => [...prev, [frontText, backText]]);
        setFrontText("");
        setBackText("");
        setIsFormOpen(false);
    };

    return (
        <>
            {isFormOpen && (
                <div style={{
                    position: "fixed",
                    bottom: "80px",
                    right: "20px",
                    backgroundColor: "#282c34",
                    padding: "20px",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                    zIndex: 1100,
                }}>
                    <div>
                        <input
                            type="text"
                            placeholder="Front text"
                            value={frontText}
                            onChange={(e) => setFrontText(e.target.value)}
                            style={{ marginBottom: "10px", width: "100%" }}
                        />
                    </div>
                    <div>
                        <input
                            type="text"
                            placeholder="Back text"
                            value={backText}
                            onChange={(e) => setBackText(e.target.value)}
                            style={{ marginBottom: "10px", width: "100%" }}
                        />
                    </div>
                    <button onClick={handleAdd}>Add Flashcard</button>
                </div>
            )}
            <button
                onClick={() => setIsFormOpen(!isFormOpen)}
                style={{
                    position: "fixed",
                    bottom: 80,
                    right: "20px",
                    borderRadius: "50%",
                    width: "60px",
                    height: "60px",
                    backgroundColor: "#282c34",
                    color: "white",
                    fontSize: "2rem",
                    border: "none",
                    zIndex: 1100,
                }}
            >
                +
            </button>
        </>
    );
};

const App: React.FC = () => {
    const [flashcards, setFlashcards] = useState<[string, string][]>([]);
    return (
        <BrowserRouter>
            <Header />
            <Menu />
            <AddFlashcard setFlashcards={setFlashcards}/>
            <Footer />
        </BrowserRouter>
    );
};

export default App;