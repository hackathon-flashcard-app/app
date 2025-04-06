import React from 'react';
import styles from './Flashcard.module.css';
import { useState, useEffect } from 'react';
import Flashcard from '../static/components/Flashcard'
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import {
	getStorageType,
	saveToFile,
	saveToDrive,
	getFromDrive,
	FlashcardType,
	Deck,
	DeckMetadata,
	getAllDecks,
	getDeck,
	saveDeck,
	createDeck,
	getActiveDeckId,
	setActiveDeck
} from '@/utils/storage';
import DeckSelector from '@/components/DeckSelector';

interface MenuProps {
	currentDeck: Deck | null;
	setCurrentDeck: React.Dispatch<React.SetStateAction<Deck | null>>;
	refreshDecks: () => void;
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

interface FlashcardViewerProps {
	deck: Deck | null;
	updateDeck: (updatedDeck: Deck) => void;
}

const FlashcardViewer: React.FC<FlashcardViewerProps> = ({ deck, updateDeck }) => {
	const [currentIndex, setCurrentIndex] = useState(0);
	const [direction, setDirection] = useState(0);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

	// Check if we have any flashcards
	const hasFlashcards = deck && Array.isArray(deck.cards) && deck.cards.length > 0;

	// Create a default card for empty state
	const defaultCard: FlashcardType = ["Add a flashcard to start learning", "Click the + button to create a card"];

	// Use real flashcards or default placeholder
	const cards: FlashcardType[] = hasFlashcards ? deck.cards : [defaultCard];

	// Reset index when flashcards change
	useEffect(() => {
		if (deck && currentIndex >= deck.cards.length && deck.cards.length > 0) {
			setCurrentIndex(deck.cards.length - 1);
		}
	}, [deck, currentIndex]);

	const handleLeftClick = () => {
		console.log('Left arrow clicked');
		setDirection(-1);
		setCurrentIndex((prevIndex) => {
			const newIndex = prevIndex === 0 ? cards.length - 1 : prevIndex - 1;
			console.log(`Changing index from ${prevIndex} to ${newIndex}`);
			return newIndex;
		});
	};

	const handleRightClick = () => {
		console.log('Right arrow clicked');
		setDirection(1);
		setCurrentIndex((prevIndex) => {
			const newIndex = prevIndex === cards.length - 1 ? 0 : prevIndex + 1;
			console.log(`Changing index from ${prevIndex} to ${newIndex}`);
			return newIndex;
		});
	};

	// Delete the current flashcard
	const handleDelete = () => {
		if (!hasFlashcards || !deck) return;

		// Create a new array without the current card
		const updatedCards = [...deck.cards];
		updatedCards.splice(safeIndex, 1);

		// Update the deck
		const updatedDeck = {
			...deck,
			cards: updatedCards,
			updatedAt: new Date().toISOString()
		};

		// Update the parent component
		updateDeck(updatedDeck);

		// Adjust the current index if necessary
		if (safeIndex >= updatedCards.length) {
			setCurrentIndex(Math.max(0, updatedCards.length - 1));
		}

		// Close the modal
		setIsDeleteModalOpen(false);
	};

	// Ensure we have a valid index
	const safeIndex = currentIndex >= 0 && currentIndex < cards.length ? currentIndex : 0;

	// Get current flashcard data
	const [front, back] = cards[safeIndex];

	return (
        <div style={{ 
            position: 'absolute',
            top: '75px', // Below header
            left: '200px', // Menu width
            right: '0',
            bottom: '10vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0',
            isolation: 'isolate' // Create a new stacking context
        }}>
	{deck && (
        <div style={{ 
            position: 'absolute',
            top: '75px', // Below header
            left: '200px', // Menu width
            right: '0',
            bottom: '10vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0'
        }}>
          <h2 style={{ 
            fontSize: '1.5rem', 
            fontWeight: 'bold',
            color: '#333'
          }}>{deck.name}</h2>
          {deck.description && (
            <p style={{ 
              fontSize: '0.9rem',
              color: '#666',
              marginTop: '5px'
            }}>{deck.description}</p>
          )}
        </div>
      )}
            {/* Main container for better centering */}
            <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                width: '100%',
                maxWidth: '1060px' // 900px card + 2 × 80px buttons
            }}>
                <button 
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (hasFlashcards) handleLeftClick();
                    }}
                    aria-label="Previous card"
                    disabled={!hasFlashcards}
                    style={{ 
                        opacity: hasFlashcards ? 1 : 0.5,
                        background: 'none',
                        border: 'none',
                        cursor: hasFlashcards ? 'pointer' : 'default',
                        zIndex: 200, // Ensure button is above other elements
                        position: 'relative'
                    }}
                >
                    <Image
                        src="/images/left-arrow.png"
                        height={80}
                        width={80}
                        alt="Previous card"
                        style={{ pointerEvents: 'none' }} // Prevent image from capturing clicks
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
                                    style={{ 
                                        position: 'absolute', 
                                        width: '100%',
                                        zIndex: 10
                                    }}
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
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (hasFlashcards) handleRightClick();
                    }}
                    aria-label="Next card"
                    disabled={!hasFlashcards}
                    style={{ 
                        opacity: hasFlashcards ? 1 : 0.5,
                        background: 'none',
                        border: 'none',
                        cursor: hasFlashcards ? 'pointer' : 'default',
                        zIndex: 200, // Ensure button is above other elements
                        position: 'relative'
                    }}
                >
                    <Image
                        src="/images/right-arrow.png"
                        height={80}
                        width={80}
                        alt="Next card"
                        style={{ pointerEvents: 'none' }} // Prevent image from capturing clicks
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
                            width: `${((safeIndex + 1) / deck.cards.length) * 100}%`,
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
                        Card {safeIndex + 1} of {deck.cards.length}
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
                    zIndex: 9999
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
		// Clear all localStorage data
		localStorage.clear();
		console.log('User logged out and localStorage cleared');
		signOut({ callbackUrl: 'http://localhost:3000/' });
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


const Menu: React.FC<MenuProps> = ({ currentDeck, setCurrentDeck, refreshDecks }) => {
	const { data: session } = useSession();
	const [loading, setLoading] = useState<Record<string, boolean>>({
		googleDrive: false,
		json: false,
		pdf: false,
		manual: false,
		export: false
	});
	const [message, setMessage] = useState<string>('');
	const [isManualFormOpen, setIsManualFormOpen] = useState(false);
	const [frontText, setFrontText] = useState("");
	const [backText, setBackText] = useState("");
	const [metadataRefreshCounter, setMetadataRefreshCounter] = useState(0);

	// Check if we have any flashcards
	const hasFlashcards = currentDeck && Array.isArray(currentDeck.cards) && currentDeck.cards.length > 0;

	// Handle exporting current deck
	const handleExportDeck = () => {
		if (!currentDeck) {
			setMessage('No deck selected to export');
			setTimeout(() => setMessage(''), 3000);
			return;
		}

		try {
			setLoading(prev => ({ ...prev, export: true }));

			// Determine the storage type and save accordingly
			const storageType = getStorageType();

			if (storageType === 'google' && session?.accessToken) {
				// Save to Google Drive
				saveToDrive(
					`${currentDeck.name.replace(/\s+/g, '_')}.json`,
					currentDeck,
					session.accessToken as string
				)
					.then(success => {
						if (success) {
							setMessage('Saved to Google Drive successfully');
						} else {
							setMessage('Failed to save to Google Drive');
						}
						setLoading(prev => ({ ...prev, export: false }));
					});
			} else {
				// Save to local file
				saveToFile(
					JSON.stringify(currentDeck, null, 2),
					currentDeck.name.replace(/\s+/g, '_')
				);
				setMessage('Deck exported to file successfully');
				setLoading(prev => ({ ...prev, export: false }));
			}
		} catch (error) {
			console.error('Error exporting deck:', error);
			setMessage('Error exporting deck');
			setLoading(prev => ({ ...prev, export: false }));
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
			// Get list of files (TODO: implement file selection UI)
			const fileName = prompt('Enter the name of the deck to import:');
			if (!fileName) {
				setLoading(prev => ({ ...prev, googleDrive: false }));
				return;
			}

			const data = await getFromDrive(`${fileName}.json`, session.accessToken as string);

			if (data) {
				// Check if it's in the new deck format
				if (data.id && data.name && data.cards) {
					// Save the deck
					saveDeck(data);
					setCurrentDeck(data);
					refreshDecks();
					setMessage(`Deck "${data.name}" loaded from Google Drive`);
				} else if (Array.isArray(data)) {
					// Old format - convert to new format
					const newDeck = createDeck(fileName, '', data);
					setCurrentDeck(newDeck);
					refreshDecks();
					setMessage(`Converted and imported ${data.length} flashcards as "${fileName}"`);
				} else {
					setMessage('Invalid deck format');
				}
			} else {
				setMessage('No deck found in Google Drive');
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

					// Check if it's in the new deck format
					if (data.id && data.name && Array.isArray(data.cards)) {
						// Save the deck
						saveDeck(data);
						setCurrentDeck(data);
						refreshDecks();
						setMessage(`Deck "${data.name}" imported successfully`);
					} else if (Array.isArray(data)) {
						// Old format - convert to new format
						const deckName = file.name.replace(/\.\w+$/, '');
						const newDeck = createDeck(deckName, '', data);
						setCurrentDeck(newDeck);
						refreshDecks();
						setMessage(`Converted and imported ${data.length} flashcards as "${deckName}"`);
					} else {
						setMessage('Invalid deck format in JSON file');
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
		if (!currentDeck) {
			setMessage('Please select or create a deck first');
			setTimeout(() => setMessage(''), 3000);
			return;
		}

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

			// Update the current deck
			const updatedDeck = {
				...currentDeck,
				cards: [...currentDeck.cards, ...data.flashcards],
				updatedAt: new Date().toISOString()
			};

			// Save the updated deck
			saveDeck(updatedDeck);
			setCurrentDeck(updatedDeck);
			// Trigger metadata refresh
			setMetadataRefreshCounter(prev => prev + 1);

			setMessage(`Added ${data.flashcards.length} flashcards from PDF`);
		} catch (err) {
			console.error("Error importing PDF:", err);
			setMessage('Error generating flashcards from PDF');
		}

		setLoading(prev => ({ ...prev, pdf: false }));
		setTimeout(() => setMessage(''), 3000);
	};

	// Handle adding a new flashcard manually
	const handleAddFlashcard = () => {
		if (!currentDeck) {
			setMessage('Please select or create a deck first');
			setTimeout(() => setMessage(''), 3000);
			return;
		}

		if (frontText.trim() === "" && backText.trim() === "") {
			setMessage('Please enter text for the flashcard');
			setTimeout(() => setMessage(''), 3000);
			return;
		}

		setLoading(prev => ({ ...prev, manual: true }));

		try {
			// Add the new flashcard to the current deck
			const newCard: FlashcardType = [frontText, backText];
			const updatedDeck = {
				...currentDeck,
				cards: [...currentDeck.cards, newCard],
				updatedAt: new Date().toISOString()
			};

			// Save the updated deck
			saveDeck(updatedDeck);
			setCurrentDeck(updatedDeck);
			// Trigger metadata refresh
			setMetadataRefreshCounter(prev => prev + 1);

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

	// Handle clearing current deck
	const [isClearModalOpen, setIsClearModalOpen] = useState(false);

	const handleClearDeck = () => {
		if (!currentDeck) return;

		try {
			// Clear the cards in the current deck
			const updatedDeck = {
				...currentDeck,
				cards: [],
				updatedAt: new Date().toISOString()
			};

			// Save the updated deck
			saveDeck(updatedDeck);
			setCurrentDeck(updatedDeck);
			// Trigger metadata refresh
			setMetadataRefreshCounter(prev => prev + 1);

			// Close the modal
			setIsClearModalOpen(false);

			setMessage('All flashcards cleared from deck');
		} catch (error) {
			console.error('Error clearing deck:', error);
			setMessage('Error clearing deck');
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
					width: 250,
					backgroundColor: '#313640',
					color: 'white',
					zIndex: 10,
					display: 'flex',
					flexDirection: 'column'
				}}
			>
				{/* Deck selection section */}
				<DeckSelector onDeckSelected={(deckId) => {
					const selectedDeck = getDeck(deckId);
					if (selectedDeck) {
						setCurrentDeck(selectedDeck);
					}
				}} />

				<div style={{
					borderTop: '1px solid #444',
					padding: '20px',
					display: 'flex',
					flexDirection: 'column',
					gap: 10,
					overflowY: 'auto'
				}}>
					<h3 style={{ fontSize: '1rem', marginBottom: '10px' }}>Import Options</h3>

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
						{!session && <span style={{ display: 'block', fontSize: '0.8em' }}>(Sign in required)</span>}
					</button>

					<button
						onClick={importJSON}
						disabled={loading.json}
						style={{ backgroundColor: '#f57f1c', color: 'black', padding: 10 }}
					>
						{loading.json ? 'Loading...' : 'Import Deck from JSON'}
					</button>

					<button
						onClick={importPDF}
						disabled={loading.pdf || !currentDeck}
						style={{
							backgroundColor: '#f57f1c',
							color: 'black',
							padding: 10,
							opacity: !currentDeck ? 0.5 : 1
						}}
					>
						{loading.pdf ? 'Processing...' : 'Add Cards from PDF'}
					</button>

					<div style={{ 
						borderTop: '1px solid #444', 
						margin: '10px 0', 
						paddingTop: '10px'
					}}>
						<h3 style={{ fontSize: '1rem', marginBottom: '10px' }}>Export Options</h3>
						
						<button 
							onClick={() => {
								if (!currentDeck || !hasFlashcards) return;
								
								setLoading(prev => ({ ...prev, export: true }));
								if (session?.accessToken) {
									saveToDrive(
										`${currentDeck.name.replace(/\s+/g, '_')}.json`, 
										currentDeck, 
										session.accessToken as string
									)
										.then(success => {
											if (success) {
												setMessage('Saved to Google Drive successfully');
											} else {
												setMessage('Failed to save to Google Drive');
											}
											setLoading(prev => ({ ...prev, export: false }));
										});
								} else {
									setMessage('Please sign in with Google to use this feature');
									setLoading(prev => ({ ...prev, export: false }));
								}
								
								setTimeout(() => setMessage(''), 3000);
							}}
							disabled={loading.export || !currentDeck || !hasFlashcards || !session}
							style={{
								backgroundColor: '#4285F4', 
								color: 'white', 
								padding: 10,
								marginBottom: 8,
								opacity: (!currentDeck || !hasFlashcards || !session) ? 0.5 : 1,
								width: '100%'
							}}
						>
							Export to Google Drive
						</button>
						
						<button 
							onClick={() => {
								if (!currentDeck || !hasFlashcards) return;
								
								setLoading(prev => ({ ...prev, export: true }));
								try {
									saveToFile(
										JSON.stringify(currentDeck, null, 2), 
										currentDeck.name.replace(/\s+/g, '_')
									);
									setMessage('Deck exported to file successfully');
								} catch (error) {
									console.error('Error exporting deck:', error);
									setMessage('Error exporting deck');
								}
								setLoading(prev => ({ ...prev, export: false }));
								
								setTimeout(() => setMessage(''), 3000);
							}}
							disabled={loading.export || !currentDeck || !hasFlashcards}
							style={{
								backgroundColor: '#34A853', 
								color: 'white', 
								padding: 10,
								opacity: (!currentDeck || !hasFlashcards) ? 0.5 : 1,
								width: '100%'
							}}
						>
							Export to JSON File
						</button>
					</div>

					<div style={{ borderTop: '1px solid #444', margin: '10px 0' }}></div>

					<button
						onClick={() => setIsClearModalOpen(true)}
						disabled={!currentDeck || !hasFlashcards}
						style={{
							backgroundColor: '#ff5555',
							color: 'white',
							padding: 10,
							opacity: (!currentDeck || !hasFlashcards) ? 0.5 : 1
						}}
					>
						Clear Current Deck
					</button>
				</div>

				{message && (
					<div style={{
						margin: '15px',
						padding: '10px',
						backgroundColor: message.includes('Error') || message.includes('Failed')
							? '#f8d7da'
							: '#d4edda',
						color: message.includes('Error') || message.includes('Failed')
							? '#721c24'
							: '#155724',
						borderRadius: '5px',
						textAlign: 'center'
					}}>
						{message}
					</div>
				)}
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
					zIndex: 9999,
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
				onClick={() => {
					if (currentDeck) {
						setIsManualFormOpen(!isManualFormOpen);
					} else {
						setMessage('Please select or create a deck first');
						setTimeout(() => setMessage(''), 3000);
					}
				}}
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
					zIndex: 1050,
					cursor: "pointer"
				}}
			>
				+
			</button>

			{/* Clear Deck Confirmation Modal */}
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
					zIndex: 9999
				}}>
					<div style={{
						backgroundColor: 'white',
						padding: '24px',
						borderRadius: '8px',
						maxWidth: '400px',
						width: '90%',
						textAlign: 'center'
					}}>
						<h3 style={{ color: '#333', marginTop: 0, marginBottom: '16px' }}>Clear Deck?</h3>
						<p style={{ color: '#555', marginBottom: '24px' }}>
							Are you sure you want to delete all flashcards from <strong>{currentDeck?.name}</strong>? This action cannot be undone.
						</p>
						<p style={{ color: '#777', fontSize: '0.9rem', marginBottom: '24px' }}>
							This deck currently has {currentDeck?.cards.length} flashcard{currentDeck?.cards.length !== 1 ? 's' : ''}.
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
								onClick={handleClearDeck}
								style={{
									padding: '8px 16px',
									backgroundColor: '#ff5555',
									color: 'white',
									border: 'none',
									borderRadius: '4px',
									cursor: 'pointer'
								}}
							>
								Clear Deck
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
}

const App: React.FC = () => {
	const [currentDeck, setCurrentDeck] = useState<Deck | null>(null);
	const [decksLoaded, setDecksLoaded] = useState<boolean>(false);

	// Trigger deck refresh
	const refreshDecks = () => {
		setDecksLoaded(prevState => !prevState);
	};

	// Load active deck on initial render
	useEffect(() => {
		if (typeof window !== 'undefined') {
			// Check if we have decks
			const decks = getAllDecks();

			if (decks.length === 0) {
				// Create a default deck if none exist
				const defaultDeck = createDeck('My First Deck', 'Created automatically');
				setCurrentDeck(defaultDeck);
			} else {
				// Load the active deck
				const activeId = getActiveDeckId();
				const deckToLoad = activeId ? getDeck(activeId) : getDeck(decks[0].id);

				if (deckToLoad) {
					setCurrentDeck(deckToLoad);
				} else if (decks.length > 0) {
					// Fallback to first deck if active deck can't be loaded
					const firstDeck = getDeck(decks[0].id);
					if (firstDeck) {
						setCurrentDeck(firstDeck);
						setActiveDeck(decks[0].id);
					}
				}
			}
		}
	}, [decksLoaded]);

	// Handler to update the current deck
	const handleUpdateDeck = (updatedDeck: Deck) => {
		// Save the updated deck
		saveDeck(updatedDeck);
		// Update the state
		setCurrentDeck(updatedDeck);
	};

	return (
		<BrowserRouter>
			<Header />
			<div style={{
				paddingTop: '70px',
				paddingLeft: '250px',
				minHeight: 'calc(100vh - 70px - 64px)'
			}}>
				<FlashcardViewer
					deck={currentDeck}
					updateDeck={handleUpdateDeck}
				/>
			</div>
			<Menu
				currentDeck={currentDeck}
				setCurrentDeck={setCurrentDeck}
				refreshDecks={refreshDecks}
			/>
			<Footer />
		</BrowserRouter>
	);
};

export default App;
