export interface BaseEvent<T = any> {
  event: string;
  data: T;
  timestamp?: string;
  version?: string;
}
