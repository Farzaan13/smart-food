// services/qualityAssessment.js
const { spawn } = require('child_process');
const path = require('path');

exports.analyzeFoodImage = (imagePath) => {
    return new Promise((resolve, reject) => {
        const scriptPath = path.join(__dirname, '../ml/assess_quality.py');

        // Use PYTHON_PATH from env if set (for hosting), else fall back to local venv
        const pythonPath = process.env.PYTHON_PATH || path.join(
            __dirname,
            '..',
            'venv',
            process.platform === 'win32' ? 'Scripts' : 'bin',
            process.platform === 'win32' ? 'python.exe' : 'python'
        );

        const pythonProcess = spawn(pythonPath, [scriptPath, imagePath]);

        let outputData = '';

        pythonProcess.stdout.on('data', (data) => {
            outputData += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            console.warn(`Vision ML Log: ${data}`);
        });

        // ✅ IMPORTANT: handle spawn errors (missing python, bad path, etc.)
        pythonProcess.on('error', (err) => {
            console.error('Failed to start Python process:', err.message);
            reject('Python not available on this environment');
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                return reject(`Python script exited with code ${code}`);
            }
            try {
                const result = JSON.parse(outputData);
                resolve(result);
            } catch (err) {
                reject("Failed to parse ML Vision output");
            }
        });
    });
};