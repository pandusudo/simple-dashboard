import { IsNumber, IsOptional } from 'class-validator';

export class QueryDTO {
  @IsNumber()
  @IsOptional()
  page?: number = 1;

  @IsNumber()
  @IsOptional()
  limit?: number = 25;
}
