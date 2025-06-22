import { environment } from '../../environments/environment';

export function getMediaUrl(filePath: string): string {
  return `${environment.mediaBaseUrl}/${filePath}`.replace(/([^:]\/)\/+/g, '$1');
}