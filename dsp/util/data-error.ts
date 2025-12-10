export class DataError extends Error {
  constructor(public message: string) {
    super(message);
  }
}
