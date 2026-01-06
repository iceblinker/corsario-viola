import http from 'http';
import fs from 'fs';
import handler from './api/index.js';

const PORT = process.env.PORT || 3000;

const server = http.createServer(async (req, res) => {
    // Polyfill Vercel/Express methods
    res.status = (code) => {
        res.statusCode = code;
        return res;
    };
    res.send = (body) => {
        res.end(body);
        return res;
    };
    res.json = (body) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(body));
        return res;
    };

    try {
        console.log(`Request: ${req.method} ${req.url}`);
        await handler(req, res);
    } catch (err) {
        const errorLog = `
Time: ${new Date().toISOString()}
Error: ${err.message}
Stack: ${err.stack}
FULL: ${JSON.stringify(err, Object.getOwnPropertyNames(err))}
---------------------------------------------------
`;
        fs.appendFileSync('error.log', errorLog);
        console.error(errorLog);

        if (!res.headersSent) {
            res.statusCode = 500;
            res.end(`Internal Server Error: ${err.message}`);
        }
    }
});

server.listen(PORT, () => {
    console.log(`> Local server running on http://localhost:${PORT}`);
});
