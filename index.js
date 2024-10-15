const { program } = require('commander')
const http = require('http')
const fs = require('fs')

program
    .option('-h, --host <char>', 'server address')
    .option('-p, --port <int>', 'server port')
    .option('-c, --cache <char>', 'path to directory, where will be cache files')

program.parse()

const options = program.opts()

if(!options.host) return console.error('Please enter server address')
if(!options.port) return console.error('Please enter server port')
if(!options.cache) return console.error('Please enter path to cache files')

const server = http.createServer(async (req, res) => {
    res.writeHead(200)
    res.end('Server is running!')

    const httpCode = req.url.substring(1); 

    if (!/^\d+$/.test(httpCode)) {
        return res.writeHead(404).end('Не знайдено');
    }

    const imagePath = getImagePath(httpCode);
    try {
        if (req.method === 'GET') {
            const image = await fs.readFile(imagePath);
            res.writeHead(200, { 'Content-Type': 'image/jpeg' }).end(image);
        } else if (req.method === 'PUT') {
            const data = [];
            req.on('data', chunk => data.push(chunk));
            req.on('end', async () => {
                await fs.writeFile(imagePath, Buffer.concat(data));
                res.writeHead(201).end('Створено');
            });
        } else if (req.method === 'DELETE') {
            await fs.unlink(imagePath);
            res.writeHead(200).end('Видалено');
        } else {
            res.writeHead(405).end('Метод не дозволений');
        }
    } catch (error) {
        if (err.code === 'ENOENT') {
            res.writeHead(404).end('Зображення не знайдено');
        } else {
            res.writeHead(500).end('Внутрішня помилка сервера'); 
        }
    }
    


})

server.listen(options.port, options.host, () => {
    console.log(`Server working on http://${options.host}:${options.port}`)
})