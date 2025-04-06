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

// --- ANIMATION VARIANTS ---

const variants = {
    enter: (direction: number) => ({
        x: direction > 0 ? 300 : -300,
        opacity: 0,
    }),
    center: {
        x: 0,
        opacity: 1,
    },
    exit: (direction: number) => ({
        x: direction > 0 ? -300 : 300,
        opacity: 0,
    }),
};


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

    //        -------- DECKS ARE MAPS OF FLASHCARDS --------
    let currentDeck: [string, string][] = [];
    let currentDeckName = "deck1";
    let key = 1;

    const [frontText, setFrontText] = useState("");
    const [backText, setBackText] = useState("");
    const [isFormOpen, setIsFormOpen] = useState(false);

    const handleAdd = (): [string, string][] => {
        if (frontText.trim() === "" && backText.trim() === "") return [];
        setFlashcards(prev => [...prev, [frontText, backText]]);
        setFrontText("");
        setBackText("");
        setIsFormOpen(false);

        let currentCard: [string, string] = [frontText, backText];
        currentDeck.push(currentCard);
        return currentDeck;
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
                    //          -------- FLASHCARD FRONT FORM --------
                            type="text"
                            placeholder="Input front text"
                            value={frontText}
                            onChange={(e) => setFrontText(e.target.value)}
                            style={{ marginBottom: "10px", width: "100%" }}
                        />
                    </div>
                    <div>
                        <input
                        //          -------- FLASHCARD BACK FORM --------
                            type="text"
                            placeholder="Input back text"
                            value={backText}
                            onChange={(e) => setBackText(e.target.value)}
                            style={{ marginBottom: "10px", width: "100%" }}
                        />
                    </div>
                    <button onClick={() => setFlashcards(handleAdd())}
                    //             -------- ADD FLASHCARD BUTTON --------
                    style={{
                        backgroundColor: "#f47e1b",
                        color: "Black",
                        fontSize: "1rem",
                        padding: "10px 20px",
                    }}
                    >Add Flashcard</button>
                </div>
            )}
            <button
            //         -------- ADD FLASHCARD '+' FLOATING BUTTON --------
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




const DisplayAddedDeck: React.FC<{ deck: [string, string][] }> = ({ deck }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);
    const handleLeftClick = () => {
        setDirection(-1);
        setCurrentIndex((prevIndex) =>
            prevIndex === 0 ? deck.length - 1 : prevIndex - 1
        );
    };
    const handleRightClick = () => {
        setDirection(1);
        setCurrentIndex((prevIndex) =>
            prevIndex === deck.length - 1 ? 0 : prevIndex + 1
        );
    };
    const [front, back] = deck[currentIndex];

    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 125, marginLeft: 130 }}>
                <button onClick={handleLeftClick}>
                    <Image
                        src="/images/left-arrow.png"
                        height={80}
                        width={80}
                        alt="arrow"
                    />
                </button>
                {/* Container for the flashcard with a fixed size */}
                <div style={{ width: 900, height: 500, position: 'relative', fontSize: '20rem' }}>
                    <AnimatePresence initial={false} custom={direction}>
                        <motion.div
                            key={currentIndex}
                            custom={direction}
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{
                                x: { type: "spring", stiffness: 300, damping: 30 },
                                opacity: { duration: 0.2 }
                            }}
                            style={{ position: 'absolute', width: '100%' }}
                        >
                            <Flashcard front={front} back={back} />
                        </motion.div>
                    </AnimatePresence>
                </div>
                <button onClick={handleRightClick}>
                    <Image
                        src="/images/right-arrow.png"
                        height={80}
                        width={80}
                        alt="arrow"
                    />
                </button>
            </div>
        </div>
    );

};




const App: React.FC = () => {
    const [flashcards, setFlashcards] = useState<[string, string][]>([]);
    return (
        <BrowserRouter>
            <Header />
            <Menu />
            <AddFlashcard setFlashcards={setFlashcards} />
            {flashcards.length > 0 && <DisplayAddedDeck deck={flashcards} />}
            <Footer />
        </BrowserRouter>
    );
};

export default App;