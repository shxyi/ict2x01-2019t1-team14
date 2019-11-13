import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth'
import { auth } from 'firebase/app'

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

  constructor(
    public afAuth: AngularFireAuth,
    public alertController: AlertController,
    public router: Router

  ) { }

  ngOnInit() {
  }

  // testPassword() {
  //   bool testPassword = testPassword("password123", password.database)
  //   return testPassword
  // } // return false as password entered does not match the password in database
  //
  // testVerified() {
  //   bool testVerified = testVerified("ict2101@gmail.com")
  //   return testVerified
  // } // return true as email is verified
  //
  // testVerified2() {
  //   bool testVerified = testVerified("ict1234@gmail.com")
  //   return testVerified
  // } // return false as email is not verified yet

  async verifyLogin(){
    const {email, password } = this

    const errorAlert = await this.alertController.create({
        header: "Error",
        message: "Invalid login details",
        buttons: ['OK']
      })

      const emailErrorAlert = await this.alertController.create({
          header: "Error",
          message: "Please verify your email",
          buttons: ['OK']
        })

    try {
      const res = await this.afAuth.auth.signInWithEmailAndPassword(this.email, this.password)
      if(res.user.verifyEmail) {
        this.router.navigate(['direction'])
      }
      else {
        await emailErrorAlert.present();
        this.sendEmailVerification(email);
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


  sendVerificationEmail(){
  this.afAuth.authState.subscribe(user =>{
    user.sendVerificationEmail().then(() => {
      console.log("Email has been sent");
      })
    });
  }


//     else{
//
//       }
//     }
//   }
  async goRegister() {
    this.router.navigate(['register'])
  }
}
