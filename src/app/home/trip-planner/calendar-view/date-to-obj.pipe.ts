import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateToObj'
})
export class DateToObjPipe implements PipeTransform {
  transform(value: string): Date | null {
    if (!value) return null;
    // Handles YYYY-MM, YYYY-MM-DD, YYYY-Www, YYYY-Www-D
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      // YYYY-MM-DD
      return new Date(value);
    } else if (/^\d{4}-\d{2}$/.test(value)) {
      // YYYY-MM
      return new Date(value + '-01');
    } else if (/^\d{4}-W\d{2}$/.test(value)) {
      // YYYY-Www (ISO week)
      const [year, week] = value.split('-W');
      const d = new Date(Number(year), 0, 1 + (Number(week) - 1) * 7);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      return new Date(d.setDate(diff));
    } else if (/^\d{4}-W\d{2}-\d$/.test(value)) {
      // YYYY-Www-D (ISO week + day)
      const [year, week, day] = value.match(/(\d{4})-W(\d{2})-(\d)/)!.slice(1);
      const d = new Date(Number(year), 0, 1 + (Number(week) - 1) * 7);
      const baseDay = d.getDay();
      const diff = d.getDate() - baseDay + (baseDay === 0 ? -6 : 1) + (Number(day) - 1);
      return new Date(d.setDate(diff));
    }
    return null;
  }
}
