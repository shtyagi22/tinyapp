const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require("cookie-parser");


app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());



const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

//
const getUserByID = function (userID) {
  for (const id in urlDatabase) {
    const user = urlDatabase[id];
    if (user.userID === userID) {
      return user;
    }
  }
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
  if (!req.cookies.user_id) {
    res.send("You are not logged in! Please <a href='/login'>login</a> or <a href='/register'>register</a>")
  }
  const user = users[req.cookies.user_id];
  const templateVars = {
    urls: urlDatabase,
    user
    // ... any other vars
  };
  console.log("templateVars:", templateVars)
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (!req.cookies.user_id) {
    res.render("login");
    return;
  }
  const user = users[req.cookies.user_id];
  const templateVars = {
    urls: urlDatabase,
    user
    // ... any other vars
  };
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  if (!req.cookies.user_id) {
    res.send("You are not logged in! Please login/register.")
    return;
  }

  console.log(req.body); // Log the POST request body to the console

  const shortURL = Math.random().toString(36).substring(2, 8);

  urlDatabase[shortURL] = req.body.longURL;

  res.redirect(`/urls/${shortURL}`);
  res.end();

});

app.get("/u/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    res.send("Path does not exist!");
    return;
  }
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.get("/urls/:id", (req, res) => {
  const user = users[req.cookies.user_id];
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
  if (!req.cookies.user_id) {
    res.render("login");
  } else {
    res.redirect('/urls');
  }
});

app.post('/login', (req, res) => {
  console.log("login req.body:", req.body);

  const testEmail = req.body.email;
  const testPassword = req.body.password;
  const user = getUserByEmail(testEmail);
  // console.log("users databse in login:", users);
  // console.log("getUserByEmail(testEmail)", getUserByEmail(testEmail));

  if (!getUserByEmail(testEmail)) {
    res.send("User does not exist! Please register!");
  } else if (getUserByEmail(testEmail) && testPassword !== user.password) {
    res.send("Password doesn't match! Try again");
  } else {
    res.cookie("user_id", user.id);
    res.redirect("/urls");
  }

});

//Register Route
app.get("/register", (req, res) => {
  if (!req.cookies.user_id) {
    res.render("register");
  }
  else {
    res.redirect("/urls");
  }
});

app.post("/register", (req, res) => {

  const user_id = Math.random().toString(36).substring(2, 8);
  console.log("register req.body:", req.body);

  const newEmail = req.body.email;
  const newPassword = req.body.password;

  if (!newEmail || !newPassword) {
    res.send("Error! email and password cannot be blank!");
  }

  if (getUserByEmail(newEmail)) {
    res.send("User already exist! Please try again!");
  }
  users[user_id] = {
    id: user_id,
    newEmail,
    newPassword
  }

  res.cookie("user_id", user_id);
  console.log("users database after update:", users);
  res.redirect("/urls");
});

// Logout Route
app.get("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

