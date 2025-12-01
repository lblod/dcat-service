import { Router } from "express";
import { Request, Response, NextFunction } from "express";
import { DSP_CONTEXT } from "../../config";
import { retrieveDataset } from "../controllers/catalog";
import { datasetToJson } from "../data-to-json";

const catalogRouter = Router();

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
