import { Router } from "express";
import { Request, Response, NextFunction } from "express";
import { DSP_CONTEXT, STATUS_CODE } from "../../config";
import { retrieveDataset, retrieveRootCatalog } from "../controllers/catalog";
import { catalogToJson, datasetToJson } from "../data-to-json";
import { CatalogError } from "../util/catalog-error";

const catalogRouter = Router();

// Catalog request message
catalogRouter.post(
  "/request",
  async function (req: Request, res: Response, next: NextFunction) {
    try {
      ensureValidContentType(req.get("Content-Type"));
      ensureValidCatalogRequestBody(req.body);

      const rootCatalog = await retrieveRootCatalog();

      if (rootCatalog) {
        res
          .status(STATUS_CODE.OK)
          .set("Content-Type", "application/json")
          .json(catalogToJson(rootCatalog, true));
      } else {
        throw new CatalogError("No root catalog found");
      }
    } catch (error) {
      next(error);
    }
  },
);

// Dataset request message
catalogRouter.get(
  "/datasets/:id",
  async function (req: Request, res: Response, next: NextFunction) {
    try {
      ensureValidContentType(req.get("content-type"));

      // TODO: Full URI should be in request
      const uri = "http://data.lblod.info/id/datasets/" + req.params.id;

      const dataset = await retrieveDataset(uri);
      if (dataset) {
        res
          .status(STATUS_CODE.OK)
          .set("Content-Type", "application/json")
          .json(datasetToJson(dataset, true));
      } else {
        throw new CatalogError(
          "No dataset found with for the provided id.",
          STATUS_CODE.BAD_REQUEST,
        );
      }
    } catch (error) {
      next(error);
    }
  },
);

catalogRouter.use(async function (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (error instanceof CatalogError) {
    res
      .status(error.status ?? STATUS_CODE.INTERNAL_SERVER_ERROR)
      .set("Content-Type", "application/json")
      .json(error.toJson());
  } else {
    next(error);
  }
});

function ensureValidContentType(contentType) {
  if (contentType !== "application/json") {
    throw new CatalogError(
      'Invalid Content-Type, only "application/json" is accepted',
      STATUS_CODE.BAD_REQUEST,
    );
  }
}

function ensureValidCatalogRequestBody(body) {
  if (!body["@context"].includes(DSP_CONTEXT)) {
    throw new CatalogError(
      "Invalid context specified in request body",
      STATUS_CODE.BAD_REQUEST,
    );
  }

  if (body["@type"] !== "CatalogRequestMessage") {
    throw new CatalogError(
      'Incorrect message type, only "CatalogRequestMessage" is supported',
      STATUS_CODE.BAD_REQUEST,
    );
  }

  // NOTE (28/11/2025): Filters are optional and implementation-specific. For
  // the PoC we can leave that unsupported for now.
  // cf. <https://eclipse-dataspace-protocol-base.github.io/DataspaceProtocol/2025-1/#catalog-request-post>
  if (body.filter?.length) {
    throw new CatalogError(
      "Filters are currently not supported",
      STATUS_CODE.BAD_REQUEST,
    );
  }
}

export { catalogRouter };
