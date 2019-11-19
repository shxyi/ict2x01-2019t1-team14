import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router' /* import page navigation */
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore'
import { AlertController } from '@ionic/angular'; /* import pop up modal alert */


@Component({
  selector: 'app-btn-conquer',
  templateUrl: './btn-conquer.page.html',
  styleUrls: ['./btn-conquer.page.scss'],
})
export class BtnConquerPage implements OnInit {
  userLocation: string // get from firebase
  userPoints: Number // get from firebase

  constructor(public router: Router,
    public alert: AlertController) { }

    buttonClicked = true;  

    //user clicks this btn if they wish to conquer, this btn will check if they are at mrt & have 150pts
    btnConquer() 
    {
      //get user's actual location from firebase and check if its MRT
      if (this.userLocation.includes('MRT')) /*check if user's location has MRT word in it*/
      {
        this.buttonClicked = !this.buttonClicked;
      }
      else if(this.userPoints < 150)
      {
        this.showAlert("Error!","You do not have enough points to conquer")
      }
      else if(!this.userLocation.includes('MRT'))
      {
        this.showAlert("Error!","You are not at an MRT station")
      }
      else
      {
        this.showAlert("Error!","Sorry another user is conquering this MRT")
      }
    }

    //this btn will only be shown if user fulfills the btnConquer criterias
    btnConquerNow()
    {
      this.router.navigate(['conquer']);
    }
  
    async showAlert(header: string, message: string) {
      const alert = await this.alert.create({
        header,
        message,
        buttons: ["Ok"]
      })
      await alert.present()
    }

  ngOnInit() {
  }

}
