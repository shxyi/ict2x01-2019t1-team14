import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth'
import { auth } from 'firebase/app'
import { UserService } from '../user.service';

import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  email: string = ""
  password: string = ""

  hasVerifiedEmail = true;

  constructor(
    public afAuth: AngularFireAuth,
    public alertController: AlertController,
    public router: Router,
    public user: UserService,

  ) {}

  ngOnInit() {
  }

  async verifyLogin(){
    const {email, password } = this

    const errorAlert = await this.alertController.create({
        header: "Error!",
        message: "Invalid login details.",
        buttons: ['OK']
      })

      const emailErrorAlert = await this.alertController.create({
          header: "-Notice-",
          message: "Please verify your email.",
          buttons: ['OK']
        })

    try {
      this.email = "chu_han93@hotmail.com"
      this.password = "Qscmlp753"
      const res = await this.afAuth.auth.signInWithEmailAndPassword(this.email, this.password)
      if(res.user.emailVerified) {
        this.router.navigate(['tabs'])
      }
      else {
        await emailErrorAlert.present();
        this.sendEmailVerification();
      }

      if(res.user) {
        this.user.setUser({
          email,
          uid: res.user.uid
        })
      }
    }
    catch(err) {
      console.dir(err)
      await errorAlert.present()
    }
  }


  sendEmailVerification(){
  this.afAuth.authState.subscribe(user =>{
    user.sendEmailVerification().then(() => {
      console.log("Email has been sent");
      })
    });
  }

  async goRegister() {
    this.router.navigate(['register'])
  }

  async goReset() {
    this.router.navigate(['forgetpw'])
  }
}
