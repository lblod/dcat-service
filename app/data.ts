import { Readable } from 'stream';
import { IBindings, SparqlJsonParser } from 'sparqljson-parse';
import { query } from 'mu';
import * as RDF from '@rdfjs/types';
import dataFactory from '@rdfjs/data-model';

class ArrayQuadStream extends Readable implements RDF.Stream<RDF.Quad> {
  private data: RDF.Quad[];

  constructor(quads: RDF.Quad[]) {
    super({ objectMode: true });
    this.data = quads;
  }
  _read() {
    this.push(this.data.shift() || null);
  }
}

export async function queryDatabase(): Promise<RDF.Stream<RDF.Quad>> {
  // Alternative approach is to directly use `query()` (with the `Accept` header set to the appropriate MIME type
  // (like `text/turtle`), but that would require patching `mu-javascript-template`, cf.
  // <https://github.com/mu-semtech/mu-javascript-template/blob/e7a270549a8fcdfaf0c24235751a9df8f9e40672/helpers/mu/sparql.js#L15>

  const [basicBindings, odrlBindings] = await Promise.all([
    getBasicDCATInfo(),
    getAdditionalODRLData(),
  ]);

  return constructBindingsToQuadStream([...basicBindings, ...odrlBindings]);
}

async function getBasicDCATInfo(): Promise<IBindings[]> {
  // The query below returns all properties on `dcat:Catalog`s, `Dataset`s and
  // `Distribution`s, as well as any resources also linked to them in the `resources`
  // config of the app-decide project, cf.
  // <https://github.com/lblod/app-decide/blob/development/config/resources/dcat.lisp>
  // Since we just get a single response, we parse everything into an array of quads and make a stream out of it after the fact.
  const sparqlJsonResponse = await query(
    `
    PREFIX cms: <http://mu.semte.ch/vocabulary/cms/>
    PREFIX dct: <http://purl.org/dc/terms/>
    PREFIX dcat: <http://www.w3.org/ns/dcat#>
    PREFIX foaf: <http://xmlns.com/foaf/0.1/>
    PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
    PREFIX odrl: <http://www.w3.org/ns/odrl/2/>
    PREFIX schema: <https://schema.org/>

    CONSTRUCT {
      ?subject ?predicate ?object.
    } WHERE {
      {
        ?subject a dcat:Catalog.
      } UNION {
        ?subject a dcat:Dataset.
      } UNION {
        ?subject a dcat:DataService.
      } UNION {
        ?subject (odrl:permission | odrl:prohibition) / odrl:target ?dataset .
        ?dataset a dcat:Dataset .
      } UNION {
        ?subject odrl:target ?dataset .
        ?dataset a dcat:Dataset .
      } UNION {
        ?subject a dcat:Distribution.
      } UNION {
        [] a dcat:Catalog;
          dct:publisher|
          (dcat:record/foaf:primaryTopic?)|
          dct:themeTaxonomy
            ?subject.
      } UNION {
        [] a dcat:Dataset;
          dct:publisher|
          (dcat:theme/skos:inScheme?)
            ?subject.
      } UNION {
        [] a dcat:Distribution;
          dct:format/cms:page?
            ?subject.
      }
      ?subject ?predicate ?object.
    }
  `,
  );
  const parser = new SparqlJsonParser();
  return parser.parseJsonResults(sparqlJsonResponse);
}

async function getAdditionalODRLData(): Promise<IBindings[]> {
  // somehow this data was omitted if included in the basic query
  const sparqlJsonResponse = await query(
    `
    PREFIX cms: <http://mu.semte.ch/vocabulary/cms/>
    PREFIX dct: <http://purl.org/dc/terms/>
    PREFIX dcat: <http://www.w3.org/ns/dcat#>
    PREFIX foaf: <http://xmlns.com/foaf/0.1/>
    PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
    PREFIX odrl: <http://www.w3.org/ns/odrl/2/>
    PREFIX schema: <https://schema.org/>

    CONSTRUCT {
      ?subject ?predicate ?object.
    } WHERE {
      ?rule odrl:target ?dataset .
      ?dataset a dcat:Dataset .
      ?rule (odrl:assigner | odrl:assignee) / dct:relation? / ^schema:about? ?subject .        
      ?subject ?predicate ?object.
    }
  `,
  );
  const parser = new SparqlJsonParser();
  return parser.parseJsonResults(sparqlJsonResponse);
}

function constructBindingsToQuadStream(bindings: IBindings[]) {
  return new ArrayQuadStream(
    bindings.map((binding) => {
      return dataFactory.quad(
        binding['s'] as RDF.Quad_Subject,
        binding['p'] as RDF.Quad_Predicate,
        binding['o'] as RDF.Quad_Object,
        dataFactory.defaultGraph(),
      );
    }),
  );
}
