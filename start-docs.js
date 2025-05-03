const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const { exec } = require('child_process');

const PORT = 3000;

// MIME types for different file extensions
const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.md': 'text/markdown',
    '.ico': 'image/x-icon'
};

// Function to open browser based on platform
function openBrowser(url) {
    // Determine the command based on the operating system
    let command;
    
    switch (process.platform) {
        case 'darwin': // macOS
            command = `open "${url}"`;
            break;
        case 'win32': // Windows
            command = `start "" "${url}"`;
            break;
        default: // Linux and others
            command = `xdg-open "${url}"`;
            break;
    }
    
    // Execute the command
    exec(command, (error) => {
        if (error) {
            console.log(`无法自动打开浏览器: ${error.message}`);
            console.log(`请手动访问: ${url}`);
        }
    });
}

// Create the HTTP server
const server = http.createServer((req, res) => {
    console.log(`${req.method} ${req.url}`);

    // Parse the URL
    const parsedUrl = url.parse(req.url);
    
    // Extract the pathname (removing the query string)
    let pathname = parsedUrl.pathname;
    
    // Default to index.html if path is '/'
    if (pathname === '/') {
        pathname = '/index.html';
    }
    
    // Resolve the filepath relative to the current directory
    const filepath = path.join(__dirname, pathname);
    
    // Get the file extension
    const ext = path.extname(filepath);
    
    // Check if the file exists
    fs.access(filepath, fs.constants.F_OK, (err) => {
        if (err) {
            // File does not exist
            res.statusCode = 404;
            res.setHeader('Content-Type', 'text/html');
            res.end(`<h1>404 Not Found</h1><p>The requested URL ${pathname} was not found on this server.</p>`);
            return;
        }
        
        // File exists, read it
        fs.readFile(filepath, (err, data) => {
            if (err) {
                // Error reading file
                res.statusCode = 500;
                res.setHeader('Content-Type', 'text/html');
                res.end(`<h1>500 Internal Server Error</h1><p>Error reading the file: ${err.message}</p>`);
                return;
            }
            
            // File read successfully, set the content type based on file extension
            const contentType = MIME_TYPES[ext] || 'application/octet-stream';
            res.statusCode = 200;
            res.setHeader('Content-Type', contentType);
            res.end(data);
        });
    });
});

// Start the server
server.listen(PORT, () => {
    const url = `http://localhost:${PORT}`;
    
    console.log(`
==================================================
  前端组件需求与实现文档服务器已启动
==================================================

  访问地址: ${url}
  
  浏览器将自动打开，如未打开请手动访问上述地址

  按 Ctrl+C 停止服务器
==================================================
`);

    // Open browser after a short delay
    setTimeout(() => {
        openBrowser(url);
    }, 1000);
}); 