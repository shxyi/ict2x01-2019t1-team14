import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { auth } from 'firebase/app'

import { AngularFirestore } from '@angular/fire/firestore'
import { UserService } from '../user.service';
import {FormBuilder, FormGroup, FormControl, Validators} from '@angular/forms';

import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {

  public loginForm: FormGroup;

	constructor(
    public afAuth: AngularFireAuth,
    public alertController: AlertController,
    public router: Router,
    public formBuilder: FormBuilder,
    public user: UserService,
    public afstore: AngularFirestore,
  ) {
    this.loginForm = formBuilder.group({
            username: ['', Validators.compose([Validators.required, Validators.maxLength(25), Validators.pattern('[a-zA-Z]*')])],
            password: ['', Validators.compose([Validators.required, Validators.minLength(8), Validators.maxLength(16), Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])[a-zA-Z0-9]+$')])],
            cpassword: ['', Validators.compose([Validators.required, Validators.minLength(8), Validators.maxLength(16),  Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])[a-zA-Z0-9]+$')])],
            email: ['', Validators.compose([Validators.required, Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')])],
            age: ['',  AgeValidator.isValid],
            gender: ['', Validators.required],
            commuteM: ['', Validators.required],
        });
  }

    username: string = ""
  	password: string = ""
  	cpassword: string = ""
    email: string = ""
    age: string = ""
    gender:string = ""
    commuteM: string = ""
    points: number = 0
    stationConquered: string = ""

	ngOnInit() {
	}

  async verifyRegister() {
    const { username, password, cpassword, email, age, gender, commuteM, points, stationConquered } = this

    const errorAlert = await this.alertController.create({
        header: "Error!",
        message: "Password does not match.",
        buttons: ['OK']
      })

      const successAlert = await this.alertController.create({
        header: "Success!",
        message: "Registration is successful! You may now login.",
        buttons: ['OK']
      })

      const errorEAlert = await this.alertController.create({
          header: "Error!",
          message: "Invalid details.",
          buttons: ['OK']
        })

    if (password !== cpassword) {
      await errorAlert.present()
    }

    else {
      try {
        const res = await this.afAuth.auth.createUserWithEmailAndPassword(this.email, this.password)

        this.afstore.doc(`users/${res.user.uid}`).set({
          username, password, email, age, gender, commuteM, points, stationConquered
        })

        this.user.setUser ({
          email,
          uid: res.user.uid
        })

        await successAlert.present()
        this.router.navigate(['login']);
      }

      catch(error) {
        //await errorEAlert.present()
        this.showAlert("Error", error.message)
      }
    }
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

export class AgeValidator {

	static isValid(control: FormControl): any {

		if(isNaN(control.value)){
			return {
				"Not a number": true
			};
		}

		if(control.value % 1 !== 0){
			return {
				"Not a whole number": true
			};
		}

		if(control.value < 8){
			return {
				"Too young": true
			};
		}

		if (control.value > 90){
			return {
				"Not realistic": true
			};
		}

		return null;
	}
}
