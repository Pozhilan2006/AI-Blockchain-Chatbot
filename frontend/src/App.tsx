import React, { useState, useEffect } from 'react';
import { ConnectWallet } from './components/ConnectWallet';
import { Auth } from './components/Auth';
import { ChatInterface } from './components/ChatInterface';
import { getChainById } from './config/chains';

function App() {
    const [address, setAddress] = useState<string>('');
    const [chainId, setChainId] = useState<number>(0);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [authToken, setAuthToken] = useState<string>('');

    useEffect(() => {
        // Check for existing auth token
        const token = localStorage.getItem('authToken');
        if (token) {
            setAuthToken(token);
            setIsAuthenticated(true);
        }
    }, []);

    function handleConnect(connectedAddress: string, connectedChainId: number) {
        setAddress(connectedAddress);
        setChainId(connectedChainId);
    }

    function handleAuthenticated(token: string) {
        setAuthToken(token);
        setIsAuthenticated(true);
    }

    function handleLogout() {
        localStorage.removeItem('authToken');
        setIsAuthenticated(false);
        setAuthToken('');
        setAddress('');
        setChainId(0);
        window.location.reload();
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
            authToken={authToken}
            onLogout={handleLogout}
        />
    );
}

export default App;
