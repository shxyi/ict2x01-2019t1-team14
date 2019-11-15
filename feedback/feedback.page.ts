import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-feedback',
  templateUrl: 'feedback.page.html',
  styleUrls: ['feedback.page.scss'],
})
export class FeedbackPage {

  customForm: FormGroup;

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit() {

        this.customForm = this.formBuilder.group({
            // set default initial value
            starRating: [3],
            starRating2: [4],
            starRating3: [2]
        });

    }

  logRatingChange(rating){
        console.log("changed rating: ",rating);
        // do your stuff
    }

    logRatingChange2(rating){
        console.log("changed rating2: ",rating);
        // do your stuff
    }

    logRatingChange3(rating){
        console.log("changed rating2: ",rating);
        // do your stuff
    }

}
