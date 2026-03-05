import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'titlecaseWithSpaces'
})
export class TitlecaseWithSpacesPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';
    // Insert space before capital letters and numbers, then title case
    return value
      .replace(/([a-z])([A-Z0-9])/g, '$1 $2')
      .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
      .replace(/_/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  }
}