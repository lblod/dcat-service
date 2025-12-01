import { Router } from "express";
import { Request, Response, NextFunction } from "express";
import { DSP_CONTEXT } from "../../config";
import { retrieveDataset, retrieveRootCatalog } from "../controllers/catalog";
import { catalogToJson, datasetToJson } from "../data-to-json";

const catalogRouter = Router();

// Catalog request message
catalogRouter.post(
  "/request",
  async function (req: Request, res: Response, next: NextFunction) {
    const rootCatalog = await retrieveRootCatalog();

    if (rootCatalog) {
      res
        .status(200)
        .set("Content-Type", "application/json")
        .json(catalogToJson(rootCatalog, true));
    } else {
      // TODO: extract CatalogError for class for reuse
      res
        .status(500)
        .set("Content-Type", "application/json")
        .json({
          "@context": DSP_CONTEXT,
          "@type": "CatalogError",
          reason: ["No root catalog found"],
        });
    }
  },
);

// Dataset request message
catalogRouter.get(
  "/datasets/:id",
  async function (req: Request, res: Response, next: NextFunction) {
    // TODO: Full URI should be in request
    const uri = "http://data.lblod.info/id/datasets/" + req.params.id;

    const dataset = await retrieveDataset(uri);
    if (dataset) {
      res
        .status(200)
        .set("Content-Type", "application/json")
        .json(datasetToJson(dataset, true));
    } else {
      res
        .status(400)
        .set("Content-Type", "application/json")
        .json({
          "@context": DSP_CONTEXT,
          "@type": "CatalogError",
          reason: ["No dataset found with for the provided id."],
        });
    }
  },
);

export { catalogRouter };
