import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'calendarMonth' })
export class CalendarMonthPipe implements PipeTransform {
  transform(trips: any[], date: Date): any[] {
    // Filter trips for the selected month
    return trips
      .filter(trip => {
        const tripDate = new Date(trip.srcStartDate);
        return tripDate.getMonth() === date.getMonth() && tripDate.getFullYear() === date.getFullYear();
      })
      .sort((a, b) => new Date(a.srcStartDate).getTime() - new Date(b.srcStartDate).getTime());
  }
}

@Pipe({ name: 'calendarWeek' })
export class CalendarWeekPipe implements PipeTransform {
  transform(trips: any[], date: Date): any[] {
    // Filter trips for the selected week
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay());
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return trips
      .filter(trip => {
        const tripDate = new Date(trip.srcStartDate);
        return tripDate >= start && tripDate <= end;
      })
      .sort((a, b) => new Date(a.srcStartDate).getTime() - new Date(b.srcStartDate).getTime());
  }
}

@Pipe({ name: 'calendarDay' })
export class CalendarDayPipe implements PipeTransform {
  transform(trips: any[], date: Date): any[] {
    // Filter trips for the selected day
    return trips
      .filter(trip => {
        const tripDate = new Date(trip.srcStartDate);
        return tripDate.toDateString() === date.toDateString();
      })
      .sort((a, b) => new Date(a.srcStartDate).getTime() - new Date(b.srcStartDate).getTime());
  }
}
