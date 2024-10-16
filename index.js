const { program } = require('commander');
const http = require('http');
const fs = require('fs').promises;
const path = require('path');
const superagent = require('superagent');

program
    .option('-h, --host <char>', 'server address')
    .option('-p, --port <int>', 'server port')
    .option('-c, --cache <char>', 'path to directory, where cache files will be stored');

program.parse();

const options = program.opts();

const getImagePath = (httpCode) => path.join(options.cache, `${httpCode}.jpg`);

const server = http.createServer(async (req, res) => {
    const httpCode = req.url.substring(1);

    if (!/^\d+$/.test(httpCode)) {
        return res.writeHead(404).end('Not found');
    }

    const imagePath = getImagePath(httpCode);

    try {
        if (req.method === 'GET') {
            try {
                const image = await fs.readFile(imagePath);
                return res.writeHead(200, { 'Content-Type': 'image/jpeg' }).end(image);
            } catch (err) {
                try {
                    const response = await superagent.get(`https://http.cat/${httpCode}`);
                    await fs.writeFile(imagePath, response.body); 
                    return res.writeHead(200, { 'Content-Type': 'image/jpeg' }).end(response.body);
                } catch (error) {
                    console.error('Помилка під час запиту до http.cat:', error.message);
                    return res.writeHead(404).end('Image was not found on the external server');
                }
            }
        } else if (req.method === 'PUT') {
            const data = [];
            req.on('data', chunk => data.push(chunk));
            req.on('end', async () => {
                try {
                    await fs.writeFile(imagePath, Buffer.concat(data));
                    res.writeHead(201).end('Created');
                } catch (err) {
                    console.error('Помилка при записі файлу:', err.message);
                    res.writeHead(500).end('Failed to save the image');
                }
            });
        } else if (req.method === 'DELETE') {
            try {
                await fs.unlink(imagePath);
                res.writeHead(200).end('Deleted');
            } catch (err) {
                if (err.code === 'ENOENT') {
                    res.writeHead(404).end('Image not found');
                } else {
                    console.error('Помилка при видаленні файлу:', err.message);
                    res.writeHead(500).end('Failed to delete the image');
                }
            }
        } else {
            res.writeHead(405).end('Method is not allowed');
        }
    } catch (error) {
        console.error('Внутрішня помилка сервера:', error.message);
        res.writeHead(500).end('Internal Server Error');
    }
});


server.listen(options.port, options.host, () => {
    console.log(`Сервер працює на http://${options.host}:${options.port}`);
});
