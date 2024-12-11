import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ResultadobusquedaPage } from './resultadobusqueda.page';

const routes: Routes = [
  {
    path: '',
    component: ResultadobusquedaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ResultadobusquedaPageRoutingModule {}
