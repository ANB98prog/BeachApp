import express from 'express'
import path from 'path'

const __dirname = path.resolve()

const app = express()

app.use(express.static('static'))

app.listen(3000)

app.get('/', (req, res)=> {
    res.sendFile(path.join(__dirname, 'static', 'index.html'))
})

app.get('/tovars.html', (req, res)=> {
    res.sendFile(path.join(__dirname, 'static', 'tovars.html'))
})



