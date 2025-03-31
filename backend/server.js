
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());
const jsforce = require('jsforce');

const PORT = 5000;

const originalRulesStore = new Map();

app.get('/health', (req, res) => {
    res.status(200).json({ status: "OK" });
});

app.get('/userinfo', async (req, res) => {
    const accessToken = req.query.access_token;

    if (!accessToken) {
        return res.status(400).json({ error: "Missing access token" });
    }

    try {
        const response = await axios.get('https://login.salesforce.com/services/oauth2/userinfo', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        res.json(response.data);
        console.log(accessToken);
    } catch (error) {
        res.status(error.response?.status || 500).json({ error: error.message });
    }
});


app.get('/fetchValidationRules', async (req, res) => {
    try {
        const { accessToken, instanceUrl } = req.query;
        
        if (!accessToken || !instanceUrl) {
            return res.status(400).json({ error: "Missing access token or instance URL" });
        }

        const salesforceUrl = `${instanceUrl}/services/data/v59.0/tooling/query/?q=SELECT+Id,ValidationName,Active,Description,EntityDefinition.DeveloperName,ErrorDisplayField,ErrorMessage,LastModifiedDate,CreatedDate+FROM+ValidationRule`;

        const response = await axios.get(salesforceUrl, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        const rules = response.data.records;
        const storeKey = `${instanceUrl}-${accessToken.substring(0, 10)}`;
        originalRulesStore.set(storeKey, JSON.parse(JSON.stringify(rules)));

        console.log("Fetched Validation Rules:", response.data.records);
        res.json(response.data.records);
    } catch (error) {
        console.error("Error fetching validation rules:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to fetch validation rules" });
    }
});

app.post('/rollbackValidationRules', async (req, res) => {
    const { accessToken, instanceUrl } = req.body;

    if (!accessToken || !instanceUrl) {
        return res.status(400).json({ error: "Missing access token or instance URL" });
    }

    try {
        const storeKey = `${instanceUrl}-${accessToken.substring(0, 10)}`;
        const originalRules = originalRulesStore.get(storeKey);

        if (!originalRules || originalRules.length === 0) {
            return res.status(404).json({ error: "Original validation rules not found" });
        }

        const results = [];

        for (const rule of originalRules) {
            const updatePayload = {
                Metadata: {
                    fullName: rule.ValidationName,
                    active: rule.Active,
                    errorConditionFormula: rule.ErrorConditionFormula || "true",
                    errorMessage: rule.ErrorMessage || "Validation rule error",
                }
            };

            try {
                const response = await axios.patch(
                    `${instanceUrl}/services/data/v60.0/tooling/sobjects/ValidationRule/${rule.Id}`,
                    updatePayload,
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                            "Content-Type": "application/json",
                        }
                    }
                );

                results.push({
                    ruleId: rule.Id,
                    status: "success",
                    activeStatus: rule.Active,
                });

            } catch (sfError) {
                console.error("Salesforce API Error:", sfError.response?.data || sfError.message);
                results.push({
                    ruleId: rule.Id,
                    status: "failed",
                    error: sfError.response?.data || sfError.message,
                });
            }
        }

        res.json({ success: true, results });
    } catch (error) {
        console.error("General Server Error:", error);
        res.status(500).json({ error: "Failed to rollback validation rules.", details: error.message });
    }
});

app.patch("/updateValidationRules", async (req, res) => {
    const { accessToken, instanceUrl, validationRules } = req.body;

    if (!accessToken || !instanceUrl || !validationRules || validationRules.length === 0) {
        return res.status(400).json({ error: "Missing required data" });
    }

    try {
        const results = [];

        for (const rule of validationRules) {
            const updatePayload = {
                Metadata: {
                    fullName: rule.ValidationName,
                    active: rule.Active,
                    errorConditionFormula: rule.ErrorConditionFormula || "true",
                    errorMessage: rule.ErrorMessage || "Validation rule error", 
                }
            };

            console.log("🔍 Sending update request to Salesforce for rule:", rule.ValidationName);
            console.log("📌 Payload:", JSON.stringify(updatePayload, null, 2));

            try {
                const response = await axios.patch(
                    `${instanceUrl}/services/data/v60.0/tooling/sobjects/ValidationRule/${rule.Id}`,
                    updatePayload,
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                            "Content-Type": "application/json",
                        }
                    }
                );

                console.log("✅ Salesforce Update Response:", response.data);

                const verifyResponse = await axios.get(
                    `${instanceUrl}/services/data/v60.0/tooling/query/?q=SELECT+Id,Active,errorConditionFormula+FROM+ValidationRule+WHERE+Id='${rule.Id}'`,
                    {
                        headers: { Authorization: `Bearer ${accessToken}` }
                    }
                );

                const updatedRule = verifyResponse.data.records[0];

                console.log(`🔍 Verified Rule [${rule.Id}]:`, updatedRule);

                results.push({
                    ruleId: rule.Id,
                    status: updatedRule?.Active === rule.Active ? "success" : "failed",
                    activeStatus: updatedRule?.Active,
                    formula: updatedRule?.errorConditionFormula,
                });

            } catch (sfError) {
                console.error("❌ Salesforce API Error:", sfError.response?.data || sfError.message);
                results.push({
                    ruleId: rule.Id,
                    status: "failed",
                    error: sfError.response?.data || sfError.message,
                });
            }
        }

        res.json({ success: true, results });
    } catch (error) {
        console.error("❌ General Server Error:", error);
        res.status(500).json({ error: "Failed to update validation rules.", details: error.message });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
