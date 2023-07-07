import type * as CoreType from "@actions/core";

export type Core = typeof CoreType;

export interface Deploy {
  id: string;
  locked: boolean;
  context: string;
  state: string;
  permalink: string;
}

export interface ActionMetadata {
  accessToken: ReturnType<Core["getInput"]>;
  siteID: ReturnType<Core["getInput"]>;
}
