import { query, sparqlEscapeUri } from "mu";
import { PREFIXES } from "../../config";

export async function isExistingDataset(uri: string) {
  const askQuery = `
  ${PREFIXES}

  ASK {
    ${sparqlEscapeUri(uri)} a dcat:Dataset .
  }
  `;

  const response = await query(askQuery);
  return response.boolean ?? false;
}
