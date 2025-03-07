const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const os = require("os");

const app = express();
const PORT = 5001;

// Enable CORS for React frontend
app.use(cors());

// Define the folder where JSON files are stored
const folderPath = path.join(__dirname, "src", "prompt-results");

// Function to get local IP address
const getLocalIP = () => {
    const interfaces = os.networkInterfaces();
    for (const iface of Object.values(interfaces)) {
        for (const info of iface) {
            if (info.family === "IPv4" && !info.internal) {
                return info.address;
            }
        }
    }
    return "localhost";
};

const localIP = getLocalIP(); // Fetch machine IP

// API to get list of JSON files
app.get("/api/files", (req, res) => {
    fs.readdir(folderPath, (err, files) => {
        if (err) {
            return res.status(500).json({ error: "Unable to scan directory" });
        }
        // Filter only .json files
        res.json(files.filter(file => file.endsWith(".json")));
    });
});

// API to fetch JSON file content
app.get('/api/files/:filename', (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(folderPath, filename);
    
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to read file' });
        }
        res.json(JSON.parse(data));
    });
});

// API to provide machine's IP address
app.get("/server-ip", (req, res) => {
    res.json({ ip: localIP });
});

// Start server with machine IP
app.listen(PORT, () => {
    console.log(`Server running at http://${localIP}:${PORT}`);
});
