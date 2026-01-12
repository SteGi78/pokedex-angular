import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  Output,
  SimpleChanges
} from '@angular/core';
import { NgFor, NgIf } from '@angular/common';

import type { Pokemon } from '../models';
import { TYPE_COLORS } from '../constants';
import { capitalize, isDarkColor } from '../utils';
import { PokeApiService } from '../services/poke-api.service';

type Tab = 'overview' | 'stats' | 'evolution';

@Component({
  selector: 'app-pokemon-modal',
  standalone: true,
  imports: [NgIf, NgFor],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="modal"
      [class.hidden]="!pokemon"
      (click)="onBackdropClick()">

      <div
        class="modal-content"
        *ngIf="pokemon"
        (click)="$event.stopPropagation()"
        [style.backgroundColor]="modalBg"
        [style.color]="modalTextColor">

        <button class="close" (click)="close.emit()">&times;</button>
        <button
          class="nav-arrow prev"
          [disabled]="!canPrev"
          (click)="canPrev && prev.emit(); $event.stopPropagation()"
          aria-label="Vorheriges Pokémon">&larr;</button>

        <button
          class="nav-arrow next"
          [disabled]="!canNext"
          (click)="canNext && next.emit(); $event.stopPropagation()"
          aria-label="Nächstes Pokémon">&rarr;</button>

        <div class="modal-header">
          <div class="modal-number">#{{ pokemon.id }}</div>
          <div class="modal-name">{{ cap(pokemon.name) }}</div>
          <img id="modal-img" [src]="pokemon.officialArt" [alt]="cap(pokemon.name)">
        </div>

        <div class="modal-tabs">
          <button class="tab-button" [class.active]="activeTab==='overview'" (click)="activeTab='overview'">Overview</button>
          <button class="tab-button" [class.active]="activeTab==='stats'" (click)="activeTab='stats'">Stats</button>
          <button class="tab-button" [class.active]="activeTab==='evolution'" (click)="activeTab='evolution'">Evolution</button>
        </div>

        <div class="modal-tab-content">
          <div id="overview" class="tab-content" [class.active]="activeTab==='overview'">
            <p><strong>ID:</strong> {{ pokemon.id }}</p>
            <p><strong>Name:</strong> {{ cap(pokemon.name) }}</p>

            <div>
              <strong>Types:</strong>
              <span class="pokemon-types">
                <span class="pokemon-type" *ngFor="let t of pokemon.types">
                  <img class="type-icon" [src]="'assets/img/' + t.type.name + '.svg'" [alt]="t.type.name">
                  <span>{{ cap(t.type.name) }}</span>
                </span>
              </span>
            </div>

            <p><strong>Height:</strong> {{ pokemon.height / 10 }} m</p>
            <p><strong>Weight:</strong> {{ pokemon.weight / 10 }} kg</p>
            <p><strong>Abilities:</strong> {{ abilitiesText }}</p>
            <hr>
            <p>{{ pokemon.flavorText }}</p>
          </div>

          <div id="stats" class="tab-content" [class.active]="activeTab==='stats'">
            <h3>Stats</h3>
            <div class="stat-row" *ngFor="let s of pokemon.stats; let i = index">
              <div class="stat-label">
                <strong>{{ statLabel(i, s.stat.name) }}:</strong> {{ s.base_stat }}
              </div>
              <div class="stat-bar-container">
                <div class="stat-bar-fill" [style.width]="statPercent(s.base_stat) + '%'" ></div>
              </div>
            </div>
          </div>

          <div id="evolution" class="tab-content" [class.active]="activeTab==='evolution'">
            <ng-container *ngIf="evolutionLoading; else evoContent">
              <p>Lade Evolutionsdaten...</p>
            </ng-container>

            <ng-template #evoContent>
              <ng-container *ngIf="evolutionPokemon.length; else noEvo">
                <ng-container *ngFor="let p of evolutionPokemon; let last = last">
                  <div class="evolution-stage" (click)="openEvolution(p); $event.stopPropagation()">
                    <img [src]="p.sprites?.front_default || 'assets/img/fallback-image.svg'" [alt]="p.name">
                    <div class="evolution-name">{{ cap(p.name) }}</div>
                  </div>
                  <div class="evolution-arrow" *ngIf="!last">→</div>
                </ng-container>
              </ng-container>
              <ng-template #noEvo>
                <p>Keine Evolution verfügbar.</p>
              </ng-template>
            </ng-template>
          </div>
        </div>
      </div>
    </div>
  `
})
export class PokemonModalComponent implements OnChanges {
  @Input() pokemon: Pokemon | null = null;

  /** Wird vom Parent gepflegt – fürs Blättern im Modal */
  @Input() canPrev = false;
  @Input() canNext = false;

  @Output() close = new EventEmitter<void>();
  @Output() prev = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();
  @Output() openPokemonById = new EventEmitter<number>();

  activeTab: Tab = 'overview';
  evolutionLoading = false;
  evolutionPokemon: Pokemon[] = [];

  cap = capitalize;

  constructor(
    private readonly api: PokeApiService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['pokemon']) {
      this.activeTab = 'overview';
      this.loadEvolution();
      this.cdr.markForCheck();
    }
  }

  @HostListener('document:keydown.escape')
  onEsc(): void {
    if (this.pokemon) this.close.emit();
  }

  onBackdropClick(): void {
    this.close.emit();
  }

  get modalBg(): string {
    if (!this.pokemon) return '#ffffff';
    const mainType = this.pokemon.types?.[0]?.type?.name ?? 'normal';
    return TYPE_COLORS[mainType] ?? '#777';
  }

  get modalTextColor(): string {
    return isDarkColor(this.modalBg) ? '#fff' : '#000';
  }

  get abilitiesText(): string {
    const list = this.pokemon?.abilities?.map(a => capitalize(a.ability.name)) ?? [];
    return list.join(', ');
  }

  statLabel(index: number, fallbackName: string): string {
    // kompatibel zur alten Darstellung
    const labels = ['HP', 'Attack', 'Defense', 'Sp. Atk', 'Sp. Def', 'Speed'];
    return labels[index] ?? capitalize(fallbackName);
  }

  statPercent(value: number): number {
    const maxStat = 255;
    return Math.max(0, Math.min(100, Math.round((value / maxStat) * 100)));
  }

  openEvolution(p: Pokemon): void {
    this.openPokemonById.emit(p.id);
  }

  private async loadEvolution(): Promise<void> {
    if (!this.pokemon) {
      this.evolutionPokemon = [];
      this.evolutionLoading = false;
      this.cdr.markForCheck();
      return;
    }

    this.evolutionLoading = true;
    this.cdr.markForCheck();
    try {
      this.evolutionPokemon = await this.api.getEvolutionPokemon(this.pokemon.id);
    } catch (e) {
      console.error('Evolution laden fehlgeschlagen', e);
      this.evolutionPokemon = [];
    } finally {
      this.evolutionLoading = false;
      this.cdr.markForCheck();
    }
  }
}
