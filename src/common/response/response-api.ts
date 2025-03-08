// src/common/response/response-api.ts

import { HttpStatus } from '@nestjs/common';
import { ValidationError } from 'class-validator'; // Nếu bạn dùng class-validator

// Cấu trúc chuẩn cho mọi response
export interface ICustomResponse<T> {
  statusCode: number;
  message: string;
  data: T | null;
}

export class ResponseApi {
  /**
   * Ví dụ hàm để format các lỗi nếu bạn xài class-validator.
   * Nếu bạn không xài class-validator hoặc muốn code đơn giản hơn,
   * có thể tuỳ chỉnh lại logic này.
   */
  static getFormattedErrors(errors: ValidationError[]): string {
    if (!errors || errors.length === 0) return '';
    const messages: string[] = [];

    errors.forEach((err) => {
      // Mỗi err.constraints là 1 object chứa ruleName: 'nội dung lỗi'
      if (err.constraints) {
        messages.push(...Object.values(err.constraints));
      }
      // Nếu có lỗi lồng nhau
      if (err.children && err.children.length > 0) {
        messages.push(this.getFormattedErrors(err.children));
      }
    });

    return messages.join('\n');
  }

  /**
   * Phản hồi thành công (200, 201, ...)
   * @param message Thông báo
   * @param data Dữ liệu trả về
   * @param statusCode Mã HTTP (mặc định 200)
   */
  static success<T>(
    message: string,
    data: T,
    statusCode: number = HttpStatus.OK,
  ): ICustomResponse<T> {
    return {
      statusCode,
      message,
      data,
    };
  }

  /**
   * Phản hồi lỗi (400, 422, ...)
   * @param errors Mảng ValidationError hoặc string
   * @param statusCode Mã HTTP (mặc định 400)
   */
  static error<T>(
    errors: ValidationError[] | string,
    statusCode: number = HttpStatus.BAD_REQUEST,
  ): ICustomResponse<T> {
    let message = '';
    if (Array.isArray(errors)) {
      message = this.getFormattedErrors(errors);
    } else {
      message = errors; // Nếu bạn truyền thẳng 1 chuỗi lỗi
    }

    return {
      statusCode,
      message,
      data: null,
    };
  }

  /**
   * Tạo lỗi tuỳ chỉnh
   * @param statusCode
   * @param message
   */
  static customError<T>(
    statusCode: number,
    message: string,
  ): ICustomResponse<T> {
    return {
      statusCode,
      message,
      data: null,
    };
  }

  /**
   * Lỗi 404
   */
  static error404<T>(message: string): ICustomResponse<T> {
    return {
      statusCode: HttpStatus.NOT_FOUND,
      message,
      data: null,
    };
  }

  /**
   * Lỗi 403
   */
  static error403<T>(): ICustomResponse<T> {
    return {
      statusCode: HttpStatus.FORBIDDEN,
      message: 'Bạn không có quyền truy cập yêu cầu này!',
      data: null,
    };
  }
}
