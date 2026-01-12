const http = require("node:http");
const fs = require("node:fs");

function readUsers() {
  return JSON.parse(fs.readFileSync("./users.json", "utf8"));
}

function writeUsers(users) {
	fs.writeFileSync("./users.json", JSON.stringify(users, null, 2));
}

function send(res, statusCode, message) {
	res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify({"message": message}));
}

const server = http.createServer((req, res) => {
	const {url, method} = req;

	// get all users
	if ( url == "/user" && method == "GET" ) {
		res.writeHead(200, {"content-type": "application/json"});
		const users = readUsers();
		res.write(JSON.stringify(users));
		res.end();
	}

	// add user
	if ( url == "/user" && method == "POST" ) {
		let data = ""
		req.on("data", (chunk) => {
			data += chunk;
		})
		req.on("end", () => {
			const new_user = JSON.parse(data);
			const { name, age, email } = new_user;
			if (!name || !age || !email) {
				send(res, 400, "Missing fields");
				return;
      }

			const user = {
				id: Math.floor(Math.random() * 100),
				name: name,
				age: age,
				email: email
			}
			const users = readUsers();
			if (users.some(u => u.email === email)) {
				send(res, 409, "Email already exists");
				return;
      }

			users.push(user);
			writeUsers(users);

			send(res, 200, "User added successfully");
		})
	}

	if ( url.startsWith("/user/") && url.length > 6 ) {
		const idString = url.split("/")[2];
		const userId = parseInt(idString);

		if (method === "PATCH") {
      let data = "";
      req.on("data", (chunk) => (data += chunk));
      req.on("end", () => {
        const users = readUsers();
        const index = users.findIndex((u) => u.id === userId);

        if (index === -1) {
          send(res, 404, "User ID not found.");
          return;
        }

        try {
          const updates = JSON.parse(data);
          users[index] = { ...users[index], ...updates };
          writeUsers(users);
          send(res, 200, "User updated successfully.");
        } catch (e) {
          send(res, 400, "Invalid JSON body");
        }
      });
      return;
    }

		if (method === "DELETE") {
      const users = readUsers();
      const newUsers = users.filter((u) => u.id !== userId);

      if (users.length === newUsers.length) {
        send(res, 404, "User ID not found.");
      } else {
        writeUsers(newUsers);
        send(res, 200, "User deleted successfully.");
      }
      return;
    }

		if (method === "GET") {
      const users = readUsers();
      const user = users.find((u) => u.id === userId);

      if (!user) {
        send(res, 404, "User not found.");
      } else {
        send(res, 200, user);
      }
      return;
    }
	}

	send(res, 404, "Route not found");
});

const PORT = 3000;
server.listen(PORT, () => {
	console.log("Server is running on port:", PORT);
});