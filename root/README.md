# {%= name %} - project setup

> Created with the grunt-init gui template ({repo URL to go here...})


1. Install grunt and its dependencies
-------------------------------------
$ npm install


2. Create local repo
--------------------
$ git init
$ git add .
$ git commit -m 'first commit woo!'


3. Create remote repo
---------------------
https://github.com/organizations/GuardianInteractive/repositories/new


4. Link the two
---------------
Assuming you called the remote repo '{%= name %}', you would do

$ git remote add origin https://github.com/GuardianInteractive/{%= name %}.git
$ git push -u origin master


5. Start grunting
-----------------
Watch the styles and data folders for changes:

$ grunt watch

Launch a server - http://localhost:9876 (you can change the port in Gruntfile.js):

$ grunt connect

