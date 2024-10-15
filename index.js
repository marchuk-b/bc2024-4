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

    switch (req.method) {
        case 'GET':
            try {
                const data = await fs.readFile(filePath);
                res.writeHead(200, { 'Content-Type': 'image/jpeg' });
                res.end(data);
            } catch (error) {
                console.log(error)
            }
            break;
    
    }


})

server.listen(options.port, options.host, () => {
    console.log(`Server working on http://${options.host}:${options.port}`)
})