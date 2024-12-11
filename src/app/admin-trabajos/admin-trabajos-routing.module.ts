import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AdminTrabajosPage } from './admin-trabajos.page';

const routes: Routes = [
  {
    path: '',
    component: AdminTrabajosPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminTrabajosPageRoutingModule {}
