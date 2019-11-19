import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { BtnConquerPage } from './btn-conquer.page';

const routes: Routes = [
  {
    path: '',
    component: BtnConquerPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [BtnConquerPage]
})
export class BtnConquerPageModule {}
