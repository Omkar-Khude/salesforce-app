
// import React, { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import Navbar from './Navbar';

// const LoggedIn = () => {
//     const [userInfo, setUserInfo] = useState(null);
//     const [loadingUserInfo, setLoadingUserInfo] = useState(true);
//     const [loadingMetadata, setLoadingMetadata] = useState(false);
//     const [error, setError] = useState({
//         hasError: false,
//         message: '',
//         details: null,
//         statusCode: null
//       });
//     const navigate = useNavigate();

//     useEffect(() => {
//         const urlParams = new URLSearchParams(window.location.hash.substring(1));
//         const accessToken = urlParams.get('access_token');

//         if (accessToken) {
//             axios.get(`${process.env.REACT_APP_BACKEND_URL}/userinfo?access_token=${accessToken}`)
//                 .then(response => {
//                     console.log('User Info Response:', response.data);
//                     setUserInfo(response.data);
//                 })
//                 .catch(error => console.error('Error fetching user info:', error))
//                 .finally(() => setLoadingUserInfo(false));
//         } else {
//             setLoadingUserInfo(false);
//         }
//     }, []);

//     const fetchValidationRules = async () => {
//         setLoadingMetadata(true);

//         const urlParams = new URLSearchParams(window.location.hash.substring(1));
//         const accessToken = urlParams.get('access_token');
//         const instanceUrl = urlParams.get('instance_url');

//         if (!accessToken || !instanceUrl) {
//             console.error('Missing instance URL or access token.');
//             setLoadingMetadata(false);
//             return;
//         }

//         try {
//             const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/fetchValidationRules`, {
//                 params: { accessToken, instanceUrl }
//             });

//             console.log('Validation Rules API Response:', response.data);

//             const validationRules = response.data?.map(rule => ({
//                 Id: rule.Id,
//                 ValidationName: rule.ValidationName,
//                 Active: rule.Active,
//                 Description: rule.Description,
//                 ObjectName: rule.EntityDefinition?.DeveloperName || "Unknown Object",
//                 ErrorMessage: rule.ErrorMessage,
//                 ErrorDisplayField: rule.ErrorDisplayField
//             })) || [];

//             const username = userInfo?.preferred_username || userInfo?.email || "Unknown User";

//             navigate('/metadata-display', { state: { validationRules, username, accessToken, instanceUrl } });

//         } catch (error) {
//             console.error('Error fetching validation rules:', error);
//         } finally {
//             setLoadingMetadata(false);
//         }
//     };
  
//     const handleLogout = () => {
//         localStorage.removeItem("userInfo");
//         navigate("/");
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
//                     <p className="text-muted">None of your organization information or data is captured or kept from running this tool.</p>

//                     <h5 style={{ color: "#ff4d00" }} className="mt-4">Logged in as:</h5>

//                     {loadingUserInfo ? (
//                         <p style={{ color: "gray" }}>Loading user info...</p>
//                     ) : userInfo ? (
//                         <div style={{ color: "grey" }} className="mt-2">
//                             <p className="mb-1"><strong>Username:</strong> {userInfo.preferred_username || "N/A"}</p>
//                         </div>
//                     ) : (
//                         <p style={{ color: "red" }}>Failed to load user info. Try logging in again.</p>
//                     )}

//                     <div className="mt-3">
//                         <button style={{backgroundColor:'rgba(255, 102, 0, 0.9)', color:'white',marginLeft:'50px', borderRadius:'0px'}}className="btn me-2" onClick={handleLogout}>LOGOUT</button>
//                         <button style={{backgroundColor:'rgba(255, 102, 0, 0.9)', color:'white', borderRadius:'0px'}} className="btn " onClick={fetchValidationRules} disabled={loadingMetadata}>
//                             {loadingMetadata ? "Fetching..." : "GET METADATA"}
//                         </button>
//                     </div>

//                     {loadingMetadata && (
//                         <div className="mt-3 text-center">
//                             <div className="spinner-border thick-spinner text-warning" role="status"
//                                 style={{ width: "60px", height: "60px", borderWidth: "6px" }}>
//                             </div>
//                             <div style={{ color: "#ff8c00", fontSize: "20px", fontWeight: "bold", marginTop: "10px" }}>
//                                 Querying metadata
//                             </div>
//                             <div style={{ color: "gray", fontSize: "16px", marginTop: "5px" }}>
//                                 Building a list of validation rules, workflows, and triggers...
//                             </div>
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default LoggedIn;


import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar';

const LoggedIn = () => {
    const [userInfo, setUserInfo] = useState(null);
    const [loadingUserInfo, setLoadingUserInfo] = useState(true);
    const [loadingMetadata, setLoadingMetadata] = useState(false);
    const [error, setError] = useState(null);
    
    const navigate = useNavigate();

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = urlParams.get('access_token');

        if (!accessToken) {
            setLoadingUserInfo(false);
            return;
        }

        // Store access token in localStorage for persistence
        localStorage.setItem('accessToken', accessToken);

        axios.get(`${process.env.REACT_APP_BACKEND_URL}/userinfo?access_token=${accessToken}`)
            .then(response => {
                console.log('User Info:', response.data);
                setUserInfo(response.data);
            })
            .catch(err => {
                console.error('Error fetching user info:', err);
                setError("Failed to load user info. Try logging in again.");
            })
            .finally(() => setLoadingUserInfo(false));
    }, []);

    const fetchValidationRules = async () => {
        setLoadingMetadata(true);
        setError(null);

        const accessToken = localStorage.getItem("accessToken");
        const instanceUrl = new URLSearchParams(window.location.hash.substring(1)).get("instance_url");

        if (!accessToken || !instanceUrl) {
            setError("Missing instance URL or access token.");
            setLoadingMetadata(false);
            return;
        }

        try {
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/fetchValidationRules`, {
                params: { accessToken, instanceUrl }
            });

            console.log('Validation Rules:', response.data);

            const validationRules = response.data?.map(rule => ({
                Id: rule.Id,
                ValidationName: rule.ValidationName,
                Active: rule.Active,
                Description: rule.Description,
                ObjectName: rule.EntityDefinition?.DeveloperName || "Unknown Object",
                ErrorMessage: rule.ErrorMessage,
                ErrorDisplayField: rule.ErrorDisplayField
            })) || [];

            const username = userInfo?.preferred_username || userInfo?.email || "Unknown User";

            navigate('/metadata-display', { state: { validationRules, username, accessToken, instanceUrl } });

        } catch (err) {
            console.error('Error fetching validation rules:', err);
            setError("Error fetching metadata. Please try again.");
        } finally {
            setLoadingMetadata(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        navigate("/");
    };

    return (
        <div>
            <Navbar />

            <div className="container mt-5 px-5">
                <h2 style={{ color: '#ff4d00' }}>Salesforce Switch</h2>
                <p>
                    This tool allows you to enable and disable components in your Salesforce Org, 
                    including Workflows, Triggers, and Validation Rules. Useful during data migrations.
                </p>
                <p className="text-muted">No data is stored or captured when using this tool.</p>

                <h5 style={{ color: "#ff4d00" }} className="mt-4">Logged in as:</h5>

                {loadingUserInfo ? (
                    <p style={{ color: "gray" }}>Loading user info...</p>
                ) : userInfo ? (
                    <div style={{ color: "grey" }} className="mt-2">
                        <p className="mb-1"><strong>Username:</strong> {userInfo.preferred_username || "N/A"}</p>
                    </div>
                ) : (
                    <p style={{ color: "red" }}>{error || "Failed to load user info. Try logging in again."}</p>
                )}

                <div className="mt-3">
                    <button
                        style={{ backgroundColor: 'rgba(255, 102, 0, 0.9)', color: 'white', marginLeft: '50px', borderRadius: '0px' }}
                        className="btn me-2"
                        onClick={handleLogout}
                    >
                        LOGOUT
                    </button>

                    <button
                        style={{ backgroundColor: 'rgba(255, 102, 0, 0.9)', color: 'white', borderRadius: '0px' }}
                        className="btn"
                        onClick={fetchValidationRules}
                        disabled={loadingMetadata}
                    >
                        {loadingMetadata ? "Fetching..." : "GET METADATA"}
                    </button>
                </div>

                {loadingMetadata && (
                    <div className="mt-3 text-center">
                        <div className="spinner-border thick-spinner text-warning" role="status"
                            style={{ width: "60px", height: "60px", borderWidth: "6px" }}>
                        </div>
                        <div style={{ color: "#ff8c00", fontSize: "20px", fontWeight: "bold", marginTop: "10px" }}>
                            Querying metadata
                        </div>
                        <div style={{ color: "gray", fontSize: "16px", marginTop: "5px" }}>
                            Building a list of validation rules, workflows, and triggers...
                        </div>
                    </div>
                )}

                {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
            </div>
        </div>
    );
};

export default LoggedIn;
