const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");



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
const urlsForUser = function (userID) {
  const urls = {};
  for (const id in urlDatabase) {
    const user = urlDatabase[id];
    if (user.userID === userID) {
      urls[id] = {
        longURL: urlDatabase[id].longURL,
        userID: userID
      };
    }
  }
  return urls;
};

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
    urls: urlsForUser(req.cookies.user_id),
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
  // if (!req.cookies.user_id) {
  //   res.send("You are not logged in! Please login/register.")
  //   return;
  // }

  console.log("post urls req.body:", req.body); // Log the POST request body to the console
  const shortURL = Math.random().toString(36).substring(2, 8);
  const urlID = {
    longURL: req.body.longURL,
    userID: req.cookies.user_id
  };

  urlDatabase[shortURL] = urlID;
  console.log("post urls urlID object:", urlID);
  console.log("urlDatabase:", urlDatabase);

  res.redirect(`/urls/${shortURL}`);
  res.end();

});

app.get("/u/:id", (req, res) => {
  console.log("req.params:", req.params.id);
  if (!urlDatabase[req.params.id]) {
    res.send("Path does not exist!");
    return;
  }
  const longURL = urlDatabase[req.params.id].longURL;
  //urlsForUser(req.cookies.user_id);

  console.log("req.cookies.user_id:", req.cookies.user_id);
  console.log("long URL:", longURL);
  res.redirect(longURL);
});

app.get("/urls/:id", (req, res) => {
  if (!req.cookies.user_id) {
    res.send("You are not logged in! Please <a href='/login'>login</a> or <a href='/register'>register</a>");
    return;
  }
  const user = users[req.cookies.user_id];
  const longURL = urlDatabase[req.params.id].longURL;
  const templateVars = {
    id: req.params.id,
    longURL,
    user
  };
  res.render("urls_show", templateVars);
});


//Edit Route
app.post('/urls/:id/update', (req, res) => {
  //checking for the user is logged in
  if (!req.cookies.user_id) {
    res.send("You are not logged in! Please <a href='/login'>login.</a>");
    return;
  }
  //check for the URLs id 
  if (urlDatabase[req.params.id]) {
    urlDatabase[req.params.id]["longURL"] = req.body.longURL;
    res.redirect("/urls");
  } else {
    res.send("This Id does not exists! Please check again");
  }

});

//Delete Route
app.post('/urls/:id/delete', (req, res) => {
  if (!req.cookies.user_id) {
    res.send("You are not logged in! Please <a href='/login'>login.</a>");
    return;
  }
  // extract the id 
  const id = req.params.id;
  // delete from the db
  delete urlDatabase[id];
  // redirect
  res.redirect('/urls');
});

//login Route
app.get("/login", (req, res) => {
  let user = req.cookies.user_id;
  const templateVars = {
    user: user
  };
  if (!req.cookies.user_id) {
    res.render("login", templateVars);
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
    return res.status(401).send("User does not exist! Please <a href='/register'>register!</a>");
    return;
  }
  if (!bcrypt.compareSync(testPassword, user.password)) {
    return res.status(401).send("Password doesn't match! Please <a href='/login'>try again!</a>");
  }
  res.cookie("user_id", user.id);
  res.redirect("/urls");


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
  const hashedPassword = bcrypt.hashSync(newPassword, 10);

  if (!newEmail || !hashedPassword) {
    return res.status(401).send("Error! email and password cannot be blank!");
  }

  if (getUserByEmail(newEmail)) {
    return res.status(401).send("User already exist! Please try again!");
  }
  const user = {
    id: user_id,
    email: newEmail,
    password: hashedPassword
  };
  users[user_id] = user;

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

