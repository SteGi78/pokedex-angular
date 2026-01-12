import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-pokedex-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header>
      <div class="logo">
        <img src="assets/img/poke-ball-icon.svg" alt="Pokédex Logo">
      </div>
      <h1>Pokédex</h1>
      <div class="search-sort">
        <input
          type="text"
          [value]="searchQuery"
          (input)="searchQueryChange.emit(($any($event.target)).value)"
          placeholder="Mindestens 3 Buchstaben..." />

        <label for="sortSelect">Sortieren:</label>
        <select id="sortSelect" [value]="sortBy" (change)="sortByChange.emit(($any($event.target)).value)">
          <option value="id">Nach Nummer</option>
          <option value="name">Nach Name</option>
        </select>
      </div>
    </header>
  `
})
export class PokedexHeaderComponent {
  @Input() searchQuery = '';
  @Input() sortBy: 'id' | 'name' = 'id';

  @Output() searchQueryChange = new EventEmitter<string>();
  @Output() sortByChange = new EventEmitter<'id' | 'name'>();
}
