#Grunt-based project template

Template for Guardian Interactive projects, using Grunt 0.4

## Assumptions

* You have [node](http://nodejs.org) installed
* You have [grunt-cli](http://gruntjs.com/getting-started) installed

## Installation

### 1. Install grunt-init

`npm install -g grunt-init`

If it tells you you don't have the necessary privileges, be more assertive:

```shell
alias bloody=sudo
bloody npm install -g grunt-init
```

### 2. Install the template
`git clone https://github.com/GuardianInteractive/grunt-init-template.git ~/.grunt-init/gui`


## Usage
Create a project folder, then initialise the project from the `gui` template:

```shell
mkdir my-project
cd my-project
grunt-init gui
```

You will be prompted for a project name, but it will default to the name of the folder you created (`my-project` in the example above), so just hit `Enter` twice.

You will then be prompted to do `npm install` to install grunt (and its plugins and dependencies) locally to the project. Further instructions for setting up with GitHub and using grunt can be found in the project's brand spanking new `README.md` file.
