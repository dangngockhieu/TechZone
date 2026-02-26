export class AppException extends Error {
  public success = false;

  constructor(
    public message: string,
    public statusCode: number = 400,
  ) {
    super(message);
  }
}