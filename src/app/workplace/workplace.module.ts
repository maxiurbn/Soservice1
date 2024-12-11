import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { WorkplacePageRoutingModule } from './workplace-routing.module';

import { WorkplacePage } from './workplace.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    WorkplacePageRoutingModule
  ],
  declarations: [WorkplacePage]
})
export class WorkplacePageModule {}
