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
    public afstore: AngularFirestore
  ) {
    this.loginForm = formBuilder.group({
            username: ['', Validators.compose([Validators.maxLength(25), Validators.required, Validators.pattern('[a-zA-Z]*')])],
            password: ['', Validators.compose([Validators.minLength(8), Validators.maxLength(16), Validators.required, Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])[a-zA-Z0-9]+$')])],
            cpassword: ['', Validators.compose([Validators.minLength(8), Validators.maxLength(16), Validators.required, Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])[a-zA-Z0-9]+$')])],
            email: ['', Validators.compose([Validators.required, Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')])],
            age: ['', Validators.required],
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

	ngOnInit() {
	}

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
          message: "Invalid details",
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

  public isValid(control: FormControl): any {

        if(isNaN(control.value)){
            return {
                "not a number": true
            };
        }

        if(control.value % 1 !== 0){
            return {
                "not a whole number": true
            };
        }

        if(control.value < 10){
            return {
                "too young": true
            };
        }

        if (control.value > 100){
            return {
                "not realistic": true
            };
          }
      }
}
