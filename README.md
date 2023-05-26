# netlify-publish-action

A repo used for developing a scheduled Action to trigger Netlify deploys.

This action only applies to the following use case:

- You have builds active in your Netlify Site.
- Publishing on the production branch is locked.
- You want to be able to publish the latest production deploy on a schedule.

This is useful if you don't want Netlify to publish your production branch automatically, but rather prefer to have updates pushed to the production website at specific intervals.

The Action does the following:

1. Sends a GET request to `/sites/{siteID}/deploys` to find the ID of the currently-locked deploy.
2. Sends a POST to `/sites/{siteID}/deploys/{deployID}/unlock` to unlock the deploy, where {deployID} is the id returned in the previous step.
3. Sends a GET request to `sites/{siteID}/deploys` to find the most recent production deploy and capture the id returned in the response.
4. Sends a POST request to `/sites/{siteID}/deploys/{deployID}/restoreSiteDeploy` where `{deployID}` is the id returned in the previous step.
5. Sends a POST request to `/sites/{siteID}/deploys/{deployID}/lock` where `{deployID}` is the same id returned in step 3.

## Usage

The Action requires the following inputs:

- `netlify-auth-token`: Your Netlify PAT.
- `netlify-site-id`: The API Site ID for your Netlify Site.

The Action returns the following outputs:

- `lockedDeployID`: The ID of the locked production deploy.
- `latestDeployID`: The ID of the most recent deploy on the production branch.

The Action can be scheduled using the cron syntax.
