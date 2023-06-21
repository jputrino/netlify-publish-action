import axios, { type AxiosError, type AxiosInstance } from "axios";
import { ActionMetadata, Core, Deploy } from "./types";

class NetlifyClient {
  private _actionMetadata: ActionMetadata;
  private _client: AxiosInstance;

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

  public constructor(core: Core, actionMetadata: ActionMetadata) {
    this._actionMetadata = actionMetadata;
    this._client = NetlifyClient.create(core, actionMetadata);
  }

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
