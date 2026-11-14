import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { SearchIconComponent } from '../icons/search-icon/search-icon.component';

@Component({
  selector: 'app-search-input',
  templateUrl: './search-input.component.html',
  styleUrls: ['./search-input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, SearchIconComponent],
})
export class SearchInputComponent {
  readonly control = input.required<FormControl<string | null>>();
  readonly placeholder = input<string>('Search...');
  readonly ariaLabel = input<string>('Search');
}
