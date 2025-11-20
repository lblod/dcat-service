# dcat-service

This service provides an endpoint that presents DCAT catalogues, datasets and distributions in a Linked Data file format of the user's choice.

## Adding datasets

Adding a dataset to the database is a matter of inserting triples conforming to the [DCAT](https://www.w3.org/TR/vocab-dcat-3/) specification. The triples can be added through the `migrations` service.  A dataset can be private or publicly available, and it can be distributed in multiple formats. An example can be found in [`example.ttl`](example.ttl).

## Adding to a stack

To add the service to a mu-semtech stack, add the following snippet to its `docker-compose.yaml` file in the `services` section:

```yaml
dcat:
  image: lblod/dcat-service:0.0.1
```

Add the following line to the dispatcher's configuration:

```elixir
match "/dcat/*path" do
  Proxy.forward(conn, path, "http://dcat/")
end
```

## API

### `GET /catalogs`

This endpoint passes all information on `dcat:Catalog`s, `dcat:Dataset`s and `dcat:Distribution`s from the triple store to the user. The specific file format can be specified via the `Accept` HTTP header, with the default being `application/ld+json`. The following formats are currently supported:

- `application/ld+json`
- `application/n-quads`
- `application/n-triples`
- `application/trig`
- `text/n3`
- `text/turtle`

#### Response

- `200 OK` if the data was successfully sent to the user.
- `406 Not Acceptable` if the requested file format is not supported.