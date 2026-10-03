import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  output,
} from '@angular/core';

import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TranslocoPipe } from '@jsverse/transloco';
import { OrderType } from '../../../../core/models/order.model';
import { MatIconModule } from '@angular/material/icon';
@Component({
  selector: 'app-board-filters',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    TranslocoPipe,
  ],
  templateUrl: './board-filters.html',
  styleUrl: './board-filters.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoardFilters {
  private readonly destroyRef = inject(DestroyRef);
  readonly searchValue = input('');
  readonly typeValue = input<OrderType | ''>('');
  readonly searchChange = output<string>();
  readonly typeChange = output<OrderType | ''>();
  readonly search = new FormControl('', { nonNullable: true });
  readonly type = new FormControl<OrderType | ''>('', { nonNullable: true });
  constructor() {
    effect(() => {
      this.search.setValue(this.searchValue(), {
        emitEvent: false,
      });
      this.type.setValue(this.typeValue(), {
        emitEvent: false,
      });
    });
    this.search.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        this.searchChange.emit(value.trim());
      });
    this.type.valueChanges
      .pipe(distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        this.typeChange.emit(value);
      });
  }
}
