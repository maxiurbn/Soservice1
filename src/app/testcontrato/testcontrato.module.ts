import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TestcontratoPageRoutingModule } from './testcontrato-routing.module';

import { TestcontratoPage } from './testcontrato.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TestcontratoPageRoutingModule
  ],
  declarations: [TestcontratoPage]
})
export class TestcontratoPageModule {}
