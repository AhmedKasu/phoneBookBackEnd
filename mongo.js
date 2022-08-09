const mongoose = require("mongoose");

// eslint-disable-next-line no-undef
if (process.argv.length < 3) {
  console.log(
    "Please provide the password as an argument: node mongo.js <password>"
  );
  process.exit(1);
}

const password = process.argv[2];
const url = `mongodb+srv://phonebook:${password}@cluster0.9wevi.mongodb.net/?retryWrites=true&w=majority`;

const phonebookSchema = new mongoose.Schema({
  name: String,
  number: Number,
});

const Person = mongoose.model("person", phonebookSchema);

mongoose.connect(url).then((result) => {
  console.log("connected");

  const person = new Person({
    name: process.argv[3],
    number: process.argv[4],
  });

  if (process.argv.length === 3) {
    return Person.find({}).then((result) => {
      result.forEach((person) => {
        console.log(person);
        mongoose.connection.close();
      });
    });
  } else {
    return person
      .save()
      .then(() => {
        console.log(
          `added ${process.argv[3]} number ${process.argv[4]} to phonebook`
        );
        return mongoose.connection.close();
      })
      .catch((err) => console.log(err));
  }
});
