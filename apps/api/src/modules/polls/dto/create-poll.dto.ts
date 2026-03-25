import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
  IsInt,
  Min,
  ArrayMinSize,
} from 'class-validator';

export class CreatePollOptionDto {
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsInt()
  @Min(0)
  order_index: number;
}

export class CreatePollDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsNotEmpty()
  expires_at: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePollOptionDto)
  @ArrayMinSize(2, { message: 'Poll must have at least two options' })
  options: CreatePollOptionDto[];
}
