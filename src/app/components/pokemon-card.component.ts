import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { NgFor } from '@angular/common';
import { TYPE_COLORS } from '../constants';
import { capitalize } from '../utils';
import type { Pokemon } from '../models';

@Component({
  selector: 'app-pokemon-card',
  standalone: true,
  imports: [NgFor],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="pokemon-card" (click)="open.emit(pokemon)" [style.backgroundColor]="bgColor">
      <div class="pokemon-id">#{{ pokemon.id }}</div>
      <div class="pokemon-name">{{ cap(pokemon.name) }}</div>

      <div class="pokemon-image">
        <img [src]="pokemon.officialArt" [alt]="cap(pokemon.name)">
      </div>

      <div class="pokemon-types">
        <div class="pokemon-type" *ngFor="let t of pokemon.types">
          <img class="type-icon" [src]="'assets/img/' + t.type.name + '.svg'" [alt]="t.type.name">
          <span>{{ cap(t.type.name) }}</span>
        </div>
      </div>

      <div class="pokemon-stats">
        <span><strong>Größe:</strong> {{ pokemon.height / 10 }} m</span>
        <span><strong>Gewicht:</strong> {{ pokemon.weight / 10 }} kg</span>
      </div>

      <div class="pokemon-abilities">
        <strong>Fähigkeiten:</strong> {{ abilitiesText }}
      </div>

      <div class="pokemon-flavor-text">
        <p>{{ pokemon.flavorText }}</p>
      </div>
    </div>
  `,
})
export class PokemonCardComponent {
  @Input({ required: true }) pokemon!: Pokemon;
  @Output() open = new EventEmitter<Pokemon>();

  cap = capitalize;

  get bgColor(): string {
    const mainType = this.pokemon?.types?.[0]?.type?.name ?? 'normal';
    return TYPE_COLORS[mainType] ?? '#777';
  }

  get abilitiesText(): string {
    const list = this.pokemon?.abilities?.map(a => capitalize(a.ability.name)) ?? [];
    return list.join(', ');
  }
}
