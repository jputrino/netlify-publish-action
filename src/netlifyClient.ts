import axios, { type AxiosError, type AxiosInstance } from "axios";
import { ActionMetadata, Core, Deploy } from "./types";

class NetlifyClient {
  // These are local variables to this class that are set in the constructor
  private _actionMetadata: ActionMetadata;
  private _client: AxiosInstance; // This is the variable available to the class that contains the axios client that we will use to make requests. Instead of using axios.get, we will use this._client.get

  // This creates an axios client with the correct headers and error handling
  private static create = (core: Core, actionMetadata: ActionMetadata) => {
    const { accessToken } = actionMetadata;
    const client = axios.create({
      baseURL: "https://api.netlify.com/api/v1",
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    });

    client.interceptors.response.use(
      (response) => {
        console.log(response.data);
        console.log(response.status);
        console.log(response.statusText);
        console.log(response.headers);
        console.log(response.config);
        return response;
      },
      (error: AxiosError) => {
        if (error.config?.url) {
          core.setFailed(
            `${error.config.method || "API"} request to ${
              error.config.url
            } failed: ${error.message}`
          );
        }
        core.setFailed(`API request failed: ${error.message}`);
        return Promise.reject(error);
      }
    );

    return client;
  };

  // This is the constructor that initializes this class and creates the underlying axios client
  public constructor(core: Core, actionMetadata: ActionMetadata) {
    this._actionMetadata = actionMetadata;
    this._client = NetlifyClient.create(core, actionMetadata);
  }

  // LOGIC FUNCTIONS - these are the functions that will be used in the action to make API calls.

  public async getDeploys() {
    const { siteID } = this._actionMetadata;
    const { data } = await this._client.get<Deploy[]>(
      `/sites/${siteID}/deploys`,
      {
        params: { "latest-published": "true" },
      }
    );
    return data;
  }

  public async unlockDeploy(deployID: string) {
    const { siteID } = this._actionMetadata;
    await this._client.post(`/sites/${siteID}/deploys/${deployID}/unlock`);
    console.log(`Deploy ${deployID} unlocked successfully.`);
  }

  public async restoreSiteDeploy(deployID: string) {
    const { siteID } = this._actionMetadata;
    await this._client.post(
      `/sites/${siteID}/deploys/${deployID}/restoreSiteDeploy`
    );
    console.log(`Deploy published to production site: ${deployID}`);
  }

  public async lockDeploy(deployID: string) {
    const { siteID } = this._actionMetadata;
    await this._client.post(`/sites/${siteID}/deploys/${deployID}/lock`);
    console.log(`Deploy locked successfully to ${deployID}`);
  }
}

export default NetlifyClient;
