import { query, sparqlEscapeUri } from "mu";
import { SparqlJsonParser, IBindings } from "sparqljson-parse";
import { PREFIXES } from "../../config";
import { DataService, Distribution } from "../types";

export async function distributionsForDataset(uri) {
  const selectQuery = `
  ${PREFIXES}

  SELECT DISTINCT ?distribution ?format
  WHERE {
    ${sparqlEscapeUri(uri)} a dcat:Dataset ;
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
  const dataService: DataService = {
    id: "TODO", // TODO: not yet sure what this should be
    endpointUrl: distribution.accessUrl.value, // TODO: should be the URL for this service's contract negotiation/transfer process? cf. DSP 5.3.2 So the URL for the app itself? The `/negotiation/...` and `transfers/...` part is implied by DSP?
  };

  const distr: Distribution = {
    id: distribution.distribution.value,
    format: distribution.format.value,
    accessService: dataService,
  };

  return distr;
}
