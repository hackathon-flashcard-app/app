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

const EmptyDeckMessage = () => (
    <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        border: '2px dashed #ccc',
        borderRadius: '10px',
        padding: '1.5rem',
        textAlign: 'center',
        color: '#666',
        overflow: 'hidden'
    }}>
        <h2 style={{ 
            marginBottom: '0.5rem', 
            fontSize: '1.2rem',
            maxWidth: '100%' 
        }}>
            No Flashcards Yet
        </h2>
        <p style={{ 
            fontSize: '0.9rem',
            maxWidth: '100%',
            lineHeight: '1.2' 
        }}>
            Create your first flashcard by clicking the "+" button
        </p>
        <p style={{ 
            marginTop: '0.5rem', 
            fontSize: '0.8rem',
            maxWidth: '100%',
            lineHeight: '1.2'
        }}>
            Or use the menu options on the left to import a deck
        </p>
    </div>
);

interface DeckManagerProps {
    flashcards: FlashcardType[];
    setFlashcards: React.Dispatch<React.SetStateAction<FlashcardType[]>>;
}

const DeckManager: React.FC<DeckManagerProps> = ({ flashcards, setFlashcards }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    
    // Check if we have any flashcards
    const hasFlashcards = Array.isArray(flashcards) && flashcards.length > 0;
    
    // Create a default card for empty state
    const defaultCard: FlashcardType = ["Add a flashcard to start learning", "Click the + button to create a card"];
    
    // Use real flashcards or default placeholder
    const deck: FlashcardType[] = hasFlashcards ? flashcards : [defaultCard];
    
    // Reset index when flashcards change
    useEffect(() => {
        if (currentIndex >= flashcards.length && flashcards.length > 0) {
            setCurrentIndex(flashcards.length - 1);
        }
    }, [flashcards, currentIndex]);
    
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

    // Delete the current flashcard
    const handleDelete = () => {
        if (!hasFlashcards) return;
        
        // Create a new array without the current card
        const updatedFlashcards = [...flashcards];
        updatedFlashcards.splice(safeIndex, 1);
        
        // Update the state
        setFlashcards(updatedFlashcards);
        
        // Update localStorage
        localStorage.setItem('currentFlashcards', JSON.stringify(updatedFlashcards));
        
        // Adjust the current index if necessary
        if (safeIndex >= updatedFlashcards.length) {
            setCurrentIndex(Math.max(0, updatedFlashcards.length - 1));
        }
        
        // Close the modal
        setIsDeleteModalOpen(false);
    };

    // Ensure we have a valid index
    const safeIndex = currentIndex >= 0 && currentIndex < deck.length ? currentIndex : 0;
    
    // Get current flashcard data
    const [front, back] = deck[safeIndex];

    return (
        <div style={{ 
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
            left: '100px', // Offset to account for the 200px menu (half of 200px)
            width: 'calc(100% - 200px)' // Adjust width to account for menu
        }}>
            {/* Main container for better centering */}
            <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                marginTop: 125,
                width: '100%',
                maxWidth: '1060px' // 900px card + 2 × 80px buttons
            }}>
                <button 
                    onClick={handleLeftClick}
                    disabled={!hasFlashcards}
                    style={{ 
                        opacity: hasFlashcards ? 1 : 0.5,
                        background: 'none',
                        border: 'none',
                        cursor: hasFlashcards ? 'pointer' : 'default'
                    }}
                >
                    <Image
                        src="/images/left-arrow.png"
                        height={80}
                        width={80}
                        alt="Previous card"
                    />
                </button>
                
                {/* Container for the flashcard with a fixed size */}
                <div style={{ 
                    width: 900, 
                    height: 500, 
                    position: 'relative', 
                    fontSize: '20rem',
                    margin: '0 auto'
                }}>
                    {!hasFlashcards ? (
                        // Show empty state message when no cards exist
                        <EmptyDeckMessage />
                    ) : (
                        // Show the flashcard carousel when cards exist
                        <>
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
                            
                            {/* Delete button overlay */}
                            <button
                                onClick={() => setIsDeleteModalOpen(true)}
                                style={{
                                    position: 'absolute',
                                    top: '8px',
                                    right: '8px',
                                    zIndex: 100,
                                    backgroundColor: '#ff5555',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '24px',
                                    height: '24px',
                                    fontSize: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    opacity: 0.6,
                                    transition: 'opacity 0.2s',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                }}
                                title="Delete this flashcard"
                                onMouseOver={(e) => (e.currentTarget.style.opacity = '0.9')}
                                onMouseOut={(e) => (e.currentTarget.style.opacity = '0.6')}
                            >
                                ✕
                            </button>
                        </>
                    )}
                </div>
                
                <button 
                    onClick={handleRightClick}
                    disabled={!hasFlashcards}
                    style={{ 
                        opacity: hasFlashcards ? 1 : 0.5,
                        background: 'none',
                        border: 'none',
                        cursor: hasFlashcards ? 'pointer' : 'default'
                    }}
                >
                    <Image
                        src="/images/right-arrow.png"
                        height={80}
                        width={80}
                        alt="Next card"
                    />
                </button>
            </div>
            
            {/* Progress bar */}
            {hasFlashcards && (
                <div style={{ 
                    width: '900px', 
                    margin: '20px auto 0',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    <div style={{
                        width: '100%',
                        height: '8px',
                        backgroundColor: '#e0e0e0',
                        borderRadius: '4px',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            width: `${((safeIndex + 1) / deck.length) * 100}%`,
                            height: '100%',
                            backgroundColor: '#f57f1c',
                            borderRadius: '4px',
                            transition: 'width 0.3s ease-in-out'
                        }} />
                    </div>
                    <div style={{
                        fontSize: '0.9rem',
                        color: '#666'
                    }}>
                        Card {safeIndex + 1} of {deck.length}
                    </div>
                </div>
            )}
            
            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'gray',
                        padding: '24px',
                        borderRadius: '8px',
                        maxWidth: '400px',
                        width: '90%',
                        textAlign: 'center'
                    }}>
                        <h3 style={{ marginTop: 0, marginBottom: '16px' }}>Delete Flashcard?</h3>
                        <p style={{ marginBottom: '24px' }}>
                            Are you sure you want to delete this flashcard?
                            <br />
                            <strong>Front:</strong> {front.length > 30 ? front.substring(0, 30) + '...' : front}
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <button
                                onClick={() => setIsDeleteModalOpen(false)}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: 'gray',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: '#ff5555',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
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
    
    // Check if we have any flashcards
    const hasFlashcards = Array.isArray(flashcards) && flashcards.length > 0;
    
    // Handle saving current flashcards
    const saveCurrentDeck = () => {
        try {
            // Get the current flashcards state via props
            const currentFlashcards = Array.isArray(flashcards) && flashcards.length > 0 
                ? [...flashcards] // Create a copy to avoid mutation issues
                : [];
            
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
    
    // Handle clearing all flashcards
    const [isClearModalOpen, setIsClearModalOpen] = useState(false);
    
    const handleClearAllFlashcards = () => {
        try {
            // Clear the flashcards state
            setFlashcards([]);
            
            // Clear localStorage
            localStorage.removeItem('currentFlashcards');
            
            // Close the modal
            setIsClearModalOpen(false);
            
            setMessage('All flashcards cleared successfully');
        } catch (error) {
            console.error('Error clearing flashcards:', error);
            setMessage('Error clearing flashcards');
        }
        
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
                    
                    <div style={{ borderTop: '1px solid #444', margin: '10px 0' }}></div>
                    
                    <button 
                        onClick={() => setIsClearModalOpen(true)}
                        disabled={!hasFlashcards}
                        style={{
                            backgroundColor: '#ff5555', 
                            color: 'white', 
                            padding: 10,
                            opacity: hasFlashcards ? 1 : 0.5
                        }}
                    >
                        Clear All Flashcards
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
            
            {/* Clear All Flashcards Confirmation Modal */}
            {isClearModalOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1500
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '24px',
                        borderRadius: '8px',
                        maxWidth: '400px',
                        width: '90%',
                        textAlign: 'center'
                    }}>
                        <h3 style={{ color: '#333', marginTop: 0, marginBottom: '16px' }}>Clear All Flashcards?</h3>
                        <p style={{ color: '#555', marginBottom: '24px' }}>
                            Are you sure you want to delete all flashcards? This action cannot be undone.
                        </p>
                        <p style={{ color: '#777', fontSize: '0.9rem', marginBottom: '24px' }}>
                            You currently have {flashcards.length} flashcard{flashcards.length !== 1 ? 's' : ''}.
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <button
                                onClick={() => setIsClearModalOpen(false)}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: '#f0f0f0',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleClearAllFlashcards}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: '#ff5555',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                Clear All
                            </button>
                        </div>
                    </div>
                </div>
            )}
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
            <DeckManager flashcards={flashcards} setFlashcards={setFlashcards} />
            <Footer />
        </BrowserRouter>
    );
};

export default App;
