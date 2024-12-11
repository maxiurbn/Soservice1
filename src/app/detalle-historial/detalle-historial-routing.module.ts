import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DetalleHistorialPage } from './detalle-historial.page';

const routes: Routes = [
  {
    path: '',
    component: DetalleHistorialPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DetalleHistorialPageRoutingModule {}
