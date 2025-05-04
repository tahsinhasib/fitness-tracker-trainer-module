export class RequestResetDto {
    email: string;
  }
  
  // DTO/reset-password.dto.ts
  export class ResetPasswordDto {
    token: string;
    newPassword: string;
  }
  