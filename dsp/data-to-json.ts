import { DSP_CONTEXT } from "../config";
import {
  Catalog,
  Constraint,
  DataService,
  Dataset,
  Distribution,
  Offer,
  Rule,
} from "./types";

/**
 * Convert a catalog object to a corresponding JSON-LD object.  If the result is
 * to be used as the body of an ACK - Catalog the appropriate context and
 *  participant id properties are set.
 * @param {Catalog} catalog - The catalog object to be converted.
 * @param {boolean} isAck - Whether the result should be a body for an ACK
 *   response.
 * @returns {object} - An object representing the JSON-LD data corresponding to
 *   the provided catalog.
 */
export function catalogToJson(catalog: Catalog, isAck = false) {
  let json = {};

  if (isAck) {
    json["@context"] = [DSP_CONTEXT];
  }

  json["@id"] = catalog.id;
  json["@type"] = "Catalog";

  if (isAck) {
    json["participantId"] = "TODO"; // TODO: what should this be?
  }

  if (catalog.catalog?.length) {
    json["catalog"] = catalog.catalog.map((catalog) => catalogToJson(catalog));
  }

  if (catalog.dataset?.length) {
    json["dataset"] = catalog.dataset?.map((dataset) => datasetToJson(dataset));
  }

  if (catalog.distribution?.length) {
    json["distribution"] = catalog.distribution?.map((distribution) =>
      distributionToJson(distribution),
    );
  }

  if (catalog.service?.length) {
    json["dataService"] = catalog.service?.map((dataService) =>
      dataServiceToJson(dataService),
    );
  }

  return json;
}

/**
 * Convert a dataset object to a corresponding JSON-LD object. If the resulting
 * JSON-LD is to be used as body of an ACK-Dataset response the context property
 * is also set to an appropriate value.
 * @param {Dataset} dataset - The dataset object to be converted.
 * @param {boolean} isAck - Whether the result should be a body for an ACK
 *   response.
 * @returns {object} - An object representing the JSON-LD data corresponding to
 *   the provided dataset.
 */
export function datasetToJson(dataset: Dataset, isAck = false) {
  let json = {};

  if (isAck) {
    json["@context"] = [DSP_CONTEXT];
  }

  json["@id"] = dataset.id;
  json["@type"] = "Dataset";
  json["hasPolicy"] = dataset.hasPolicy.map((offer) => offerToJson(offer));
  json["distribution"] = dataset.distribution.map((distr) =>
    distributionToJson(distr),
  );

  return json;
}

function distributionToJson(distribution: Distribution) {
  return {
    "@type": "Distribution",
    "@id": distribution.id,
    format: distribution.format,
    accessService: dataServiceToJson(distribution.accessService),
  };
}

function dataServiceToJson(dataService: DataService) {
  return {
    "@id": dataService.id,
    "@type": "DataService",
    endpointUrl: dataService.endpointUrl,
    // TODO: add servesDataset (optional) Dataset[]
    // NOTE (29/11/2025): Should the served datasets be included? They are not
    // in the dpsace jsonld.
  };
}

function offerToJson(offer: Offer) {
  let json = { "@id": offer.id, "@type": "Offer" };

  if (offer.obligation?.length) {
    json["obligation"] = offer.obligation?.map((duty) => ruleToJson(duty));
  }

  if (offer.permission?.length) {
    json["permission"] = offer.permission?.map((permission) =>
      ruleToJson(permission),
    );
  }

  if (offer.prohibition?.length) {
    json["prohibition"] = offer.prohibition?.map((prohibition) =>
      ruleToJson(prohibition),
    );
  }

  return json;
}

function ruleToJson(rule: Rule) {
  let json = { action: rule.action };
  if (rule.constraint?.length) {
    json["constraint"] = rule.constraint?.map((constraint) =>
      constraintToJson(constraint),
    );
  }

  return json;
}

function constraintToJson(constraint: Constraint) {
  return {
    leftOperand: constraint.leftOperand,
    operator: constraint.operator,
    rightOperand: constraint.rightOperand,
    // TODO: optional and, andSequence, or, xone
    // NOTE (29/11/2025): Should conform to ODRL's serialisation
  };
}
