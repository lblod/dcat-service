import { query, sparqlEscapeUri } from "mu";
import { PREFIXES } from "../../config";
import { Offer, Rule } from "../types";

/**
 * Get the Offers linked to a given dataset. This queries the backend for all
 * ODRL Offer resources that are linked to the provided dataset, either because
 * - the offer resource has the dataset as `target`; or
 * - the dataset resource links to the offer as its policy.
 * @param {string} datasetUri - The URI of a dataset resource
 * @returns {Promise<Offer[]>} A list of Offers corresponding the offer
 *   resources linked to the provided dataset.
 */
export async function offersForDataset(datasetUri: string) {
  // NOTE (30/11/2025): The `DISTINCT` in the query is needed to avoid having
  // duplicate offers if they are linked via both predicates.
  const selectQuery = `
  ${PREFIXES}

  SELECT DISTINCT ?uri
  WHERE {
    {
      ?uri a odrl:Offer ;
           odrl:target ${sparqlEscapeUri(datasetUri)} .
    } UNION {
      ${sparqlEscapeUri(datasetUri)} odrl:hasPolicy ?uri .
      ?uri a odrl:Offer .
    }
  }
  `;

  const response = await query(selectQuery);

  const offers: Offer[] = response.results?.bindings?.map((binding) =>
    toDspOffer(binding),
  );

  await Promise.all(offers.map(async (offer) => await addRulesToOffer(offer)));

  return offers;
}

function toDspOffer(binding) {
  const offer: Offer = {
    id: binding.uri.value,
    obligation: [],
    permission: [],
    prohibition: [],
  };

  return offer;
}

async function addRulesToOffer(offer: Offer) {
  const selectQuery = `
  ${PREFIXES}

  SELECT DISTINCT ?rule ?type ?action
  WHERE {
    ${sparqlEscapeUri(offer.id)} a odrl:Offer ;
           ?rulePredicate ?rule .

    VALUES ?rulePredicate {
      odrl:permission
      odrl:duty
      odrl:prohibition
    }

    ?rule a ?type ;
          odrl:action ?action .
  }
  `;

  const response = await query(selectQuery);

  await Promise.all(
    response.results?.bindings?.map(
      async (binding) => await createAndAddRule(offer, binding),
    ),
  );
}

async function createAndAddRule(offer: Offer, binding) {
  const rule: Rule = {
    id: binding.rule.value,
    action: binding.action.value,
    constraint: [],
  };

  await addConstraintsToRule(rule);

  // TODO: Avoid having to specify full type URL? (At least extract to constants)
  switch (binding.type.value) {
    case "http://www.w3.org/ns/odrl/2/Duty":
      offer.obligation?.push(rule);
      break;
    case "http://www.w3.org/ns/odrl/2/Prohibition":
      offer.prohibition?.push(rule);
      break;
    case "http://www.w3.org/ns/odrl/2/Permission":
      offer.permission?.push(rule);
      break;
  }
}

async function addConstraintsToRule(rule: Rule) {
  const selectQuery = `
  ${PREFIXES}

  SELECT DISTINCT ?constraint ?leftOperand ?operator ?rightOperand
  WHERE {
    ${sparqlEscapeUri(rule.id)} odrl:constraint ?constraint .
    ?constraint odrl:leftOperand ?leftOperand ;
                odrl:operator ?operator ;
                odrl:rightOperand ?rightOperand .
  }
  `;

  const response = await query(selectQuery);

  response.results?.bindings?.map((binding) =>
    rule.constraint?.push({
      leftOperand: binding.leftOperand.value,
      operator: binding.operator.value,
      rightOperand: binding.rightOperand.value,
    }),
  );
}
