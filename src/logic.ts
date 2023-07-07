import { ActionMetadata, Core, Deploy } from "./types";

export const getActionMetadata = (core: Core) => {
  const actionMetadata: ActionMetadata = {
    accessToken: core.getInput("netlify-auth-token"),
    siteID: core.getInput("netlify-site-id"),
  };

  if (actionMetadata.accessToken === "") {
    core.setFailed("Error: Netlify Auth Token not provided.");
    throw new Error(
      "Netlify Auth Token not found. You must provide this as an Action input."
    );
  }

  if (actionMetadata.siteID === "") {
    core.setFailed("Error: No site ID provided.");
    throw new Error(
      "Netlify Site ID is not defined. You must provide this as an Action input."
    );
  }

  return actionMetadata;
};

export const getLockedDeployID = (core: Core, deploys: Deploy[]) => {
  const lockedDeploy = deploys.find((deploy) => deploy.locked);
  if (!lockedDeploy) {
    core.setFailed(
      "Error: Did not find a locked deploy in the provided Netlify Site."
    );
    console.log("Check the Netlify site settings to verify that deploys are locked.")
    throw new Error("No locked deploy found.");
  }
  const lockedDeployID = lockedDeploy.id;
  console.log("Currently locked deploy ID:", lockedDeployID);
  return lockedDeployID;
};

export const getLatestDeployID = (core: Core, deploys: Deploy[]) => {
  const latestDeploy = deploys.find(
      (deploy) => deploy.context === "production" && deploy.state === "ready"
  );
  if (!latestDeploy) {
    core.setFailed(
      "Error: Did not find any production deploys in the provided Netlify Site."
    );
    throw new Error("No recent production deploy found.");
  }
  const latestDeployID = latestDeploy.id;
  console.log("Latest production deploy ID:", latestDeployID);
  return latestDeployID;
};
