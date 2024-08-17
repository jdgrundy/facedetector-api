const express = require("express");
const app = express();
app.use(express.json());
const cors = require("cors");
const bcrypt = require("bcrypt");
// const saltRounds = 10;
const knex = require("knex");
const signin = require("./controllers/signin");
const register = require("./controllers/register");

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

app.post("/Signin", (res, req) => {
	signin.handleSignin(res, req, db, bcrypt);
});

app.post("/Register", (res, req) => {
	register.handleRegister(res, req, db, bcrypt);
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

//listening and confirming good connection in console
app.listen(3000, () => {
	console.log("listening on port 3000");
});
