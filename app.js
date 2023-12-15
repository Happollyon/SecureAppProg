const express = require('express'); // Import express - to create web server
const sqlite3 = require('sqlite3'); // Import sqlite3 - to interact with SQLite database
const bodyParser = require('body-parser');// Import body-parser- to parse POST request bodies

const app = express(); // Create express app
const port = 3002; // Set port number

// Use body-parser middleware to parse POST request bodies
app.use(bodyParser.urlencoded({ extended: true })); // Parse application/x-www-form-urlencoded
app.set('view engine', 'ejs'); // Set view engine to EJS - to render dynamic HTML pages
// SQLite database setup
const session = require('express-session');


// Generate a random secret key
const secretKey = require('crypto').randomBytes(64).toString('hex');

app.use(session({
  secret: secretKey,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Note: secure should be true in production (requires HTTPS)
}));


const db = new sqlite3.Database('./tasks.db'); // Create database file if not exists

// Create tasks table if not exists
db.run(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    description TEXT
  )
`);

// create a table for users
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    email TEXT,
    password TEXT
  )
`);


// Serve HTML form for adding tasks
app.get('/', (req, res) => {

  if (req.session.user) {
    console.log(`Logged in as ${req.session.user.username} and ${req.session.user.id}` );
    
  } else {
    console.log('Not logged in');
    return res.redirect("/login");
  }
  // populate the tasks array with data from the database but inverted
  
  let tasks = {tasks: [], username: req.session.user.username};
  db.all('SELECT tasks.*, users.username as username FROM tasks JOIN users ON tasks.user_id = users.id', (err, rows) => { 
    if (err) {
      return console.error(err.message);// If error, print error message to console
    }
    rows.forEach((row) => {
      tasks.tasks.unshift(row);// add each row to the tasks array
    });
    res.render('index', { tasks: tasks });
  });
 
});

// Handle form submission to add a task
app.post('/add', (req, res) => {
  const description = req.body.description; // Get task description from form
  if (description) { // If description is not empty
    db.run('INSERT INTO tasks (description,user_id) VALUES (?,?)', [description,req.session.user.id], (err) => { // Insert task into database
      if (err) {
        return console.error(err.message); // If error, print error message to console
      }
      console.log(`A new task has been added: ${description}`); // If no error, print confirmation to console
      res.redirect('/');// Redirect to /
    });
  } else {
    res.send('Please enter a task description.');// If description is empty, send error message
  }
});

// Display the list of tasks
app.get('/tasks', (req, res) => { 
  // Get all tasks from database along with the user who posted each task
  db.all('SELECT tasks.*, users.username as username FROM tasks JOIN users ON tasks.user_id = users.id', (err, rows) => { 
    if (err) { 
      return console.error(err.message); 
    }
    res.send(rows); // If no error, send tasks and user names to client
  });
});

// Delete a task
app.get('/delete/:id', (req, res) => { // Get task ID from URL
  const taskId = req.params.id; // Delete task from database

  //check if the user is the owner of the task
  db.get('SELECT * FROM tasks WHERE id = ?', taskId, (err, row) => {
    if (err) {
      return console.error(err.message);
    }
    if (row.user_id != req.session.user.id) {
      return res.send('You are not the owner of this task');
    }
  });

  db.run('DELETE FROM tasks WHERE id = ?', taskId, (err) => { // Display confirmation message
    if (err) { // If error, print error message to console
      return console.error(err.message); // If error, print error message to console
    }
    console.log(`Task with ID ${taskId} has been deleted.`); // If no error, print confirmation to console
    res.redirect('/'); // Redirect to /tasks
  });
});

app.listen(port, () => { // Start server
  console.log(`Server is running at http://localhost:${port}`); // Print confirmation to console
});

app.get('/register', (req, res) => {
  res.render('register');
});

// register user username email password
app.post('/register_action', (req, res) => {
  const username = req.body.username; // Get task description from form
  const email = req.body.email; // Get task description from form
  const password = req.body.password; // Get task description from form
  if (username && email && password) { // If description is not empty
    db.run('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, password], (err) => { // Insert task into database
      if (err) {
        return console.error(err.message); // If error, print error message to console
      }
      console.log(`A new user has been added: ${username}`); // If no error, print confirmation to console
      res.redirect('/');// Redirect to /
    });
  } else {
    res.send('fill all the fields.');// If description is empty, send error message
  }
});

app.get('/login', (req, res) => {
  res.render('login');
});

// login user username password
// payload ' or 1=1 --
app.post('/login_action', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
  console.log(query);
  if (username && password) {
    db.all(`SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`, (err, rows) => {
      if (err) {
        return console.error(err.message);
      }
      if(rows.length > 0){
        req.session.user = rows[0]; // Store user information in session
        res.redirect('/');
      } else {
        res.send('no user found');
      }
    });
  } else {
    res.send('fill all the fields.');
  }
});

app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
       console.error(err.message);
       return res.status(500).send('Server error');
    }
    res.redirect('/login');
  });
});

// search for a task get /search?search=task

app.get('/search', (req, res) => {
  const search = '%'+req.query.search+"%";
  console.log(search);
  if (search) {
     // populate the tasks array with data from the database
  // if the user id in the task is th same as the logged in user id 
    let tasks = {tasks: [], username: req.session.user.username};
    db.all('SELECT tasks.*, users.username as username FROM tasks JOIN users ON tasks.user_id = users.id WHERE description LIKE ?',[search], (err, rows) => {
      if (err) {
        return console.error(err.message);
      }
      rows.forEach((row) => {
        tasks.tasks.push(row);// add each row to the tasks array
      });
      res.render('search', { tasks: tasks , search_value: req.query.search});
    });
  } else {
    res.send('Please enter a task description.');
  }
});
