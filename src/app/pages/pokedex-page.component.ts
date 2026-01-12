import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';

import type { Pokemon } from '../models';
import { PokeApiService } from '../services/poke-api.service';
import { PokedexHeaderComponent } from '../components/pokedex-header.component';
import { PokemonListComponent } from '../components/pokemon-list.component';
import { PokemonModalComponent } from '../components/pokemon-modal.component';
import { PokedexFooterComponent } from '../components/pokedex-footer.component';

@Component({
  selector: 'app-pokedex-page',
  standalone: true,
  imports: [NgIf, PokedexHeaderComponent, PokemonListComponent, PokemonModalComponent, PokedexFooterComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container">
      <app-pokedex-header
        [searchQuery]="searchQuery"
        [sortBy]="sortBy"
        (searchQueryChange)="onSearch($event)"
        (sortByChange)="onSort($event)">
      </app-pokedex-header>

      <app-pokemon-list
        [pokemonList]="displayedPokemon"
        (open)="openModal($event)">
      </app-pokemon-list>

      <div class="loading" *ngIf="loading">
        <div id="progressText">Lade Pokémon...</div>
        <div id="progressBarContainer">
          <div id="progressBar"></div>
        </div>
      </div>

      <button (click)="loadMore()" [disabled]="loading">Mehr laden</button>

      <app-pokemon-modal
        [pokemon]="selectedPokemon"
        [canPrev]="canPrev"
        [canNext]="canNext"
        (close)="closeModal()"
        (prev)="prevPokemon()"
        (next)="nextPokemon()"
        (openPokemonById)="openPokemonById($event)">
      </app-pokemon-modal>

      <app-pokedex-footer></app-pokedex-footer>
    </div>
  `
})
export class PokedexPageComponent implements OnInit {
  allPokemon: Pokemon[] = [];
  displayedPokemon: Pokemon[] = [];

  searchQuery = '';
  sortBy: 'id' | 'name' = 'id';

  loading = false;
  private currentOffset = 1;
  private readonly loadCount = 20;

  selectedPokemon: Pokemon | null = null;
  private modalIndex = -1;

  constructor(
    private readonly api: PokeApiService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    await this.loadMore();
  }

  async loadMore(): Promise<void> {
    if (this.loading) return;
    this.loading = true;
    this.cdr.markForCheck();

    try {
      const batch = await this.api.getPokemonBatch(this.currentOffset, this.loadCount);
      this.currentOffset += this.loadCount;
      this.mergePokemon(batch);
      this.updateDisplayed();
    } finally {
      this.loading = false;
      this.cdr.markForCheck();
    }
  }

  onSearch(query: string): void {
    this.searchQuery = query;
    this.updateDisplayed();
  }

  onSort(sortBy: 'id' | 'name'): void {
    this.sortBy = sortBy;
    this.updateDisplayed();
  }

  openModal(pokemon: Pokemon): void {
    this.selectedPokemon = pokemon;
    this.modalIndex = this.allPokemon.findIndex(p => p.id === pokemon.id);
    document.body.style.overflow = 'hidden';
  }

  closeModal(): void {
    this.selectedPokemon = null;
    this.modalIndex = -1;
    document.body.style.overflow = '';
  }

  get canPrev(): boolean {
    return this.selectedPokemon !== null && this.modalIndex > 0;
  }

  get canNext(): boolean {
    return this.selectedPokemon !== null && this.modalIndex >= 0 && this.modalIndex < this.allPokemon.length - 1;
  }

  prevPokemon(): void {
    if (!this.canPrev) return;
    this.modalIndex -= 1;
    this.selectedPokemon = this.allPokemon[this.modalIndex];
  }

  nextPokemon(): void {
    if (!this.canNext) return;
    this.modalIndex += 1;
    this.selectedPokemon = this.allPokemon[this.modalIndex];
  }

  async openPokemonById(id: number): Promise<void> {
    const existing = this.allPokemon.find(p => p.id === id);
    if (existing) {
      this.openModal(existing);
      return;
    }

    this.loading = true;
    this.cdr.markForCheck();
    try {
      const p = await this.api.getPokemon(id);
      this.mergePokemon([p]);
      this.updateDisplayed();
      this.openModal(p);
    } finally {
      this.loading = false;
      this.cdr.markForCheck();
    }
  }

  private mergePokemon(items: Pokemon[]): void {
    for (const p of items) {
      if (!p) continue;
      if (this.allPokemon.some(x => x.id === p.id)) continue;
      this.allPokemon.push(p);
    }
  }

  private updateDisplayed(): void {
    const q = this.searchQuery.trim().toLowerCase();

    let list: Pokemon[];
    if (q.length < 3) {
      list = [...this.allPokemon];
    } else {
      list = this.allPokemon
        .filter(p => p.name.toLowerCase().includes(q))
        .slice(0, 10);
    }

    if (this.sortBy === 'name') {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    } else {
      list = [...list].sort((a, b) => a.id - b.id);
    }

    this.displayedPokemon = list;
    // Bei OnPush sicherstellen, dass der View nach Promise-Updates neu gerendert wird.
    this.cdr.markForCheck();
  }
}
