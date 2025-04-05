import React from 'react';
import { Link } from 'react-router-dom';
import dynamic from 'next/dynamic';

const BrowserRouter = dynamic(() => import('react-router-dom').then(mod => mod.BrowserRouter), { ssr: false });

const Header: React.FC = () => {


    const handleLogout = () => {
        console.log('User logged out');
        // Add your logout logic here
    };


    return (
        <header style={{ backgroundColor: '#282c34', padding: '20px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1>Deck Manager</h1>

            <Link to="/login.tsx">
                <button onClick={handleLogout} style={{ backgroundColor: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
                    Logout
                </button>
            </Link>

        </header>
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
            <h2>Deck List</h2>
        </div>
    );
}







const DeckManager: React.FC = () => {
    return (
        
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <Header />
            
            <h1>Deck Manager</h1>
            <p>Welcome to the Deck Manager page. Use this page to manage your decks.</p>
            
            <DeckList />


            <Footer />
        </div>

    );
};


const App: React.FC = () => {
    return (
        <BrowserRouter>
            <DeckManager />
        </BrowserRouter>
    );
};

export default App;