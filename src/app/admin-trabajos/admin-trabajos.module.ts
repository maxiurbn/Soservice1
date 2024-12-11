import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AdminTrabajosPageRoutingModule } from './admin-trabajos-routing.module';

import { AdminTrabajosPage } from './admin-trabajos.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AdminTrabajosPageRoutingModule
  ],
  declarations: [AdminTrabajosPage]
})
export class AdminTrabajosPageModule {}
