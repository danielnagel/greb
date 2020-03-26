# **G**it **Re**mote **B**ackup

Backups all of your repositories from github and uploads them to your local gitea server.
I personally use this project as a cronjob right now.

## Getting started

### 1. Create a personal access token for Github

[Link](https://help.github.com/en/github/authenticating-to-github/creating-a-personal-access-token-for-the-command-line)

### 2. Create credentials.js

Create the file `greb/credentials.js` and paste your credentials.
You can copy the following code:

```javascript
module.exports = {
  githubuser: "",
  githubtoken: "",
  giteauser: "",
  giteapassword: "",
  giteaaddress: ""
};
```

### 3. Install dependencies

* (Obviously) install [nodejs](https://nodejs.org/en/).
* Run the install task in the terminal:

```bash
# in greb/ directory
npm i
```

### 4. Run greb

Run greb in the terminal:

```bash
# in greb/ directory
npm start
```

### 5. Relax ☕

Grab a coffee and let greb do the backup.

## Plans for the future

Right now, I only need the Backup, feel free to add the following features or wait until I have a need for them.

* Synchronization between Gitea, Github and (multiple) local environments.
* Watch local environments and tell the user that there are uncommited changes.
  * I sometimes tend to forget some projects...
* More Remotes and more Directions (More than Github -> local -> Gitea)
  * e.g. Bitbucket, Gitlab, Gitserver
* Logging
* Tests
