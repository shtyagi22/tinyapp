const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieSession = require('cookie-session')
const bcrypt = require("bcryptjs");

app.set("view engine", "ejs");

//Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'cookiemonster',
  keys: ['my secret key', 'yet another secret key']
}));

// In memory databases
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


//helper functions
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
const getUserByEmail = function (email) {
  for (const id in users) {
    const user = users[id];
    if (user.email === email) {
      return user;
    }
  }
};


//Routes

app.get("/", (req, res) => {
  if (!req.session.user_id) {
    res.redirect("/login");
  }
  else {
    res.redirect("/urls");
  }

});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  if (!req.session.user_id) {
    res.send("You are not logged in! Please <a href='/login'>login</a> or <a href='/register'>register</a>")
  }

  const user = users[req.session.user_id];
  const templateVars = {
    urls: urlsForUser(req.session.user_id),
    user
  };

  res.render("urls_index", templateVars);

});

app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    res.render("login");
    return;
  }
  const user = users[req.session.user_id];
  const templateVars = {
    urls: urlDatabase,
    user
  };
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {

  const shortURL = Math.random().toString(36).substring(2, 8);
  const urlID = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  };

  urlDatabase[shortURL] = urlID;
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
  res.redirect(longURL);

});

app.get("/urls/:id", (req, res) => {
  if (!req.session.user_id) {
    res.send("You are not logged in! Please <a href='/login'>login</a> or <a href='/register'>register</a>");
    return;
  }

  const user = users[req.session.user_id];
  const urlObj = urlDatabase[req.params.id];
  if (!urlObj) {
    res.send("Path does not exist!");
    return;
  }

  const longURL = urlObj.longURL;
  const templateVars = {
    id: req.params.id,
    longURL,
    user
  };

  if (req.session.user_id !== urlDatabase[req.params.id].userID) {
    res.send("Requested URL doesn't belong to the logged in user!");
    return;
  }
  res.render("urls_show", templateVars);

});


//Edit Route
app.post('/urls/:id/update', (req, res) => {

  //checking for the user is logged in
  if (!req.session.user_id) {
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
  if (!req.session.user_id) {
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
  let user = req.session.user_id;
  const templateVars = {
    user: user
  };
  if (!req.session.user_id) {
    res.render("login", templateVars);
  } else {
    res.redirect('/urls');
  }

});

app.post('/login', (req, res) => {

  const testEmail = req.body.email;
  const testPassword = req.body.password;
  const user = getUserByEmail(testEmail);

  if (!getUserByEmail(testEmail)) {
    return res.status(401).send("User does not exist! Please <a href='/register'>register!</a>");
    return;
  }
  if (!bcrypt.compareSync(testPassword, user.password)) {
    return res.status(401).send("Password doesn't match! Please <a href='/login'>try again!</a>");
  }

  req.session.user_id = user.id;

  res.redirect("/urls");


});

//Register Route
app.get("/register", (req, res) => {
  if (!req.session.user_id) {
    res.render("register");
  }
  else {
    res.redirect("/urls");
  }
});

app.post("/register", (req, res) => {

  const user_id = Math.random().toString(36).substring(2, 8);

  const newEmail = req.body.email;
  const newPassword = req.body.password;
  const hashedPassword = bcrypt.hashSync(newPassword, 10);

  if (!newEmail || !hashedPassword) {
    return res.status(401).send("Error! email and password cannot be blank!");
  }

  if (getUserByEmail(newEmail)) {
    return res.status(401).send("User already exist! Please <a href='/login'>login!</a> !");
  }
  const user = {
    id: user_id,
    email: newEmail,
    password: hashedPassword
  };
  users[user_id] = user;

  req.session.user_id = user_id;
  res.redirect("/urls");

});

// Logout Route
app.get("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

module.exports = getUserByEmail;
