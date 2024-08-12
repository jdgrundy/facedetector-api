const express = require("express");
const app = express();
app.use(express.json());
const cors = require("cors");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const knex = require("knex");

const db = knex({
	client: "pg",
	connection: {
		host: "127.0.0.1",
		port: 5432,
		user: "joegrundy",
		password: "",
		database: "facedetectordb",
	},
});

app.use(cors());

app.get("/", (req, res) => {
	res.json("success");
});

/*
'/' --> res = ok
'/SignIn' --> POST = success / error
'/Register' --> POST = user obj
'/Profile/:userId --> GET = user obj
*/

app.post("/Signin", (req, res) => {
	db.select("email", "hash")
		.from("login")
		.where("email", "=", req.body.email)
		.then((data) => {
			const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
			if (isValid) {
				return db
					.select("*")
					.from("users")
					.where("email", "=", req.body.email)
					.then((user) => {
						res.json(user[0]);
					});
			} else {
				res.json("Email and Password combination not found");
			}
		})
		.catch((err) => res.status(400).json("Unable to signin"));
});

app.post("/Register", (req, res) => {
	const { name, email, password } = req.body;
	const hash = bcrypt.hashSync(password, saltRounds);
	db.transaction((trx) => {
		trx
			.insert({
				hash: hash,
				email: email,
			})
			.into("login")
			.returning("email")
			.then((loginEmail) => {
				trx("users")
					.returning("*")
					.insert({
						name: name,
						email: loginEmail[0].email,
						joined: new Date(),
					})
					.then((user) => {
						res.json(user[0]);
					});
			})
			.then(trx.commit)
			.catch(trx.rollback);
	}).catch((err) => {
		res.status(400).json("Unable to register user. Please check your details.");
	});
});

//return the user
app.get("/profile/:id", (req, res) => {
	//destructure - variable id with value of whatever param is passed in the url of the GET.
	const { id } = req.params;
	db.select("*")
		.from("users")
		.where({
			id: id,
		})
		.then((user) => {
			if (user.length) {
				res.json(user[0]);
			} else {
				res.json("Unable to find user");
			}
		})
		.catch((err) => res.json("An error occured"));
});

//updating entries count on /image
app.put("/image", (req, res) => {
	//destructure - variable id with value of whatever param is passed in the url of the GET.
	const { id } = req.body;
	db("users")
		.where("id", "=", id)
		.increment("entries", 1)
		.returning("entries")
		.then((entries) => {
			console.log(entries[0].entries);
			res.json(entries[0].entries);
		})
		.catch((err) => res.status(400).json("unable to update entries"));
});

//listening and confirming good connection in console:
app.listen(3000, () => {
	console.log("listening on port 3000");
});
