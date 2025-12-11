import { query, sparqlEscapeUri } from "mu";
import { SparqlJsonParser, IBindings } from "sparqljson-parse";
import { PREFIXES } from "../../config";
import { Distribution } from "../types";
import { getDataService } from "./data-service";

export async function distributionsForDataset(uri) {
  const distributions = await distributionsForResource(uri, "Dataset");
  return distributions;
}

export async function distributionsForCatalog(uri) {
  const distributions = await distributionsForResource(uri, "Catalog");
  return distributions;
}

async function distributionsForResource(uri: string, type: string) {
  const selectQuery = `
  ${PREFIXES}

  SELECT DISTINCT ?distribution ?format
  WHERE {
    ${sparqlEscapeUri(uri)} a dcat:${type} ;
                            dcat:distribution ?distribution .
    ?distribution a dcat:Distribution ;
                  dct:format ?format .
  }
  `;

  const response = await query(selectQuery);

  const parser = new SparqlJsonParser();
  const parsedResponse = parser.parseJsonResults(response);

  return parsedResponse.map((dist) => toDspDistribution(dist));
}

function toDspDistribution(distribution: IBindings) {
  const distr: Distribution = {
    uri: distribution.distribution.value,
    format: distribution.format.value,
    accessService: getDataService(),
  };

  return distr;
}
