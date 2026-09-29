// services/qualityAssessment.js
const { spawn } = require('child_process');
const path = require('path');

exports.analyzeFoodImage = (imagePath) => {
    return new Promise((resolve, reject) => {
        const scriptPath = path.join(__dirname, '../ml/assess_quality.py');

        // Since Docker sets the ENV PATH, 'python3' will automatically use the venv on Render.
        // If testing locally on Windows, you can add PYTHON_PATH=python in your local .env file.
        const pythonPath = process.env.PYTHON_PATH || 'python3';

        const pythonProcess = spawn(pythonPath, [scriptPath, imagePath]);

        let outputData = '';

        pythonProcess.stdout.on('data', (data) => {
            outputData += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            // Logs PyTorch progress bars without crashing the app
            console.warn(`Vision ML Log: ${data}`);
        });

        // IMPORTANT: handle spawn errors (missing python, bad path, etc.)
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
