import * as core from "@actions/core";
import {
  getActionMetadata,
  getLockedDeployID,
  getLatestDeployID,
} from "./logic";
import NetlifyClient from "./NetlifyClient";

const main = async () => {
  core.debug(`GitHub Event Name: ${process.env.GITHUB_EVENT_NAME}`);

  // Gets GitHub Action inputs
  const actionMetadata = getActionMetadata(core);

  // Creates an axios instance with the provided Netlify auth token
  // This will intercept all requests and send the token in the authorization header and log the errors/responses automatically
  // The client is modified with custom functions to interact with the Netlify API to make this cleaner
  const client = new NetlifyClient(core, actionMetadata);

  // This is using one of the functions mentioned above to get the deploys for the site
  const latestPublishedDeploys = await client.getDeploys({
    params: { "latest-published": "true" },
  });
  const latestDeploys = await client.getDeploys();

  // Gets IDs for the locked and latest deploys
  const lockedDeployID = getLockedDeployID(core, latestPublishedDeploys);
  const latestDeployID = getLatestDeployID(core, latestDeploys);

  // Unlocks the existing deployment
  await client.unlockDeploy(lockedDeployID);
  // Updates the production site with the latest deploy
  await client.restoreSiteDeploy(latestDeployID);
  // Locks to this deployment
  await client.lockDeploy(latestDeployID);

  // As a final step, provides GitHub Action outputs upon success
  core.setOutput("lockedDeployID", lockedDeployID);
  core.setOutput("latestDeployID", latestDeployID);
};

try {
  main();
} catch (error) {
  if (error instanceof Error) {
    core.setFailed(error.message);
    console.error("Error:", error.message);
  } else {
    core.setFailed("Unknown error occurred");
    console.error("Unknown error occurred");
  }
}
