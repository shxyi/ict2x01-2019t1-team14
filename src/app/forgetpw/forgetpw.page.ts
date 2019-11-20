import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth'
import { auth } from 'firebase/app'
import { UserService } from '../user.service';

import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgetpw',
  templateUrl: './forgetpw.page.html',
  styleUrls: ['./forgetpw.page.scss'],
})
export class ForgetpwPage implements OnInit {

  email: string

  constructor(
    public afAuth: AngularFireAuth,
    public alertController: AlertController,
    public router: Router,
    public user: UserService,
  ) {}

  ngOnInit() {
  }

  async errorAlert() {
    const alert = await this.alertController.create({
        header: "Error!",
        message: "Email is not registered.",
        buttons: ['OK']
      });

      await alert.present();
    }

    async successAlert() {
      const alert = await this.alertController.create({
        header: "Success!",
        message: "Please click on the link that is sent to your registered email address.",
        buttons: ['OK']
      });

      await alert.present()
    }

  resetpw(){

     this.afAuth.auth.sendPasswordResetEmail(this.email).then(data => {
       console.log(data)
       console.log("success")
       this.successAlert()
       this.router.navigate(['login']);
     }) .catch(err =>{
       console.log("fail");
       this.errorAlert();
     });
   }
 }
