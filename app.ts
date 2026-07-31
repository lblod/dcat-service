import { rdfSerializer } from 'rdf-serialize';
import { app, errorHandler } from 'mu';
import { Request, Response, NextFunction } from 'express';

import { fetchDatasetOdrlPolicyTriples, queryDatabase } from './app/data';

const acceptedFormats = [
  'application/ld+json',
  'application/n-quads',
  'application/n-triples',
  'application/trig',
  'text/n3',
  'text/turtle',
];

app.get(
  '/catalogs',
  async function (req: Request, res: Response, next: NextFunction) {
    try {
      const contentType = req.accepts(acceptedFormats);
      if (contentType) {
        res.header('Content-Type', contentType);
        const stream = rdfSerializer.serialize(await queryDatabase(), {
          contentType,
        });
        stream.pipe(res);
      } else {
        res.status(406).send(`unrecognized format ${req.headers.accept}`);
      }
    } catch (e) {
      next(e);
    }
  },
);

app.get(
  '/dataset/:id/policy/ttl',
  async function (req: Request, res: Response, next: NextFunction) {
    try {
      const datasetId = req.params.id;
      const triplesAsString = await fetchDatasetOdrlPolicyTriples(datasetId);

      return res.status(200).send({ ttl: triplesAsString });
    } catch (e) {
      next(e);
    }
  },
);

app.use(errorHandler);
