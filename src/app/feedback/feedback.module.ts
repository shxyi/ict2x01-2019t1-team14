import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { StarRatingModule } from 'ionic4-star-rating';
import { ReactiveFormsModule} from '@angular/forms';

import { FeedbackPage } from './feedback.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StarRatingModule,
    ReactiveFormsModule,
    RouterModule.forChild([
      {
        path: '',
        component: FeedbackPage
      }
    ])
  ],
  declarations: [FeedbackPage]
})
export class FeedbackPageModule {}
