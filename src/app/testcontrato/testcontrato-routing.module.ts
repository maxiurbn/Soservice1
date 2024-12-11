import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TestcontratoPage } from './testcontrato.page';

const routes: Routes = [
  {
    path: '',
    component: TestcontratoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TestcontratoPageRoutingModule {}
