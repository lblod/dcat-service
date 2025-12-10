// Configuration
if (!process.env.BASE_URL) throw "Expected BASE_URL to be provided.";
export const BASE_URL = process.env.BASE_URL.replace(/\/+$/, "");

if (!process.env.DSP_SERVICE_ID) throw "Expected DSP_SERVICE_ID to be provided";
export const DSP_SERVICE_ID = process.env.DSP_SERVICE_ID;

if (!process.env.DSP_PARTICIPANT_ID)
  throw "Expected DSP_PARTICIPANT_ID to be provided";
export const DSP_PARTICIPANT_ID = process.env.DSP_PARTICIPANT_ID;

export const DSP_PATH_PREFIX = process.env.DSP_PATH_PREFIX || "/dsp/2025-1/";

export const DSP_CONTEXT =
  process.env.DSP_CONTEXT || "https://w3id.org/dspace/2025/1/context.jsonld";

// Constants
export const PREFIXES = `
PREFIX dcat: <http://www.w3.org/ns/dcat#>
PREFIX dct: <http://purl.org/dc/terms/>
PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
PREFIX odrl: <http://www.w3.org/ns/odrl/2/>
`;

export enum STATUS_CODE {
  OK = 200,
  INTERNAL_SERVER_ERROR = 500,
  BAD_REQUEST = 400,
  NOT_ACCEPTABLE = 406,
}

// Utilities
export function dspPath(affix: String) {
  return (
    "/" + // Ensure path starts with a "/"
    DSP_PATH_PREFIX.replace(/^\/+|\/+$/g, "") + // Remove any "/" pre- and affixes
    (DSP_PATH_PREFIX && affix ? "/" : "") + // Add an infix "/" if there are two values
    affix.replace(/^\/*/, "") // Remove any prefix "/"
  );
}
