import React from 'react';
import styles from './Flashcard.module.css';
import { useState } from 'react';

const Flashcard = ({ front, back }) => {
    const [flipped, setFlipped] = useState(false);

    return (
        <div className={styles.flashcard} onClick={() => setFlipped(!flipped)}>
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