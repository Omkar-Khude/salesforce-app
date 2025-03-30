
import React, { useState } from "react";
import Navbar from "./Navbar";
import { useLocation } from 'react-router-dom';
import axios from "axios";

const MetadataDisplay = () => {
    const location = useLocation();
    const [validationRules, setValidationRules] = useState(location.state?.validationRules || []);
    const [selectedRule, setSelectedRule] = useState(null);
    const username = location.state?.username || "Unknown User";
    const instanceUrl = location.state?.instanceUrl;
    const accessToken = location.state?.accessToken;
    const [deployStatus, setDeployStatus] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showNoChangesModal, setShowNoChangesModal] = useState(false);
    const [showRollbackModal, setShowRollbackModal] = useState(false);
    const [rollbackStatus, setRollbackStatus] = useState(null);

    const uniqueObjects = [...new Set(validationRules.map(rule => rule.ObjectName))];

    const toggleRule = (id) => {
        setValidationRules(prevRules =>
            prevRules.map(rule =>
                rule.Id === id ? { ...rule, Active: !rule.Active, isModified: true } : rule
            )
        );
    };

    const updateAllRulesForObject = (objectName, enable) => {
        setValidationRules(prevRules =>
            prevRules.map(rule =>
                rule.ObjectName === objectName ? { ...rule, Active: enable, isModified: true } : rule
            )
        );
    };

    const deployChanges = async () => {
        if (!accessToken || !instanceUrl) {
            alert("Missing authentication details");
            return;
        }
    
        const modifiedRules = validationRules.filter(rule => rule.isModified);
    
        if (modifiedRules.length === 0) {
            setShowNoChangesModal(true);
            return;
        }
    
        console.log("🚀 Modified Rules Sending to API:", modifiedRules);
    
        setIsLoading(true);
        try {
            const response = await axios.patch("http://localhost:5000/updateValidationRules", {
                accessToken,
                instanceUrl,
                validationRules: modifiedRules,
            });
    
            console.log("✅ Response from API:", response.data);
            setShowSuccessModal(true);
            
            setValidationRules(prevRules =>
                prevRules.map(rule => ({ ...rule, isModified: false }))
            );
        } catch (error) {
            console.error("❌ Error deploying changes:", error.response ? error.response.data : error);
            setDeployStatus("Failed to update validation rules.");
        } finally {
            setIsLoading(false);
        }
    };
    const rollbackChanges = async () => {
        if (!accessToken || !instanceUrl) {
            alert("Missing authentication details");
            return;
        }
    
        
        const userConfirmed = window.confirm(
            "This will rollback all validation rules to their original state from when they were first queried.\n\nDo you want to proceed?"
        );
    
        if (!userConfirmed) {
            return;
        }
    
        setIsLoading(true);
        try {
            const response = await axios.post("http://localhost:5000/rollbackValidationRules", {
                accessToken,
                instanceUrl
            });
    
            console.log("✅ Rollback Response:", response.data);
            
            if (response.data.success) {
                const fetchResponse = await axios.get("http://localhost:5000/fetchValidationRules", {
                    params: { accessToken, instanceUrl }
                });
                
                setValidationRules(fetchResponse.data.map(rule => ({ 
                    ...rule, 
                    isModified: false,
                    ObjectName: rule.EntityDefinition?.DeveloperName 
                })));
                
                setRollbackStatus("Rollback completed successfully");
            } else {
                setRollbackStatus("Rollback partially completed with some errors");
            }
        } catch (error) {
            console.error("❌ Error during rollback:", error.response ? error.response.data : error);
            setRollbackStatus("Failed to complete rollback");
        } finally {
            setIsLoading(false);
            setShowRollbackModal(true);
        }
    };

    return (
        <div>
            <Navbar />
            <div className="container mt-5 px-5">
                <h2 style={{ color: "#ff4d00" }}>Salesforce Switch</h2>
                <p style={{ color: "#ff4d00" }}>{username}</p>
                <ul className="nav nav-tabs">
                    <li className="nav-item">
                        <a className="nav-link active" href="#">Validation Rules</a>
                    </li>
                </ul>
    
                {validationRules.length === 0 ? (
                    <div className="alert alert-warning mt-3">
                        There don't appear to be any validation rules for your Org.
                    </div>
                ) : (
                    <div className="mt-3">
                        <div className="d-flex justify-content-center gap-3">
                            <button 
                                style={{ backgroundColor: "#f0ad4e", color:"white",height:"27px",fontSize:"13px",paddingTop:"4px" }}
                                className="btn btn-warning" 
                                onClick={rollbackChanges}
                                disabled={isLoading}
                            >
                                {isLoading ? "ROLLING BACK..." : "ROLLBACK TO ORIGINAL"}
                            </button>
                            <button 
                                style={{ backgroundColor: "#5bc0de", color:"white",height:"27px",fontSize:"13px",paddingTop:"4px"  }}
                                className="btn btn-info" 
                                onClick={deployChanges} 
                                disabled={isLoading}
                            >
                                {isLoading ? "DEPLOYING..." : "DEPLOY CHANGES"}
                            </button>
                        </div>
                        {uniqueObjects.map((objectName) => (
                            <div key={objectName} className="mt-4">
                                <div className="d-flex justify-content-between align-items-center">
                                    <h6 style={{ color: "#999a9b" }}><strong>{objectName}</strong></h6>
                                    <div>
                                        <button style={{ backgroundColor: "#5cb85c",color:"white",fontSize:"13px",height:"25px",paddingTop:"2px"}} className="btn btn-success me-2" onClick={() => updateAllRulesForObject(objectName, true)}>
                                            ENABLE ALL
                                        </button>
                                        <button style={{ backgroundColor: "#d9534f",color:"white",fontSize:"13px",height:"25px",paddingTop:"2px" }}className="btn btn-danger" onClick={() => updateAllRulesForObject(objectName, false)}>
                                            DISABLE ALL
                                        </button>
                                    </div>
                                </div>
                                <table className="table mt-3">
                                    <tbody>
                                        {validationRules.filter(rule => rule.ObjectName === objectName).map(rule => (
                                            <tr key={rule.Id}>
                                                <td style={{ cursor: "pointer", color: "#999a9b", fontSize:"12px",fontWeight:"500"}} onClick={() => setSelectedRule(rule)}>
                                                    {rule.ValidationName}
                                                </td>
                                                <td style={{ textAlign: "right" }}>
                                                    <div className="d-flex justify-content-end mt-2">
                                                        <div
                                                            className="switch-container"
                                                            onClick={() => toggleRule(rule.Id)}
                                                            style={{
                                                                backgroundColor: rule.Active ? "#428bca" : "#f0ad4e",
                                                                position: "relative",
                                                                width: "50px",
                                                                height: "16px",
                                                                borderRadius: "20px",
                                                                cursor: "pointer",
                                                                transition: "background-color 0.3s ease-in-out",
                                                            }}
                                                        >
                                                            <div
                                                                style={{
                                                                    width: "50%",
                                                                    height: "100%",
                                                                    borderRadius: "20px",
                                                                    backgroundColor: "white",
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    justifyContent: "center",
                                                                    fontSize: "12px",
                                                                    fontWeight: "bold",
                                                                    transition: "all 0.3s ease",
                                                                    position: "absolute",
                                                                    left: rule.Active ? "50%" : "0%",
                                                                    color: rule.Active ? "#007bff" : "#f4a261",
                                                                }}
                                                            >
                                                                {rule.Active ? "ON" : "OFF"}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ))}
                    </div>
                )}

                {selectedRule && (
                    <div className="modal" style={{ display: "block", backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 style={{ color: '#ff4d00' }} className="modal-title">
                                        {selectedRule.ValidationName}
                                    </h5>
                                    <button type="button" className="btn-close" onClick={() => setSelectedRule(null)}></button>
                                </div>
                                <div className="modal-body" style={{ color: "#999a9b" }}>
                                    <p><strong>Description</strong>: {selectedRule.Description || "No description available."}</p>
                                    <hr />
                                    <p><strong>Error Condition Formula</strong>: {selectedRule.ErrorConditionFormula ? selectedRule.ErrorConditionFormula : ""}</p>
                                    <hr />
                                    <p><strong>Error Display Field</strong>: {selectedRule.ErrorDisplayField}</p>
                                    <hr />
                                    <p><strong>Error Message</strong>: {selectedRule.ErrorMessage}</p>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setSelectedRule(null)}>
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {showNoChangesModal && (
                    <div className="modal" style={{ display: "block", backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header" style={{ backgroundColor: "#d9534f", color: "white" }}>
                                    <h5 className="modal-title">No Changes Detected</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowNoChangesModal(false)}></button>
                                </div>
                                <div className="modal-body">
                                    <p>The app wasn't able to detect any changes to deploy. Please make some changes and try again.</p>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowNoChangesModal(false)}>
                                        CLOSE
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {showRollbackModal && (
                    <div className="modal" style={{ display: "block", backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header" style={{ backgroundColor: "#f0ad4e", color: "white" }}>
                                    <h5 className="modal-title">Rollback Status</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowRollbackModal(false)}></button>
                                </div>
                                <div className="modal-body">
                                    <p>{rollbackStatus}</p>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowRollbackModal(false)}>
                                        CLOSE
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {isLoading && (
                    <div className="modal" style={{ display: "block", backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header" style={{ backgroundColor: "#5cb85c", color: "white" }}>
                                    <h5 className="modal-title">Processing</h5>
                                </div>
                                <div className="modal-body">
                                    <div className="progress">
                                        <div 
                                            className="progress-bar progress-bar-striped progress-bar-animated" 
                                            role="progressbar" 
                                            style={{ width: "100%", backgroundColor: "#5cb85c" }}
                                        >
                                            Please wait...
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {showSuccessModal && (
                    <div className="modal" style={{ display: "block", backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header" style={{ backgroundColor: "#5cb85c", color: "white" }}>
                                    <h5 className="modal-title">Complete</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowSuccessModal(false)}></button>
                                </div>
                                <div className="modal-body">
                                    <p>All changes have been successfully deployed.</p>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowSuccessModal(false)}>
                                        CLOSE
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MetadataDisplay;