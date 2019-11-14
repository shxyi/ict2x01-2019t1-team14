import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { auth } from 'firebase/app'

import { AngularFirestore } from '@angular/fire/firestore'
import { UserService } from '../user.service';

import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {

  username: string = ""
	password: string = ""
	cpassword: string = ""
  email: string = ""
  age: string = ""

  gender:string = ""
  commuteM: string = ""

  //emailFormat: true;
  //ageFormat: true;

	constructor(
    public afAuth: AngularFireAuth,
    public alertController: AlertController,
    public router: Router,
    public user: UserService,
    public afstore: AngularFirestore
  ) { }

	ngOnInit() {
	}

  // validateEmail(eaddress, edomain){
  //   if (edomain != "@gmail.com" || eaddress =="") {
  //     this.showAlert("Error!", "Invalid email format, please check again.")
  //     this.emailFormat = false;
  //   }
  //
  //   else {
  //     return this.emailFormat
  //   }
  // }
  //
  // validateAge(age){
  //   if (age <=0 || age >= 90) {
  //     this.showAlert("Error!", "Invalid age, please check again.")
  //     this.ageFormat = false;
  //   }
  //
  //   else {
  //     return this.ageFormat
  //   }
  // }
  //
  // validatePassword(password, cpassword){
  //   if (password != cpassword) {
  //     this.showAlert("Error!", "Password does not match.")
  //     this.ageFormat = false;
  //   }
  //
  //   else {
  //     return this.ageFormat
  //   }
  // }
  //
  // testValidateEmail() {
  //   bool testEmailFormat = validateEmail("ict2101")
  //   return testEmailFormat
  // } // wrong email format, need to be "@gmail.com"
  //
  // testValidateEmail() {
  //   bool testEmailFormat = validateEmail("ict2101@gmail.com")
  //   return testEmailFormat
  // } // valid email format
  //
  // testValidatePassword() {
  //   bool testPassword = validatePassword("password123", "password321")
  //   return testPassword
  // } // password keyed in and confirm password is different

  async verifyRegister() {
    const { username, password, cpassword, email, age, gender, commuteM } = this

    const errorAlert = await this.alertController.create({
        header: "Error!",
        message: "Password does not match",
        buttons: ['OK']
      })

      const successAlert = await this.alertController.create({
        header: "Success!",
        message: "Registration is successful! You may now login",
        buttons: ['OK']
      })

      const errorEAlert = await this.alertController.create({
          header: "Error!",
          message: "Email is in the wrong format",
          buttons: ['OK']
        })

    if (password !== cpassword) {
      await errorAlert.present()
    }

    else {
      try {
        const res = await this.afAuth.auth.createUserWithEmailAndPassword(this.email, this.password)

        this.afstore.doc('users/${res.user.uid}').set({
          username, password, email, age, gender, commuteM
        })

        this.user.setUser ({
          email,
          uid: res.user.uid
        })

        await successAlert.present()
        this.router.navigate(['login']);
      }

      catch(error) {
        await errorEAlert.present()
      }
    }
  }
}
