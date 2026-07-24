import { IsEnum, IsNotEmpty, IsOptional, IsObject } from 'class-validator';

export enum ProposalStatus {
  PENDING = 'pending',
  CREATED = 'created',
  UPDATED = 'updated',
  DELETED = 'deleted',
  CANCELLED = 'cancelled',
}

export class UpdateProposalDto {
  @IsEnum(ProposalStatus)
  @IsNotEmpty()
  status!: ProposalStatus;

  @IsObject()
  @IsOptional()
  executionResult?: Record<string, any>;
}
