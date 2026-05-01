const express = require('express');
const { spawn } = require('child_process');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// --- DATABASE (Temporary In-Memory) ---
const users = [];

// 1. OPTIMIZE ROUTE (Nee Python Engine Connection)
app.post('/api/optimize', (req, res) => {
    const { spend } = req.body;
    
    // Python script trigger chestunnam
    const pythonProcess = spawn('python', ['../quantum_engine/optimizer.py', spend]);

    pythonProcess.stdout.on('data', (data) => {
        res.json({ message: data.toString() });
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`Error: ${data}`);
        res.status(500).json({ error: "Quantum Engine Error" });
    });
});

// 2. SIGNUP ROUTE
app.post('/api/signup', (req, res) => {
    const { email, password } = req.body;
    if (users.find(u => u.email === email)) {
        return res.status(400).json({ success: false, message: "User already exists!" });
    }
    users.push({ email, password });
    console.log("New User Registered:", email);
    res.json({ success: true, message: "Account Created!" });
});

// 3. LOGIN ROUTE
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        console.log("User Logged In:", email);
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false, message: "Invalid Credentials!" });
    }
});

// --- START SERVER (OKKA SARE UNDALI) ---
app.listen(5000, () => {
    console.log('====================================');
    console.log('🚀 OptimumQ Backend Running on Port 5000');
    console.log('✅ Signup, Login, and Optimize APIs are Ready');
    console.log('====================================');
});