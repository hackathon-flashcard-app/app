import React from 'react';
import styles from './Flashcard.module.css';
import { useState } from 'react';

const Flashcard = ({ front, back }) => {
    const [flipped, setFlipped] = useState(false);

    const handleFlip = (e) => {
        // Only allow direct clicks on the card to flip it
        if (e.currentTarget === e.target || e.target.closest(`.${styles.front}`) || e.target.closest(`.${styles.back}`)) {
            setFlipped(!flipped);
        }
    };

    return (
        <div 
            className={styles.flashcard} 
            onClick={handleFlip}
            style={{ position: 'relative', zIndex: 50 }}
        >
            <div className={`${styles.inner} ${flipped ? styles.flipped : ''}`}>
                <div className={styles.front}>
                    {front}
                </div>
                <div className={styles.back}>
                    {back}
                </div>
            </div>
        </div>
    );
};

export default Flashcard;