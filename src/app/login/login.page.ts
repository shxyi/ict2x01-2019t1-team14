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
      if(this.email=="" || this.password==""){
        this.showAlert("Error", "One or more fields are empty.")
        return
      }

      const res = await this.afAuth.auth.signInWithEmailAndPassword(this.email, this.password)
      if(res.user.emailVerified) {
        this.router.navigate(['tabs/direction'])
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
      if(err.code==="auth/user-not-found" || err.code==="auth/invalid-email"){
        this.showAlert("Error", "User not found.")
      }
      else if(err.code === "auth/wrong-password"){
        this.showAlert("Error", "The password is incorrect.")
      }
      else{
        this.showAlert("Error", err.message)
        console.dir(err)
        //await errorAlert.present()
      }
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

  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ["Ok"]
    })
    await alert.present()
  }
}
