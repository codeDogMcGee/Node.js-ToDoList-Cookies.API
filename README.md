# To Do List Website
### This site is live at [https://berndog-todo.herokuapp.com/](https://berndog-todo.herokuapp.com/)

To run locally you will need to install the node packages in package.json. In the terminal run:
```
npm install
touch .env
```
In the .env file you will need _COOKIE_SESSION_SECRET=somesecretpassword
Then to run on _localhost:3000_: 
```
node app.js
```

### When a user is not logged in they can see the posts and an option to login in the upper right nav bar 
![Example Image1](public/images/ExampleImg.PNG?raw=true)