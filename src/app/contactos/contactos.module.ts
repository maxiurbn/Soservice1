import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { FilterByRolePipe } from '../pipes/filter-by-role.pipe'; 
import { ContactosPageRoutingModule } from './contactos-routing.module';

import { ContactosPage } from './contactos.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ContactosPageRoutingModule
  ],
  declarations: [ContactosPage,FilterByRolePipe ]
})
export class ContactosPageModule {}
