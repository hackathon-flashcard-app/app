import React from 'react';
import styles from './Flashcard.module.css';
import { useState, useEffect } from 'react';
import Flashcard from '../static/components/Flashcard'
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { getStorageType, saveToFile, saveToDrive, getFromDrive } from '@/utils/storage';


var testTuple: [string, string][];
testTuple = [["Hey", "Steve"], ["Second", "Bill"], ["Third", "Jeff"]];

export type FlashcardType = [string, string];

interface MenuProps {
    setFlashcards: React.Dispatch<React.SetStateAction<FlashcardType[]>>;
    flashcards: FlashcardType[];
}

interface DeckManagerProps {
    flashcards: FlashcardType[];
}


const BrowserRouter = dynamic(() => import('react-router-dom').then(mod => mod.BrowserRouter), { ssr: false });

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

const DeckManager: React.FC<DeckManagerProps> = ({ flashcards }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);
    
    // Ensure we have a valid array of flashcards, even if empty or undefined
    const deck: FlashcardType[] = Array.isArray(flashcards) && flashcards.length > 0 
        ? flashcards 
        : testTuple;
    
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

    // Ensure we have a valid index
    const safeIndex = currentIndex >= 0 && currentIndex < deck.length ? currentIndex : 0;
    // Get current flashcard data
    const [front, back] = deck[safeIndex];

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


const Header: React.FC = () => {
    const { data: session, status } = useSession();
    const handleLogout = () => {
        // Actual logout is handled by next-auth link
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
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {status === 'authenticated' && session?.user && (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span style={{ marginRight: '10px', fontSize: '0.9rem' }}>
                            {session.user.name || 'User'}
                        </span>
                        {session.user.image && (
                            <Image
                                src={session.user.image}
                                height={30}
                                width={30}
                                alt="User"
                                style={{ borderRadius: '50%' }}
                            />
                        )}
                    </div>
                )}
                <Link href="/">
                    <button onClick={handleLogout} style={{ 
                        width: 90,
                        backgroundColor: '#f57f1c',
                        border: 'none',
                        color: 'black',
                        padding: '8px 16px',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}>
                        Logout
                    </button>
                </Link>
            </div>
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


const Menu: React.FC<MenuProps> = (props) => {
    const { setFlashcards, flashcards } = props;
    const { data: session } = useSession();
    const [loading, setLoading] = useState<Record<string, boolean>>({
        googleDrive: false,
        json: false,
        pdf: false,
        manual: false
    });
    const [fileName, setFileName] = useState<string>('flashcards');
    const [message, setMessage] = useState<string>('');
    const [isManualFormOpen, setIsManualFormOpen] = useState(false);
    const [frontText, setFrontText] = useState("");
    const [backText, setBackText] = useState("");
    
    // Handle saving current flashcards
    const saveCurrentDeck = () => {
        try {
            // Get the current flashcards state via props, ensuring we have valid data
            const currentFlashcards = Array.isArray(flashcards) && flashcards.length > 0 
                ? [...flashcards] // Create a copy to avoid mutation issues
                : testTuple;
            
            const flashcardsToSave = JSON.stringify(currentFlashcards);
            
            // Save to localStorage for retrieval later
            localStorage.setItem('currentFlashcards', flashcardsToSave);
            
            // Determine the storage type and save accordingly
            const storageType = getStorageType();
            
            if (storageType === 'google' && session?.accessToken) {
                // Save to Google Drive
                saveToDrive(`${fileName}.json`, currentFlashcards, session.accessToken as string)
                    .then(success => {
                        if (success) {
                            setMessage('Saved to Google Drive successfully');
                        } else {
                            setMessage('Failed to save to Google Drive');
                        }
                    });
            } else {
                // Save to local file
                saveToFile(flashcardsToSave, fileName);
                setMessage('Flashcards downloaded successfully');
            }
        } catch (error) {
            console.error('Error saving flashcards:', error);
            setMessage('Error saving flashcards');
        }
        
        // Clear message after 3 seconds
        setTimeout(() => setMessage(''), 3000);
    };
    
    // Import from Google Drive
    const importGoogleDrive = async () => {
        if (!session?.accessToken) {
            setMessage('Please sign in with Google to access Google Drive');
            setTimeout(() => setMessage(''), 3000);
            return;
        }
        
        setLoading(prev => ({ ...prev, googleDrive: true }));
        
        try {
            const data = await getFromDrive(`${fileName}.json`, session.accessToken as string);
            
            if (data) {
                setFlashcards(data);
                setMessage('Flashcards loaded from Google Drive');
            } else {
                setMessage('No flashcards found in Google Drive');
            }
        } catch (error) {
            console.error('Error importing from Google Drive:', error);
            setMessage('Error loading from Google Drive');
        }
        
        setLoading(prev => ({ ...prev, googleDrive: false }));
        setTimeout(() => setMessage(''), 3000);
    };
    
    // Import from local JSON file
    const importJSON = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e: Event) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;
            
            setLoading(prev => ({ ...prev, json: true }));
            
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const content = event.target?.result as string;
                    const data = JSON.parse(content);
                    
                    // Validate the data structure
                    if (Array.isArray(data) && data.every(item => 
                        Array.isArray(item) && item.length === 2 && 
                        typeof item[0] === 'string' && typeof item[1] === 'string')) {
                        
                        setFlashcards(data);
                        // Save to localStorage
                        localStorage.setItem('currentFlashcards', content);
                        setMessage('Flashcards imported successfully');
                    } else {
                        setMessage('Invalid flashcard format in JSON file');
                    }
                } catch (error) {
                    console.error('Error parsing JSON:', error);
                    setMessage('Error parsing JSON file');
                }
                
                setLoading(prev => ({ ...prev, json: false }));
                setTimeout(() => setMessage(''), 3000);
            };
            
            reader.readAsText(file);
        };
        
        input.click();
    };
    
    // Import from PDF
    const importPDF = async () => {
        setLoading(prev => ({ ...prev, pdf: true }));
        
        const pdfText =
          "femur - is a bone in a human leg\nhumerus - is a bone in the upper arm";
        try {
          const response = await fetch("http://127.0.0.1:8000/generate_flashcards", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ inputText: pdfText }),
          });
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          console.log("Generated flashcards:", data.flashcards);
          
          // Update the flashcards state
          setFlashcards(data.flashcards);
          
          // Save to localStorage
          localStorage.setItem('currentFlashcards', JSON.stringify(data.flashcards));
          
          setMessage('Flashcards generated from PDF');
        } catch (err) {
          console.error("Error importing PDF:", err);
          setMessage('Error generating flashcards from PDF');
        }
        
        setLoading(prev => ({ ...prev, pdf: false }));
        setTimeout(() => setMessage(''), 3000);
    };
    
    // Handle adding a new flashcard manually
    const handleAddFlashcard = () => {
        if (frontText.trim() === "" && backText.trim() === "") {
            setMessage('Please enter text for the flashcard');
            setTimeout(() => setMessage(''), 3000);
            return;
        }
        
        setLoading(prev => ({ ...prev, manual: true }));
        
        try {
            // Add the new flashcard to the state
            const newCard: FlashcardType = [frontText, backText];
            const updatedFlashcards = [...flashcards, newCard];
            setFlashcards(updatedFlashcards);
            
            // Save to localStorage
            localStorage.setItem('currentFlashcards', JSON.stringify(updatedFlashcards));
            
            // Reset form
            setFrontText("");
            setBackText("");
            setIsManualFormOpen(false);
            setMessage('Flashcard added successfully');
        } catch (error) {
            console.error('Error adding flashcard:', error);
            setMessage('Error adding flashcard');
        }
        
        setLoading(prev => ({ ...prev, manual: false }));
        setTimeout(() => setMessage(''), 3000);
    };
    
    return (
        <>
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
                    <button 
                        onClick={importGoogleDrive} 
                        disabled={loading.googleDrive || !session}
                        style={{
                            backgroundColor: '#f57f1c', 
                            color: 'black', 
                            padding: 10,
                            opacity: !session ? 0.5 : 1
                        }}
                    >
                        {loading.googleDrive ? 'Loading...' : 'Import from Google Drive'}
                        {!session && <span style={{display: 'block', fontSize: '0.8em'}}>(Sign in required)</span>}
                    </button>
                    
                    <button 
                        onClick={importJSON} 
                        disabled={loading.json}
                        style={{backgroundColor: '#f57f1c', color:'black', padding: 10}}
                    >
                        {loading.json ? 'Loading...' : 'Import from JSON'}
                    </button>
                    
                    <button 
                        onClick={importPDF} 
                        disabled={loading.pdf}
                        style={{backgroundColor: '#f57f1c', color:'black', padding: 10}}
                    >
                        {loading.pdf ? 'Processing...' : 'Upload PDF'}
                    </button>
                    
                    <button 
                        onClick={() => setIsManualFormOpen(true)}
                        style={{backgroundColor: '#f57f1c', color:'black', padding: 10}}
                    >
                        Add Flashcard Manually
                    </button>
                    
                    <button 
                        onClick={saveCurrentDeck}
                        style={{backgroundColor: '#4CAF50', color:'white', padding: 10}}
                    >
                        Save Current Deck
                    </button>
                </div>
                
                {message && (
                    <div style={{
                        marginTop: 15,
                        padding: 10,
                        backgroundColor: message.includes('Error') || message.includes('Failed') 
                            ? '#f8d7da' 
                            : '#d4edda',
                        color: message.includes('Error') || message.includes('Failed') 
                            ? '#721c24' 
                            : '#155724',
                        borderRadius: 5,
                        textAlign: 'center'
                    }}>
                        {message}
                    </div>
                )}
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
                    <h2>File Name:</h2>
                    <input
                        type="text"
                        value={fileName}
                        onChange={(e) => setFileName(e.target.value.replace(/\.\w+$/, ''))}
                        style={{
                            padding: 8,
                            borderRadius: 4,
                            border: '1px solid #ccc',
                            backgroundColor: '#fff',
                            color: '#000'
                        }}
                        placeholder="flashcards"
                    />
                    <small style={{color: '#aaa'}}>Your deck will be saved as {fileName}.json</small>
                </div>
            </div>
            
            {/* Manual Flashcard Form */}
            {isManualFormOpen && (
                <div style={{
                    position: "fixed",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    backgroundColor: "#282c34",
                    padding: "30px",
                    borderRadius: "8px",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
                    zIndex: 1100,
                    width: "400px",
                    maxWidth: "90%"
                }}>
                    <h2 style={{ color: "white", marginBottom: "20px", textAlign: "center" }}>
                        Add New Flashcard
                    </h2>
                    <div style={{ marginBottom: "20px" }}>
                        <label style={{ color: "white", display: "block", marginBottom: "5px" }}>
                            Front (Question/Term):
                        </label>
                        <textarea
                            placeholder="Enter the question or term"
                            value={frontText}
                            onChange={(e) => setFrontText(e.target.value)}
                            style={{ 
                                padding: "10px", 
                                width: "100%", 
                                minHeight: "80px",
                                backgroundColor: "#3a3f48",
                                color: "white",
                                border: "1px solid #4a5568",
                                borderRadius: "4px",
                                resize: "vertical"
                            }}
                        />
                    </div>
                    <div style={{ marginBottom: "20px" }}>
                        <label style={{ color: "white", display: "block", marginBottom: "5px" }}>
                            Back (Answer/Definition):
                        </label>
                        <textarea
                            placeholder="Enter the answer or definition"
                            value={backText}
                            onChange={(e) => setBackText(e.target.value)}
                            style={{ 
                                padding: "10px", 
                                width: "100%", 
                                minHeight: "80px",
                                backgroundColor: "#3a3f48",
                                color: "white",
                                border: "1px solid #4a5568",
                                borderRadius: "4px",
                                resize: "vertical"
                            }}
                        />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <button 
                            onClick={() => setIsManualFormOpen(false)}
                            style={{
                                padding: "10px 20px",
                                backgroundColor: "#4a5568",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer"
                            }}
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleAddFlashcard}
                            disabled={loading.manual}
                            style={{
                                padding: "10px 20px",
                                backgroundColor: "#f57f1c",
                                color: "black",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer"
                            }}
                        >
                            {loading.manual ? "Adding..." : "Add Flashcard"}
                        </button>
                    </div>
                </div>
            )}

            {/* Floating Add Button (alternative to menu button) */}
            <button
                onClick={() => setIsManualFormOpen(!isManualFormOpen)}
                style={{
                    position: "fixed",
                    bottom: "85px",
                    right: "20px",
                    borderRadius: "50%",
                    width: "60px",
                    height: "60px",
                    backgroundColor: "#f57f1c",
                    color: "black",
                    fontSize: "2rem",
                    border: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
                    zIndex: 1000,
                    cursor: "pointer"
                }}
            >
                +
            </button>
        </>
    );
}

const App: React.FC = () => {
    const [flashcards, setFlashcards] = useState<FlashcardType[]>([]);
    
    // Load flashcards from localStorage on initial render
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedFlashcards = localStorage.getItem('currentFlashcards');
            if (savedFlashcards) {
                try {
                    const parsedFlashcards = JSON.parse(savedFlashcards);
                    // Validate the parsed data is the expected format
                    if (Array.isArray(parsedFlashcards) && 
                        parsedFlashcards.every(card => 
                            Array.isArray(card) && 
                            card.length === 2 && 
                            typeof card[0] === 'string' && 
                            typeof card[1] === 'string')) {
                        setFlashcards(parsedFlashcards);
                    } else {
                        console.error('Invalid flashcard format in localStorage');
                    }
                } catch (error) {
                    console.error('Error loading saved flashcards:', error);
                }
            }
        }
    }, []);
    
    return (
        <BrowserRouter>
            <Header />
            <Menu setFlashcards={setFlashcards} flashcards={flashcards} />
            <DeckManager flashcards={flashcards} />
            <Footer />
        </BrowserRouter>
    );
};

export default App;
