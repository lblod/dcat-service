import { offersForDataset } from "../data-access/offer";
import {
  distributionsForCatalog,
  distributionsForDataset,
} from "../data-access/distribution";
import { Catalog, Dataset } from "../types";
import { datasetsInCatalog, isExistingDataset } from "../data-access/dataset";
import {
  getContainedCatalogs,
  getRootCatalog,
  isExistingCatalog,
} from "../data-access/catalog";
import { getDataService } from "../data-access/data-service";

/**
 * Retrieve the root catalog from the backend. The root catalog is a catalog
 * that is not contained in any other catalog. If there are multiple such
 * catalogs in the backend, the result depends on whichever the backend responds
 * to the performed query.
 * @return {Promise<Catalog|undefined>} A Catalog object if a root catalog is
 *   found, undefined otherwise.
 */
export async function retrieveRootCatalog() {
  const catalog = await getRootCatalog();

  if (catalog) {
    await populateCatalog(catalog);

    return catalog;
  }
}

/**
 * Populate a Catalog object with its contained data. The relevant data linked
 * to the catalog resource identified by the id of the provided object is
 * retrieved from the backend. The retrieved data concerns any contained other
 * catalogs, the datasets in the catalog. and any distributions linked to the
 * catalog. The catalog's access service is set to one matching this service.
 * @param {Catalog} catalog - The object to populate with data.
 * @return {Promise<Catalog|undefined>} The populated catalog object or
 *   undefined if no catalog resource was found for its id.
 */
async function populateCatalog(catalog: Catalog) {
  const catalogExists = await isExistingCatalog(catalog.id);

  if (catalogExists) {
    // TODO: Should take precautions this does not go into an infinite loop due
    // to cyclic links in the data
    const containedCatalogs = await getContainedCatalogs(catalog.id);
    catalog.catalog = await Promise.all(
      containedCatalogs.map(async (c) => await populateCatalog(c)),
    );

    const datasetUris = await datasetsInCatalog(catalog.id);
    catalog.dataset = await Promise.all(
      datasetUris.map(async (uri) => await retrieveDataset(uri)),
    );

    catalog.distribution = await distributionsForCatalog(catalog.id);

    catalog.service = [getDataService()];

    return catalog;
  }
}

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
