import { ApiProperty } from '@nestjs/swagger';
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
  @ApiProperty({ type: 'string' })
  description: string;

  @IsInt()
  @Min(0)
  @ApiProperty({ type: 'number', format: 'int32', minimum: 0 })
  orderIndex: number;
}

export class CreatePollDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @ApiProperty({ type: 'string', minLength: 3 })
  title: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ type: 'string', required: false })
  description?: string;

  @IsDateString()
  @IsNotEmpty()
  @ApiProperty({ type: 'string', format: 'date-time' })
  expiresAt: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePollOptionDto)
  @ArrayMinSize(2, { message: 'Poll must have at least two options' })
  @ApiProperty({ type: [CreatePollOptionDto], minItems: 2 })
  options: CreatePollOptionDto[];
}
