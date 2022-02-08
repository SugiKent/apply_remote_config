const fs = require("fs");
const { initializeApp, applicationDefault } = require("firebase-admin/app");
const { getRemoteConfig } = require("firebase-admin/remote-config");
const core = require("@actions/core");
const github = require("@actions/github");

async function main() {
  try {
    console.log("Start");

    try {
      const decoded = atob(process.env.BASE64_CREDENTIALS_CONTENT);
      fs.writeFileSync("./credentials.json", decoded);
    } catch (e) {
      console.error({ e });
      console.log("Credentials の取得と保存に失敗しました");
      throw e;
    }

    initializeApp({
      credential: applicationDefault(),
    });

    try {
      const config = getRemoteConfig();
      var currentTemplate = await config.getTemplate();
      const templateJson = {
        ...JSON.parse(
          fs.readFileSync("/github/workspace/remote_config.json", "utf8")
        ),
        // 更新操作に必要
        etag: currentTemplate.etag,
      };
      console.log({ templateJson });
      currentConfig = await config.publishTemplate(
        config.createTemplateFromJSON(JSON.stringify(templateJson))
      );
      console.log({ currentConfig });
    } catch (err) {
      console.error(err);
      throw err;
    }

    let commentBody = "Apply Success!";

    const token = process.env["GITHUB_TOKEN"];
    if (!token) {
      console.error("GITHUB_TOKEN not exist");
      return;
    }
    const octokit = new github.getOctokit(token);
    const repoWithOwner = process.env["GITHUB_REPOSITORY"];
    const [owner, repo] = repoWithOwner.split("/");

    const pr_number = process.env.PR_NUMBER;
    const response = await octokit.rest.issues.createComment({
      owner,
      repo,
      issue_number: pr_number,
      body: commentBody,
    });
    console.log("Finished");
  } catch (error) {
    core.setFailed(error.message);
  }
}

main();
