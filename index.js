const { program } = require('commander')
const http = require('http')

program
    .option('-h, --host <char>', 'server address')
    .option('-p, --port <int>', 'server port')
    .option('-c, --cache <char>', 'path to directory, where will be cache files')

program.parse()

const options = program.opts()

if(!options.host) return console.error('Please enter server address')
if(!options.port) return console.error('Please enter server port')
if(!options.cache) return console.error('Please enter path to cache files')

const server = http.createServer((req, res) => {
    res.writeHead(200)
    res.end('Server is running!')
})

server.listen(options.port, options.host, () => {
    console.log(`Server working on http://${options.host}:${options.port}`)
})