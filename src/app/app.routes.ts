import { Routes } from '@angular/router';
import { PokedexPageComponent } from './pages/pokedex-page.component';

export const routes: Routes = [
  { path: '', component: PokedexPageComponent },
  { path: '**', redirectTo: '' }
];
