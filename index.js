require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const app = express();
const Person = require("./models/person");
const { response } = require("express");
const person = require("./models/person");
const { count } = require("./models/person");

app.use(express.static("build"));
app.use(cors());
app.use(express.json());
morgan.token("body", (req) => JSON.stringify(req.body));
app.use(morgan("tiny"));

app.get("/api/persons", (req, res, next) => {
  Person.find({})
    .then((persons) => {
      res.send(persons);
    })
    .catch((error) => next(error));
});

app.get("/api/persons/:id", (req, res, next) => {
  person
    .findById(req.params.id)
    .then((person) => {
      if (person) {
        res.send(person);
      } else {
        res.status(404).end;
      }
    })
    .catch((error) => next(error));
});

app.post("/api/persons", (req, res, next) => {
  const { name, number } = req.body;
  const person = new Person({ name, number });

  Person.find({ name: req.body.name }).then((alreadyExists) => {
    if (alreadyExists.length > 0) {
      res
        .status(409)
        .send({ error: `${req.body.name} already exists in the database` })
        .end();
    } else {
      person
        .save()
        .then((savedPerson) => {
          res.send(savedPerson);
        })
        .catch((error) => next(error));
    }
  });
});

app.delete("/api/persons/:id", (req, res, next) => {
  Person.findByIdAndRemove(req.params.id)
    .then((result) => {
      if (result) {
        res.status(200).send(`${result.name} successfuly deleted`);
      } else {
        res.status(204).end();
      }
    })
    .catch((error) => next(error));
});

app.put("/api/persons/:id", (req, res, next) => {
  const { name, number } = req.body;

  Person.findByIdAndUpdate(
    req.params.id,
    { name, number },
    { new: true, runValidators: true, context: "query" }
  )
    .then((updatedPerson) => {
      res.send(updatedPerson);
    })
    .catch((error) => next(error));
});

const requestTime = () => {
  const today = new Date();
  const day = today.getDate();
  today.setDate(day);

  return ` ${today}`;
};

app.get("/info", (req, res, next) => {
  person
    .countDocuments()
    .then((personCount) => {
      res.send(`<p>Phonebook has info for ${personCount} people</p>
     <p>${requestTime()}</p>`);
    })
    .catch((error) => next(error));
});

const unknownEndpointsHandler = (req, res) => {
  res.status(404).send({ error: "unknown endpoint" });
};
app.use(unknownEndpointsHandler);

const errorHandler = (error, req, res, next) => {
  console.log(error.message);

  if (error.name === "CastError") {
    return res.status(400).send({ error: "invalid id format" });
  } else if (error.name === "ValidationError") {
    return res.status(400).send({ error: error.message });
  }
  res.status(500).send({ error: "Something broke in the server!" });
  next(error);
};
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
//const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
