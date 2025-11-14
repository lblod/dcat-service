# dcat-service

This service provides an endpoint that presents DCAT catalogues, datasets and distributions in a specified Linked Data format.
The specific format is requested via the `Accept` HTTP header, with the following formats currently supported:

- `application/ld+json`
- `application/n-quads`
- `application/n-triples`
- `application/trig`
- `text/n3`
- `text/turtle`

# Adding datasets

Adding a dataset to the database is a matter of inserting triples conforming to the [DCAT](https://www.w3.org/TR/vocab-dcat-3/) specification. The triples can be added through the `migrations` service.  A dataset can be private or publicly available, and it can be *distributed* in multiple ways. An example of this can be found in [`example.ttl`](example.ttl).