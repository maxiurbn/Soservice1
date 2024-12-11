import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DetallecontratoPage } from './detallecontrato.page';

const routes: Routes = [
  {
    path: '',
    component: DetallecontratoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DetallecontratoPageRoutingModule {}
