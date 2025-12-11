import { BASE_URL, dspPath, DSP_SERVICE_ID } from "../../config";
import { DataService } from "../types";

/**
 * Get the data service for the endpoint to initiate contract negotiations.
 * This endpoint is fixed to be part of this service itself.  It is *not*
 * retrieved from the backend so any data service associated with a dataset or
 * catalog is ignored.
 * @returns {DataService} A data service identifying this service's contract
 *   negotiation endpoint.
 */
export function getDataService() {
  const dataService: DataService = {
    uri: DSP_SERVICE_ID,
    // NOTE (29/11/2025): The service's endpoint URL for Catalog Protocol
    // messages should always point to the Contract Negotiation endpoint.
    endpointUrl: BASE_URL + dspPath("/negotiations/request"),
  };

  return dataService;
}
