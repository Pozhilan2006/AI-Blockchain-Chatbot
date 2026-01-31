import { useState, useEffect } from 'react';
import { ConnectWallet } from './components/ConnectWallet';
import { Auth } from './components/Auth';
import { ChatInterface } from './components/ChatInterface';
import { LandingPage } from './components/LandingPage';

function App() {
    const [address, setAddress] = useState<string>('');
    const [chainId, setChainId] = useState<number>(0);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const [showLanding, setShowLanding] = useState(true);

    useEffect(() => {
        // Check for existing auth token
        const token = localStorage.getItem('authToken');
        if (token) {
            setIsAuthenticated(true);
            setShowLanding(false); // Skip landing if already logged in
        }
    }, []);

    function handleConnect(connectedAddress: string, connectedChainId: number) {
        setAddress(connectedAddress);
        setChainId(connectedChainId);
    }

    function handleAuthenticated(token: string) {
        localStorage.setItem('authToken', token);
        setIsAuthenticated(true);
    }

    function handleLogout() {
        localStorage.removeItem('authToken');
        setIsAuthenticated(false);
        setAddress('');
        setChainId(0);
        setShowLanding(true); // Return to landing on logout
    }

    function handleGetStarted() {
        setShowLanding(false);
    }

    // Show Landing Page
    if (showLanding && !isAuthenticated) {
        return <LandingPage onGetStarted={handleGetStarted} />;
    }

    // Show wallet connection screen
    if (!address) {
        return <ConnectWallet onConnect={handleConnect} />;
    }

    // Show authentication screen
    if (!isAuthenticated) {
        return <Auth address={address} onAuthenticated={handleAuthenticated} />;
    }

    // Show main chat interface
    return (
        <ChatInterface
            address={address}
            chainId={chainId}
            onLogout={handleLogout}
        />
    );
}

export default App;
