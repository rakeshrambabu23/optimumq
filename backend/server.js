const express = require('express');
const { spawn } = require('child_process');
const cors = require('cors');
const path = require('path');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// 1. FRONTEND SERVING
app.use(express.static(path.join(__dirname, 'public')));

// --- DATABASE (Temporary In-Memory) ---
const users = [];

// 1. OPTIMIZE ROUTE (Quantum Engine Connection)
app.post('/api/optimize', (req, res) => {
    const { spend, provider } = req.body;

    console.log(`\n⚛️  Quantum optimization started`);
    console.log(`   Provider : ${provider || 'N/A'}`);
    console.log(`   Spend    : $${spend}`);

    // Render lo 'python3' use cheyali (locally 'python' aithe change chey)
    const pythonProcess = spawn('python3', ['optimizer.py', spend]);

    // ✅ FIX: stdout chunks ni buffer lo collect chesi, process close ainaaka parse cheyali
    // Old code: data event lo directly parse — partial chunk vasthe JSON broken avthundi
    let outputBuffer = '';

    pythonProcess.stdout.on('data', (data) => {
        outputBuffer += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
        // Qiskit deprecation warnings ni ignore cheyali — real errors matrame log chey
        const msg = data.toString();
        if (!msg.includes('DeprecationWarning') && !msg.includes('UserWarning')) {
            console.error(`Quantum Engine stderr: ${msg}`);
        }
    });

    pythonProcess.on('close', (code) => {
        console.log(`   Python exit code: ${code}`);
        console.log(`   Raw output: ${outputBuffer.trim()}`);

        if (code !== 0 && !outputBuffer.trim()) {
            if (!res.headersSent) {
                return res.status(500).json({ error: 'Quantum engine crashed. optimizer.py check chey.' });
            }
            return;
        }

        try {
            const resultObj = JSON.parse(outputBuffer.trim());
            console.log(`✅ Optimization complete — Savings: $${resultObj.total_savings}`);
            res.json(resultObj);
        } catch (err) {
            console.error('JSON Parse Error:', err.message);
            console.error('Raw output was:', outputBuffer);
            if (!res.headersSent) {
                res.status(500).json({
                    error: 'Python output JSON ga parse avvaledu',
                    raw: outputBuffer.trim()
                });
            }
        }
    });

    // Timeout: 30 seconds lo Python respond avvakapote kill chey
    const timeout = setTimeout(() => {
        pythonProcess.kill();
        if (!res.headersSent) {
            res.status(504).json({ error: 'Quantum engine timeout (30s). Qiskit install check chey.' });
        }
    }, 30000);

    pythonProcess.on('close', () => clearTimeout(timeout));
});

// 2. SIGNUP ROUTE
app.post('/api/signup', (req, res) => {
    const { email, password } = req.body;
    if (users.find(u => u.email === email)) {
        return res.status(400).json({ success: false, message: 'User already exists!' });
    }
    users.push({ email, password });
    console.log('New User Registered:', email);
    res.json({ success: true, message: 'Account Created!' });
});

// 3. LOGIN ROUTE
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
        console.log('User Logged In:', email);
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false, message: 'Invalid Credentials!' });
    }
});

// 5. HEALTH CHECK (backend running confirm cheskovadam kosam)
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: '🚀 OptimumQ backend is running!' });
});

// 6. CATCH-ALL ROUTE (React/SPA support)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// --- START SERVER ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log('====================================');
    console.log(`🚀 OptimumQ Backend Running on Port ${PORT}`);
    console.log('✅ Signup, Login, Optimize, Health APIs Ready');
    console.log(`🌐 http://localhost:${PORT}/api/health`);
    console.log('====================================');
});