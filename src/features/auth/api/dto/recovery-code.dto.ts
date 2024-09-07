export class RecoveryCodeDto {
  confirmationCode: string;
  isConfirmed: boolean;
}

// MAPPERS

export const RecoveryCodeDtoMapper = (code: string): RecoveryCodeDto => {
  const outputDto = new RecoveryCodeDto();

  outputDto.confirmationCode = code;
  outputDto.isConfirmed = false;

  return outputDto;
};
