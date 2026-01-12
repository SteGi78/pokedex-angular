import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';

import type { Pokemon } from '../models';
import { PokemonCardComponent } from './pokemon-card.component';

@Component({
  selector: 'app-pokemon-list',
  standalone: true,
  imports: [NgFor, NgIf, PokemonCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main id="pokedex">
      <ng-container *ngIf="pokemonList?.length; else empty">
        <app-pokemon-card
          *ngFor="let p of pokemonList; trackBy: trackById"
          [pokemon]="p"
          (open)="open.emit($event)">
        </app-pokemon-card>
      </ng-container>
      <ng-template #empty>
        <p>Keine Pokémon gefunden.</p>
      </ng-template>
    </main>
  `
})
export class PokemonListComponent {
  @Input() pokemonList: Pokemon[] = [];
  @Output() open = new EventEmitter<Pokemon>();

  trackById = (_: number, p: Pokemon) => p.id;
}
