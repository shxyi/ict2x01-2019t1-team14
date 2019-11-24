import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/firestore'
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { UserService } from '../user.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-feedback',
  templateUrl: 'feedback.page.html',
  styleUrls: ['feedback.page.scss'],
})
export class FeedbackPage {

  feedbackPts: number /* from yudi route points */
  customForm: FormGroup;

  constructor(
    public formBuilder: FormBuilder,
    public router: Router,
    public alertController: AlertController,
    public starRate: UserService,
    public activatedRoute : ActivatedRoute,
  ) {
    this.activatedRoute.queryParams.subscribe((res)=>{
      this.feedbackPts = res['routePts']
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
        console.log("changed rating3: ",rating);
        // do your stuff
    }

  ngOnInit() {

        this.customForm = this.formBuilder.group({
            // set default initial value
            starRating: [0],
            starRating2: [0],
            starRating3: [0]
        });

    }

    safety: number;
    speed: number;
    enjoyment: number;
    routeID: string = ""

  feedback(){
    let field = {};
    field['safety'] = this.safety;
    field['speed'] = this.speed;
    field['enjoyment'] = this.enjoyment;
    field['routeID'] = this.routeID;
    this.starRate.setFeedback(field).then(resp => {
      this.speed = 0;
      this.safety = 0;
      this.enjoyment = 0;
      this.routeID = "";
      this.feedbackSubmit();
      this.router.navigate(['/shake-dice'], { // https://stackoverflow.com/questions/52187282/ionic-4-how-to-pass-data-between-pages-using-navctrl-or-router-service
        queryParams: { // pass object to another page
          routePts: this.feedbackPts // data
        }
      });
    })
      .catch(error => {
      });
  }

    async feedbackSubmit() {
      const feedbackAlert = await this.alertController.create({
        header: "Success!",
        message: "Your feedback has been submitted.",
        buttons: ['OK']
      })

      await feedbackAlert.present();
    }

}
