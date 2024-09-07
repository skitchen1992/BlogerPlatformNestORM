export class LoginOutputDto {
  accessToken: string;
}

// MAPPERS

export const LoginOutputDtoMapper = (accessToken: string): LoginOutputDto => {
  const outputDto = new LoginOutputDto();

  outputDto.accessToken = accessToken;

  return outputDto;
};
