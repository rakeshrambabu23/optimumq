const express = require('express');
const { spawn } = require('child_process');
const cors = require('cors');
const path = require('path');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// 1. FRONTEND SERVING
// Files anni bayate (root folder lo) unnayi kabatti '.' ni point chesthunnam
app.use(express.static(path.join(__dirname, '.')));

// --- DATABASE (Temporary In-Memory) ---
const users = [];

// 2. OPTIMIZE ROUTE (Quantum Engine Connection)
app.post('/api/optimize', (req, res) => {
    const { spend, provider } = req.body;

    console.log(`\n⚛️  Quantum optimization started`);
    console.log(`   Provider : ${provider || 'N/A'}`);
    console.log(`   Spend    : $${spend}`);

    // Render environment lo python3 use cheyali
    const pythonProcess = spawn('python3', ['optimizer.py', spend]);

    let outputBuffer = '';

    pythonProcess.stdout.on('data', (data) => {
        outputBuffer += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
        const msg = data.toString();
        if (!msg.includes('DeprecationWarning') && !msg.includes('UserWarning')) {
            console.error(`Quantum Engine stderr: ${msg}`);
        }
    });

    pythonProcess.on('close', (code) => {
        console.log(`   Python exit code: ${code}`);
        if (code !== 0 && !outputBuffer.trim()) {
            if (!res.headersSent) {
                return res.status(500).json({ error: 'Quantum engine crashed.' });
            }
            return;
        }

        try {
            const resultObj = JSON.parse(outputBuffer.trim());
            console.log(`✅ Optimization complete — Savings: $${resultObj.total_savings}`);
            res.json(resultObj);
        } catch (err) {
            if (!res.headersSent) {
                res.status(500).json({
                    error: 'Python output JSON ga parse avvaledu',
                    raw: outputBuffer.trim()
                });
            }
        }
    });

    const timeout = setTimeout(() => {
        pythonProcess.kill();
        if (!res.headersSent) {
            res.status(504).json({ error: 'Quantum engine timeout (30s).' });
        }
    }, 30000);

    pythonProcess.on('close', () => clearTimeout(timeout));
});

// 3. SIGNUP & LOGIN ROUTES
app.post('/api/signup', (req, res) => {
    const { email, password } = req.body;
    if (users.find(u => u.email === email)) {
        return res.status(400).json({ success: false, message: 'User already exists!' });
    }
    users.push({ email, password });
    res.json({ success: true, message: 'Account Created!' });
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false, message: 'Invalid Credentials!' });
    }
});

// 4. HEALTH CHECK
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: '🚀 OptimumQ backend is running!' });
});

// 5. CATCH-ALL ROUTE
// Regex use chesi index.html ni root folder nundi serve chesthunnam
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// --- START SERVER ---
const PORT = process.env.PORT || 5000; // Render dynamic port assign chestundi[cite: 1]
app.listen(PORT, () => {
    console.log('====================================');
    console.log(`🚀 OptimumQ Backend Running on Port ${PORT}`);
    console.log('====================================');
});
