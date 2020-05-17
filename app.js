require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const _ = require('lodash');
const cookieSession = require('cookie-session');

////////////// Set Production Environment //////////////
const productionEnvironment = false;

let cookieSessionExpirationHours = 0;
if (productionEnvironment) {
  cookieSessionExpirationHours = 24;
} else {
  cookieSessionExpirationHours = 10000 ; // milliseconds  | 60 * 60 * 1000 * 24 is 24 hours
}
////////////////////////////////////////////////////////

// initialize modules
const app = express();
app.set('trust proxy', 1); // trust the first proxy, from cookie-session
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public'));
app.use(cookieSession({
  name: 'session',
  // keys: new Keygrip(['key1', 'key2'], 'SHA384', 'base64')
  secret: process.env.COOKIE_SESSION_SECRET,
  maxAge: cookieSessionExpirationHours
}));


function removeItemFromGuestList(req, idToRemove) {
  // loop through guest posts list and if the id of the object
  // matches the delete button id remove the current item and then stop
  for (let i = 0; i < req.session.guestList.length; i++) {
    const taskId = req.session.guestList[i]._id.toString();
    if (taskId === idToRemove) {
      req.session.guestList.splice(i, 1);
      break;
    }
  }
};

function updateTaskChecked (req, checkedId) {
  for (let i = 0; i < req.session.guestList.length; i++) {
    const taskId = req.session.guestList[i]._id.toString();
    if (taskId === checkedId) {
      // toggle checked boolean
      req.session.guestList[i].checked = !req.session.guestList[i].checked
      break;
    }
  }
};

let startingSessionId =  0;
function initializeSessionList (req) {
  req.session.guestList = [];
};

// used later with custom lists
// function formatCustomListName(arr) {
//   return _.startCase(_.toLower(_.trim(arr).replace(/\s+/g,' ')));
// };

app.get("/", (req, res) => {
  // if the session list doesn't exist start with fresh settings

  if (!req.session.guestList) {
    initializeSessionList(req);
  }

  res.render("list", {
    listTitle: "Tasks",
    listItems: req.session.guestList,
    renderDeleteButton: false
  });

  // this will be used when new lists can be added by logged in user
  // let existingLists = [];
  // List.find({}, function(err, foundLists) {
  //   //console.log(foundLists);
  //   foundLists.forEach( list => {
  //     existingLists.push(list.name);
  //   });

  //   res.render("list", {
  //     listTitle: "Tasks",
  //     listItems: req.session.guestList,
  //     renderDeleteButton: false,
  //     existingLists: existingLists
  //   });
  // });
});

app.post("/newTask", (req, res) => {
  

  const listName = req.body.listName; // this comes from the '+' push
  const itemName = req.body.newTask;

  // iterate req.session.guestListId to keep getting unique id's
  const newItem = {_id: startingSessionId++, task: itemName , checked: false};

  if (listName === "Tasks") {
    // if the session times out need to start with fresh settings
    if (!req.session.guestList) {
      initializeSessionList(req);
    }

    //req.session.guestList is a list of item objects
    req.session.guestList.push(newItem);

    res.redirect("/");
  } // will add more functionality for other lists from mongodb

});

app.post("/deleteTask", (req, res) => {
  const taskId = req.body.taskId;
  const listName = req.body.listName; // from the hidden input in list.ejs

  if (listName === "Tasks"){
    // if the session times out need to start with fresh settings
    if (req.session.guestList) {
      removeItemFromGuestList(req, taskId);
    } else {
      initializeSessionList(req);
    }
    res.redirect("/");
    
  } // will add more functionality for other lists from mongodb
});

app.post("/taskChecked", (req, res) => {
  const taskId = req.body.taskId
  const listName = req.body.listName
  if (listName === "Tasks") {
      // if the session times out need to start with fresh settings
      if (req.session.guestList) {
        updateTaskChecked(req, taskId);
      } else {
        initializeSessionList(req);
      }
      res.redirect("/");
  }
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started on port: ", port);
});
