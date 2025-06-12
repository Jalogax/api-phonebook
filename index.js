const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const app = express()
app.use(cors())

// Middleware para capturar el body de la respuesta
app.use((req, res, next) => {
  const originalSend = res.send;

  res.send = function (body) {
    res.body = body; // Captura el body antes de enviarlo
    return originalSend.call(this, body);
  };

  next();
});

// Morgan token para mostrar el body de la respuesta
morgan.token('res-body', (req, res) => {
  return res.body ? JSON.stringify(res.body) : '';
});

// Configuración de Morgan con el nuevo token
app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms :res-body')
);

app.use(express.json())

let persons = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find(person => person.id === id)
  

  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(person => person.id !== id)

  response.status(204).end()
})

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
}

const generateId = () => {
  const maxId = persons.length > 0
    ? getRandomInt(4,10000)
    : 0
  return maxId + 1
}

app.post('/api/persons', (request, response) => {
  const body = request.body

  if (!body) {
    return response.status(400).json({ 
      error: 'data missing' 
    })
  }

  if (!body.name) {
    return response.status(400).json({ 
      error: 'name missing' 
    })
  }

  if (!body.number) {
    return response.status(400).json({ 
      error: 'number missing' 
    })
  }
  
  if (persons.some(person => person.name.toLowerCase() === body.name.toLowerCase())) {
    return response.status(400).json({ 
      error: 'name must be unique' 
    })
  }

  const person = {
    name: body.name,
    number: body.number,
    id: generateId(),
  }

  persons = persons.concat(person)

  response.json(person)
})

app.get('/info', (request, response) => {
    const date = new Date();
    const options = { 
        weekday: 'short', 
        month: 'short', 
        day: '2-digit', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit', 
        timeZoneName: 'long' 
    };
    
    const today = date.toLocaleString('en-US', options)

    response.send(`<p>Phonebook has info for ${persons.length} people</p><br/><p>${today}</p>`)
    response.json(persons)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})