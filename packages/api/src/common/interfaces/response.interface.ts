/**
 * 统一的接口响应格式
 */
export interface CommonResponse<T = any> {
  code: string;
  message: string;
  data?: T;
} 