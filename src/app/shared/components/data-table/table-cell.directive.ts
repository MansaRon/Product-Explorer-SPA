import { Directive, inject, input, TemplateRef } from '@angular/core';

@Directive({ selector: '[appTableCell]' })
export class TableCellDirective {
  readonly column = input.required<string>({ alias: 'appTableCell' });
  readonly template = inject(TemplateRef<{ $implicit: unknown }>);
}
