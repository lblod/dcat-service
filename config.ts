export const DSP_CONTEXT = "https://w3id.org/dspace/2025/1/context.jsonld";

// TODO: Should be set via environment variable
export const BASE_URL = "https://ds.decide.lblod.info/";

// TODO: maybe this should be configurable, environment variable?
export const DSP_PATH_PREFIX = "/dsp/2025-1/";

export function dspPath(affix: String) {
  return (
    "/" + // Ensure path starts with a "/"
    DSP_PATH_PREFIX.replace(/^\/+|\/+$/g, "") + // Remove any "/" pre- and affixes
    (DSP_PATH_PREFIX && affix ? "/" : "") + // Add an infix "/" if there are two values
    affix.replace(/^\/*/, "") // Remove any prefix "/"
  );
}

export const PREFIXES = `
PREFIX dcat: <http://www.w3.org/ns/dcat#>
PREFIX dct: <http://purl.org/dc/terms/>
PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
PREFIX odrl: <http://www.w3.org/ns/odrl/2/>
`;
