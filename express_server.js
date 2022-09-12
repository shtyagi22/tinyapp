const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require("cookie-parser");


app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());



const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

//getUserByEmail()
const getUserByEmail = function (email) {
  for (const id in users) {
    const user = users[id];
    if (user.email === email) {
      return user;
    }
  }
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const user = users[req.cookies["user_id"]];
  const templateVars = {
    urls: urlDatabase,
    user
    // ... any other vars
  };
  console.log("templateVars:", templateVars)
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const user = users[req.cookies["user_id"]];
  const templateVars = {
    urls: urlDatabase,
    user
    // ... any other vars
  };
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console

  const shortURL = Math.random().toString(36).substring(2, 8);

  urlDatabase[shortURL] = req.body.longURL;

  res.redirect(`/urls/${shortURL}`);
  res.end();

});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.get("/urls/:id", (req, res) => {
  const user = users[req.cookies["user_id"]];
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user
  };
  res.render("urls_show", templateVars);
});


//Edit Route
app.post('/urls/:id/update', (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect("/urls");
});

//Delete Route
app.post('/urls/:id/delete', (req, res) => {
  // extract the id 
  const { id } = req.params;
  // delete from the db
  delete urlDatabase[id];
  // redirect
  res.redirect('/urls');
});

//login Route
app.get("/login", (req, res) => {
  res.render("login");
})

app.post('/login', (req, res) => {
  console.log("login req.body:", req.body);
  res.redirect("/urls");
})

//Register Route
app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", (req, res) => {
  const id = Math.random().toString(36).substring(2, 8);
  console.log("register req.body:", req.body)

  const newEmail = req.body.email;
  const newPassword = req.body.password;
  if (!newEmail || !newPassword) {
    res.send("Error! email and password cannot be blank!");
  }

  if (getUserByEmail(newEmail)) {
    res.send("User already exist! Please try again!");
  }
  const user = {
    "id": id,
    "email": newEmail,
    "password": newPassword
  }

  users[id] = user;
  res.cookie("user_id", id);
  console.log("users databse:", users);
  res.redirect("/urls");
});

// Logout Route
app.get("/logout", (req, res) => {
  res.clearCookie("user");
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

