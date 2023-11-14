import { Response } from 'express';
import { MetadataInterface } from 'interfaces/metadata.interface';

export class ResponseHandler {
  static success<T>(
    res: Response,
    statusCode: number,
    message: string,
    data?: T,
    metadata?: MetadataInterface
  ): void {
    const responsePayload: any = {
      success: true,
      message,
      data,
    };

    if (metadata) {
      responsePayload.metadata = metadata;
    }

    res.status(statusCode).json(responsePayload);
  }

  static error(res: Response, statusCode: number, message: string): void {
    res.status(statusCode).json({
      success: false,
      message,
    });
  }
}
