import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router' /* import page navigation */
import { AlertController } from '@ionic/angular'; /* import pop up modal alert */


@Component({
  selector: 'app-conquer',
  templateUrl: './conquer.page.html',
  styleUrls: ['./conquer.page.scss'],
})
export class ConquerPage implements OnInit {
  userPoints: Number

  constructor(public router: Router,
    public alert: AlertController) { }
  btnYes() //user click yes to conquer, deduct 150 points
  {
    const {userPoints} = this
    //userPoints - 150
    //return userPoints
    this.showAlert("YAY!","You have conquered this MRT station")
  }
  btnNo() //user click no, return back to route
  {
    this.router.navigate(['direction']);
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
