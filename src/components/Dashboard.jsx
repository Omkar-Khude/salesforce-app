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
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Navbar from "./Navbar";

const clientId = '3MVG9VMBZCsTL9hmzOC9jLMI8oKB.Yn3GpI..S.TqvpWX6Dvo0l4Y_493GdZypcpAXjBHA7SCxQ==';
const redirectUri = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000/logged-in' 
  : 'https://salesforce-app1.onrender.com/logged-in';

const Dashboard = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleLogin = () => {
        setLoading(true);
        setError(null);
        try {
            const oauthUrl = `https://login.salesforce.com/services/oauth2/authorize?response_type=token&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}`;
            window.location.href = oauthUrl;
        } catch (err) {
            setError("Failed to initiate login. Please check your connection and try again.");
            setLoading(false);
            console.error("Login error:", err);
        }
    };

    return (
        <div>
            <Navbar />
            <div className="container mt-5 px-5">
                <div className="mt-5">
                    <h2 style={{ color: '#ff4d00' }}>Salesforce Switch</h2>
                    <p>
                        This tool provides an interface to easily enable and disable components
                        in your Salesforce Org.
                    </p>
                    
                    {error && (
                        <div className="alert alert-danger mt-3">
                            <strong>Error:</strong> {error}
                            <div className="mt-2">
                                <small>Redirect URI being used: {redirectUri}</small>
                            </div>
                        </div>
                    )}

                    <div className="d-flex align-items-center mt-4">
                        <button 
                            onClick={handleLogin} 
                            className="btn btn-primary"
                            style={{ 
                                backgroundColor: "#ff4d00", 
                                border: "none",
                                padding: "8px 20px"
                            }}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                    Logging in...
                                </>
                            ) : "LOGIN WITH SALESFORCE"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;