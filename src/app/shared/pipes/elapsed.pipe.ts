import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'elapsed',
  standalone: true,
  pure: true,
})
export class ElapsedPipe implements PipeTransform {
  transform(createdAt: string, now: number): string {
    const createdTime = new Date(createdAt).getTime();
    const difference = Math.max(0, now - createdTime);
    const totalSeconds = Math.floor(difference / 1000);
    const days = Math.floor(totalSeconds / 86400)
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    }
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m ${seconds}s`;
  }
}
