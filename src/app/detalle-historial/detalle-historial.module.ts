import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DetalleHistorialPageRoutingModule } from './detalle-historial-routing.module';

import { DetalleHistorialPage } from './detalle-historial.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DetalleHistorialPageRoutingModule
  ],
  declarations: [DetalleHistorialPage]
})
export class DetalleHistorialPageModule {}
