import express from 'express'

const port = process.env.PORT || 3000

const app = express()

app.get('/', (req, res) => res.send('<div style="font-family: Helvetica; margin: auto; width: 100%; font-size: 30px"><b>Teikei</b> Migrations</div>'))
app.listen(port, () => console.log(`Migrations Web App listening on port ${port}.`))
