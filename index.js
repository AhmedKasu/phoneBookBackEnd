const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());
morgan.token("body", (req) => JSON.stringify(req.body));
app.use(morgan("tiny"));

const persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

const requestTime = () => {
  const today = new Date();
  const day = today.getDate();
  today.setDate(day);

  return ` ${today}`;
};

app.get("/api/persons", (req, res) => {
  res.send(persons);
});

app.get("/info", (req, res) => {
  res.send(`<p>Phonebook has info for ${persons.length} people</p>
    <p>${requestTime()}</p>`);
});

app.get("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  const person = persons.find((person) => person.id === id);
  if (!person) {
    return res.status(404).send({ error: "person not found" });
  }
  res.send(person);
});

app.delete("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  const person = persons.find((person) => person.id === id);
  if (!person) {
    return res
      .status(404)
      .send({ error: "Person with the given id was not found" });
  }

  const index = persons.indexOf(person);
  persons.splice(index, 1);

  res.status(204).send(person);
});

app.post("/api/persons", morgan(":body"), (req, res) => {
  const id = Math.floor(Math.random() * (50 - 10) + 10);
  const person = {
    id: id,
    name: req.body.name,
    number: req.body.number,
  };
  if (!req.body.name || !req.body.number) {
    return res.status(404).send({ error: "name input must be included" });
  }

  const alreadyExists = persons.find((person) => {
    return person.name === req.body.name;
  });
  if (alreadyExists) {
    return res.status(404).send({ error: " name must be unique" });
  } else {
    persons.push(person);
    res.send(person);
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
