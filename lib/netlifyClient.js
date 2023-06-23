"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
class NetlifyClient {
    // This is the constructor that initializes this class and creates the underlying axios client
    constructor(core, actionMetadata) {
        this._actionMetadata = actionMetadata;
        this._client = NetlifyClient.create(core, actionMetadata);
    }
    // LOGIC FUNCTIONS - these are the functions that will be used in the action to make API calls.
    getDeploys() {
        return __awaiter(this, void 0, void 0, function* () {
            const { siteID } = this._actionMetadata;
            const { data } = yield this._client.get(`/sites/${siteID}/deploys`, {
                params: { "latest-published": "true" },
            });
            return data;
        });
    }
    unlockDeploy(deployID) {
        return __awaiter(this, void 0, void 0, function* () {
            const { siteID } = this._actionMetadata;
            yield this._client.post(`/sites/${siteID}/deploys/${deployID}/unlock`);
            console.log(`Deploy ${deployID} unlocked successfully.`);
        });
    }
    restoreSiteDeploy(deployID) {
        return __awaiter(this, void 0, void 0, function* () {
            const { siteID } = this._actionMetadata;
            yield this._client.post(`/sites/${siteID}/deploys/${deployID}/restoreSiteDeploy`);
            console.log(`Deploy published to production site: ${deployID}`);
        });
    }
    lockDeploy(deployID) {
        return __awaiter(this, void 0, void 0, function* () {
            const { siteID } = this._actionMetadata;
            yield this._client.post(`/sites/${siteID}/deploys/${deployID}/lock`);
            console.log(`Deploy locked successfully to ${deployID}`);
        });
    }
}
// This creates an axios client with the correct headers and error handling
NetlifyClient.create = (core, actionMetadata) => {
    const { accessToken } = actionMetadata;
    const client = axios_1.default.create({
        baseURL: "https://api.netlify.com/api/v1",
        headers: {
            authorization: `Bearer ${accessToken}`,
        },
    });
    client.interceptors.response.use((response) => {
        console.log(response.data);
        console.log(response.status);
        console.log(response.statusText);
        console.log(response.headers);
        console.log(response.config);
        return response;
    }, (error) => {
        var _a;
        if ((_a = error.config) === null || _a === void 0 ? void 0 : _a.url) {
            core.setFailed(`${error.config.method || "API"} request to ${error.config.url} failed: ${error.message}`);
        }
        core.setFailed(`API request failed: ${error.message}`);
        return Promise.reject(error);
    });
    return client;
};
exports.default = NetlifyClient;