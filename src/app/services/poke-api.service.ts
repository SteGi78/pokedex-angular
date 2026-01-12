import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, timeout } from 'rxjs';

import { POKE_API_BASE_URL } from '../constants';
import { mapWithConcurrency } from '../utils';
import type { Pokemon } from '../models';

type SpeciesData = {
  flavor_text_entries: Array<{ flavor_text: string; language: { name: string } }>;
  evolution_chain?: { url?: string };
};

type EvolutionChain = {
  chain?: any;
};

@Injectable({ providedIn: 'root' })
export class PokeApiService {
  private readonly pokemonCache = new Map<string | number, Pokemon>();
  private readonly speciesCache = new Map<string | number, SpeciesData>();

  constructor(private readonly http: HttpClient) {}

  private async getJson<T>(url: string): Promise<T> {
    // Verhindert „endloses Laden“, falls Netzwerk/Adblocker/Firewall die Anfrage hängt.
    return await firstValueFrom(this.http.get<T>(url).pipe(timeout(15000)));
  }

  async getPokemonBatch(startId: number, count: number, concurrency = 6): Promise<Pokemon[]> {
    const ids = Array.from({ length: count }, (_, i) => startId + i);
    const results = await mapWithConcurrency(ids, concurrency, async (id) => {
      try {
        return await this.getPokemon(id);
      } catch (e) {
        console.error('Fehler beim Laden von Pokémon', id, e);
        return null as any;
      }
    });
    return results.filter(Boolean);
  }

  async getPokemon(idOrName: number | string): Promise<Pokemon> {
    const key = String(idOrName).toLowerCase();
    const cached = this.pokemonCache.get(key) || this.pokemonCache.get(idOrName);
    if (cached) return cached;

    const [pokemonData, speciesData] = await Promise.all([
      this.getJson<any>(`${POKE_API_BASE_URL}/pokemon/${idOrName}`),
      this.getSpecies(idOrName)
    ]);

    const officialArt: string =
      pokemonData?.sprites?.other?.['official-artwork']?.front_default
      || pokemonData?.sprites?.front_default
      || 'assets/img/fallback-image.svg';

    const flavorText = this.pickFlavorText(speciesData);

    const enriched: Pokemon = {
      ...pokemonData,
      officialArt,
      flavorText
    };

    this.pokemonCache.set(key, enriched);
    this.pokemonCache.set(pokemonData.id, enriched);
    return enriched;
  }

  async getEvolutionPokemon(pokemonId: number): Promise<Pokemon[]> {
    const speciesData = await this.getSpecies(pokemonId);
    const evoUrl = speciesData.evolution_chain?.url;
    if (!evoUrl) return [];

    const chainData = await this.getJson<EvolutionChain>(evoUrl);
    const ids = this.parseEvolutionChain(chainData.chain).filter(Boolean);

    const pokemon = await mapWithConcurrency(ids, 4, async (id) => {
      try {
        return await this.getPokemon(Number(id));
      } catch (e) {
        console.error('Fehler Evolution Pokémon', id, e);
        return null as any;
      }
    });

    return pokemon.filter(Boolean);
  }

  private async getSpecies(idOrName: number | string): Promise<SpeciesData> {
    const key = String(idOrName).toLowerCase();
    const cached = this.speciesCache.get(key) || this.speciesCache.get(idOrName);
    if (cached) return cached;

    const speciesData = await this.getJson<SpeciesData>(`${POKE_API_BASE_URL}/pokemon-species/${idOrName}`);
    this.speciesCache.set(key, speciesData);
    return speciesData;
  }

  private pickFlavorText(speciesData: SpeciesData): string {
    const entries = speciesData?.flavor_text_entries ?? [];
    const german = entries.find(e => e.language?.name === 'de');
    if (german?.flavor_text) return german.flavor_text.replace(/\n|\f/g, ' ');
    const en = entries.find(e => e.language?.name === 'en');
    if (en?.flavor_text) return en.flavor_text.replace(/\n|\f/g, ' ');
    return '';
  }

  private parseEvolutionChain(chain: any, list: string[] = []): string[] {
    if (!chain?.species?.url) return list;
    const urlParts = String(chain.species.url).split('/');
    const speciesId = urlParts[urlParts.length - 2];
    if (speciesId) list.push(speciesId);
    const evolvesTo = chain.evolves_to ?? [];
    evolvesTo.forEach((next: any) => this.parseEvolutionChain(next, list));
    return list;
  }
}
