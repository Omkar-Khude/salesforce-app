// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import "bootstrap/dist/css/bootstrap.min.css";
// import Navbar from "./Navbar";

// const clientId = '3MVG9VMBZCsTL9hmzOC9jLMI8oKB.Yn3GpI..S.TqvpWX6Dvo0l4Y_493GdZypcpAXjBHA7SCxQ==';
// const redirectUri = 'http://localhost:3000/logged-in';

// const Dashboard = () => {
//     const navigate = useNavigate();
//     const [loading, setLoading] = useState(false);

//     const handleLogin = () => {
//         setLoading(true);
//         const oauthUrl = `https://login.salesforce.com/services/oauth2/authorize?response_type=token&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}`;
        
//         window.location.href = oauthUrl;
//     };

//     return (
//         <div>
//             <Navbar />
//             <div className="container mt-5 px-5">
//                 <div className="mt-5">
//                     <h2 style={{ color: '#ff4d00' }}>Salesforce Switch</h2>
//                     <p>
//                         This tool provides an interface to easily enable and disable components
//                         in your Salesforce Org - Workflows, Triggers, and Validation Rules. Very useful when doing data migrations and needing to disable certain automation.
//                     </p>
//                     <p className="text-muted">
//                         None of your organization information or data is captured or kept from running this tool.
//                     </p>

//                     <div className="d-flex align-items-center">
//                         <label className="me-2">Environment :</label>
//                         <label className="me-2">Production</label>
//                         <button 
//                             onClick={handleLogin} 
//                             style={{ 
//                                 backgroundColor: "#ff4d00", 
//                                 color: "white", 
//                                 border: "none", 
//                                 fontSize: "16px", 
//                                 padding: "5px 15px",
//                                 cursor: "pointer"
//                             }}
//                             disabled={loading}
//                         >
//                             {loading ? "Logging in..." : "LOGIN"}
//                         </button>
//                     </div>

//                     {loading && (
//                         <div className="mt-3 text-center">
//                             <div className="spinner-border thick-spinner text-warning" role="status" 
//                                 style={{ width: "60px", height: "60px", borderWidth: "6px" }}>
//                             </div>
//                             <div style={{ color: "#ff8c00", fontSize: "20px", fontWeight: "bold", marginTop: "10px" }}>
//                                 Accessing Salesforce...
//                             </div>
//                             <div style={{ color: "gray", fontSize: "16px", marginTop: "5px" }}>
//                                 Logging in with OAuth 2.0
//                             </div>
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default Dashboard;
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Navbar from "./Navbar";

const Dashboard = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Dynamic environment detection with logging
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const redirectUri = isLocalhost 
        ? `${window.location.origin}/#/logged-in`
        : 'https://salesforce-app1.onrender.com/#/logged-in';

    console.log('Environment:', isLocalhost ? 'Development' : 'Production');
    console.log('Using redirect URI:', redirectUri);

    useEffect(() => {
        // Check for OAuth response immediately on load
        console.log('Initial URL hash:', window.location.hash);
        
        if (window.location.hash.includes('access_token')) {
            console.log('Detected OAuth response in URL hash');
            navigate('/logged-in', { state: { hash: window.location.hash } });
        }
    }, [navigate]);

    const handleLogin = () => {
        console.log('Initiating OAuth flow...');
        setLoading(true);
        setError(null);
        
        try {
            const authUrl = new URL('https://login.salesforce.com/services/oauth2/authorize');
            const params = {
                response_type: 'token',
                client_id: '3MVG9VMBZCsTL9hmzOC9jLMI8oKB.Yn3GpI..S.TqvpWX6Dvo0l4Y_493GdZypcpAXjBHA7SCxQ==',
                redirect_uri: redirectUri,
                scope: 'api refresh_token',
                prompt: 'login'
            };

            authUrl.search = new URLSearchParams(params).toString();
            console.log('Constructed OAuth URL:', authUrl.toString());
            
            window.location.href = authUrl.toString();
        } catch (err) {
            console.error('OAuth initiation failed:', err);
            setError(`Login failed: ${err.message}`);
            setLoading(false);
        }
    };

    return (
        <div>
            <Navbar />
            <div className="container mt-5 px-5">
                {error && (
                    <div className="alert alert-danger">
                        <h4>Login Error</h4>
                        <p>{error}</p>
                        <div className="mt-2">
                            <small>Current URL: {window.location.href}</small>
                        </div>
                    </div>
                )}

                <button 
                    onClick={handleLogin}
                    className="btn btn-primary"
                    style={{ 
                        backgroundColor: "#0070d2", 
                        padding: "10px 20px",
                        fontSize: "1.1rem"
                    }}
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Redirecting to Salesforce...
                        </>
                    ) : 'Login with Salesforce'}
                </button>

                <div className="mt-4 p-3 bg-light rounded">
                    <h5>Debug Information:</h5>
                    <ul>
                        <li><strong>Environment:</strong> {isLocalhost ? 'Development' : 'Production'}</li>
                        <li><strong>Redirect URI:</strong> {redirectUri}</li>
                        <li><strong>Current URL:</strong> {window.location.href}</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;