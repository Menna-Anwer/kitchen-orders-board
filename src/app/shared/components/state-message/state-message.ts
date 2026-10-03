import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { TranslocoPipe } from '@jsverse/transloco';

export type StateMessageType = 'loading' | 'empty' | 'error';
@Component({
  selector: 'app-state-message',
  imports: [MatButtonModule, TranslocoPipe],
  templateUrl: './state-message.html',
  styleUrl: './state-message.scss',
})
export class StateMessage {
  readonly type = input.required<StateMessageType>();
  readonly message = input.required<string>();
  readonly retry = output<void>();
}
