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

export async function datasetsInCatalog(catalogUri: string) {
  const selectQuery = `
  ${PREFIXES}

  SELECT DISTINCT ?dataset
  WHERE {
    ${sparqlEscapeUri(catalogUri)} a dcat:Catalog ;
      dcat:dataset ?dataset .
  }
  `;

  const response = await query(selectQuery);
  return response.results?.bindings?.map((binding) => binding.dataset.value);
}
