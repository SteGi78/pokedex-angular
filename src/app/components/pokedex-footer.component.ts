import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-pokedex-footer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer>
      <p>© 2025 Pokédex App</p>
    </footer>
  `
})
export class PokedexFooterComponent {}
