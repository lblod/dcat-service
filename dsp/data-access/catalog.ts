import { query, sparqlEscapeUri } from "mu";
import { PREFIXES } from "../../config";
import { Catalog } from "../types";

export async function isExistingCatalog(uri: string) {
  const askQuery = `
  ${PREFIXES}

  ASK {
    ${sparqlEscapeUri(uri)} a dcat:Catalog .
  }
  `;

  const response = await query(askQuery);
  return response.boolean ?? false;
}

export async function getRootCatalog() {
  // NOTE (28/11/2025): This relies on the assumption that there is exactly 1
  // root catalogue in the app.  If that is not the case the result is
  // unpredictable and depends on which one virtuoso decides to return.
  const selectQuery = `
  ${PREFIXES}

  SELECT DISTINCT ?catalog
  WHERE {
    ?catalog a dcat:Catalog .
    FILTER NOT EXISTS { ?containingCatalog dcat:catalog ?catalog . }
  } LIMIT 1
  `;

  const response = await query(selectQuery);
  const catalog = response.results?.bindings[0]
    ? toDspCatalog(response.results.bindings[0])
    : undefined;
  return catalog;
}

export async function getContainedCatalogs(catalogUri: string) {
  const selectQuery = `
  ${PREFIXES}

  SELECT DISTINCT ?catalog
  WHERE {
    ${sparqlEscapeUri(catalogUri)} a dcat:Catalog ;
      dcat:catalog ?catalog .
  }
  `;

  const response = await query(selectQuery);

  const containedCatalogs = response.results?.bindings?.map((catalog) =>
    toDspCatalog(catalog),
  );
  return containedCatalogs;
}

function toDspCatalog(binding) {
  const catalog: Catalog = {
    id: binding.catalog.value,
  };

  return catalog;
}
