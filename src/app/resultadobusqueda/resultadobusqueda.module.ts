import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ResultadobusquedaPageRoutingModule } from './resultadobusqueda-routing.module';

import { ResultadobusquedaPage } from './resultadobusqueda.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ResultadobusquedaPageRoutingModule
  ],
  declarations: [ResultadobusquedaPage]
})
export class ResultadobusquedaPageModule {}
