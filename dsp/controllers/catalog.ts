import { offersForDataset } from "../data-access/offer";
import { distributionsForDataset } from "../data-access/distribution";
import { Dataset } from "../types";
import { isExistingDataset } from "../data-access/dataset";

export async function retrieveDataset(uri) {
  const datasetExists = await isExistingDataset(uri);

  if (datasetExists) {
    const distributions = await distributionsForDataset(uri);
    const offers = await offersForDataset(uri);

    const dataset: Dataset = {
      id: uri,
      distribution: distributions,
      hasPolicy: offers,
    };

    return dataset;
  }
}
