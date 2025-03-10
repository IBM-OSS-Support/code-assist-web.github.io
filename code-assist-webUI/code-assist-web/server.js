const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const os = require("os");
const { data } = require("react-router-dom");

const app = express();
const PORT = 5001;

// Enable CORS for all routes
app.use(cors());

// Define the folder where JSON files are stored
const folderPath = path.join(__dirname, "src", "prompt-results");

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

app.get('/api/files/:filename', (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(folderPath, filename); // Update the file to use folderPath
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to read file' });
        }
        res.json(JSON.parse(data));
    });
});

// Fetch Fyre machine IP and log it
const getMachineIP = () => {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                console.log("interfaces:",interfaces, "iface:",iface, "iface.internal:", iface.internal);
                
                return iface.address;
            }
        }
    }
    return 'localhost';
};

const machineIP = getMachineIP();
console.log(`Fyre machine IP: ${machineIP}`, `PORT: ${PORT}`);

// API to get server IP
app.get("/api/files", (req, res) => {
    res.json({ ip: machineIP, PORT });
});

app.listen(PORT, () => {
    console.log(`Server running at http://${machineIP}:${PORT}`);
});