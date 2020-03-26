const axios = require("axios");
const git = require("isomorphic-git");
const fs = require("fs");
const path = require("path");
const http = require("isomorphic-git/http/node");
const credentials = require("./credentials");

const getGithubRepositoriesInformation = async () => {
  const repos = [];
  let page = 1
  do {
  try {
    const result = await axios.get(`https://api.github.com/user/repos?page=${page}`, {
      timeout: 10000,
      auth: {
        username: credentials.githubuser,
        password: credentials.githubtoken
      }
    });

    result.data.map(repo => {
      repos.push({
        name: repo.name,
        desc: repo.description,
        url: repo.clone_url
      });
    });

    page++;
  } catch (err) {
    console.error(err);
  }
} while(repos.length === 30 * (page -1));

  return repos;
};

const createRepositories = async repositories => {
  for (let repository of repositories) {
    try {
      await axios.post(
        `http://${credentials.giteauser}:${credentials.giteapassword}@${credentials.giteaaddress}/api/v1/user/repos`,
        {
          auto_init: true,
          description: repository.desc,
          name: repository.name,
          private: true
        }
      );
    } catch (err) {
      if (err.response.status !== 409) {
        console.error("Unexpected Error:", err);
      }
    }
  }
};

const cloneRepositories = async repositories => {
  // create temp dir
  const dir = path.join(__dirname, "projects");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  let currentPhase = "";

  function onProgress(event) {
    if (currentPhase !== event.phase) {
      currentPhase = event.phase;
      process.stdout.write(`${event.phase}...\r\n`);
    }

    if (event.total) {
      process.stdout.write(
        `progress: ${((event.loaded / event.total) * 100).toFixed(0)}\r`
      );
    }
  }

  function onAuth() {
    return {
      username: credentials.githubtoken
    };
  }

  for (let repository of repositories) {
    const repositoryDir = path.join(dir, repository.name);
    console.log(`Cloning ${repository.name}`);
    try {
      await git.clone({
        fs,
        http,
        dir: repositoryDir,
        onProgress,
        onAuth,
        url: repository.url,
        ref: "master",
        singleBranch: true,
      });
      console.log("\n");
    } catch (e) {
      console.log(
        `An error occured while cloning the repository ${repository.name}: ${e}`
      );
    }
  }
};

const getGiteaRepositoriesInformation = async () => {
  const repos = [];
  try {
    const result = await axios.get(
      `http://${credentials.giteauser}:${credentials.giteapassword}@${credentials.giteaaddress}/api/v1/users/${credentials.giteauser}/repos`,
      {
        timeout: 10000
      }
    );
    result.data.map(repo => {
      repos.push({
        name: repo.name,
        url: repo.clone_url.replace("localhost:3000", credentials.giteaaddress)
      });
    });
  } catch (err) {
    console.error(err);
  }

  return repos;
};

const pushRepositories = async repositories => {
  function onAuth() {
    return {
      username: credentials.giteauser,
      password: credentials.giteapassword
    };
  }

  for (let repository of repositories) {
    console.log(`Pushing ${repository.name}...`)
    const repositoryDir = path.join(__dirname, "projects", repository.name);
    try {
      await git.push({
        fs,
        http,
        dir: repositoryDir,
        onAuth,
        url: repository.url,
        force: true
      });
    } catch (e) {
      console.log(
        `An error occured while pushing the repository ${repository.name} to ${repository.url}: ${e}`
      );
    }
  }
};

const main = async () => {
  console.log("GET github repositories information");
  const githubRepositories = await getGithubRepositoriesInformation();

  console.log("CREATE repositories in gitea\n");
  await createRepositories(githubRepositories);

  console.log("CLONE repositories\n");
  await cloneRepositories(githubRepositories);

  console.log("GET gitea repositories information\n");
  const giteaRepositories = await getGiteaRepositoriesInformation();

  console.log("PUSH repositories\n");
  await pushRepositories(giteaRepositories);
};

main();
