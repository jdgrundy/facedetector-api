const handleSignin = (req, res, db, bcrypt) => {
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
};

module.exports = {
	handleSignin: handleSignin,
};
