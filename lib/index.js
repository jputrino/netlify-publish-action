"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const core = __importStar(require("@actions/core"));
const logic_1 = require("./logic");
const NetlifyClient_1 = __importDefault(require("./NetlifyClient"));
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    core.debug(`GitHub Event Name: ${process.env.GITHUB_EVENT_NAME}`);
    // Gets GitHub Action inputs
    const actionMetadata = (0, logic_1.getActionMetadata)(core);
    // Creates an axios instance with the provided Netlify auth token
    // This will intercept all requests and send the token in the authorization header and log the errors/responses automatically
    // The client is modified with custom functions to interact with the Netlify API to make this cleaner
    const client = new NetlifyClient_1.default(core, actionMetadata);
    // This is using one of the functions mentioned above to get the deploys for the site
    const deploys = yield client.getDeploys();
    // Gets IDs for the locked and latest deploys
    const lockedDeployId = (0, logic_1.getLockedDeployID)(core, deploys);
    const latestDeployID = (0, logic_1.getLatestDeployID)(core, deploys);
    // Unlocks the existing deployment
    yield client.unlockDeploy(lockedDeployId);
    // Updates the production site with the latest deploy
    yield client.restoreSiteDeploy(latestDeployID);
    // Locks to this deployment
    yield client.lockDeploy(latestDeployID);
    // As a final step, provides GitHub Action outputs upon success
    core.setOutput("lockedDeployID", lockedDeployId);
    core.setOutput("latestDeployID", latestDeployID);
});
try {
    main();
}
catch (error) {
    if (error instanceof Error) {
        core.setFailed(error.message);
        console.error("Error:", error.message);
    }
    else {
        core.setFailed("Unknown error occurred");
        console.error("Unknown error occurred");
    }
}
