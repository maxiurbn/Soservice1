import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DetallecontratoPageRoutingModule } from './detallecontrato-routing.module';

import { DetallecontratoPage } from './detallecontrato.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DetallecontratoPageRoutingModule
  ],
  declarations: [DetallecontratoPage]
})
export class DetallecontratoPageModule {}
