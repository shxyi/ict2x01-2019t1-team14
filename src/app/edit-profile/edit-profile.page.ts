import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore'
import { UserService } from '../user.service';
import { Router } from '@angular/router' /* import page navigation */
import { FormBuilder, FormGroup, FormControl, Validators} from '@angular/forms';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.page.html',
  styleUrls: ['./edit-profile.page.scss'],
})
export class EditProfilePage implements OnInit {

  public loginForm: FormGroup;

  mainuser: AngularFirestoreDocument
  sub
  username: string = ""
  password: string = ""
  cpassword: string = ""
  commuteMethod: any
  gender: any
  age: number
  email: string = ""
  firebaseUsername: string = ""
  firebasePassword: string = ""
  firebaseCommuteMethod: any
  firebaseGender: any
  firebaseAge: number
  firebaseEmail: string = ""

  constructor(
    private afs: AngularFirestore,
    private user: UserService,
    public router: Router,
    public formBuilder: FormBuilder,
    public alert: AlertController,
  ) {
      this.mainuser = afs.doc(`users/${user.getUID()}`)
  		this.sub = this.mainuser.valueChanges().subscribe(event => {
        this.firebaseUsername = event.username
        this.firebasePassword = event.password
        this.firebaseCommuteMethod = event.commuteMethod
        this.firebaseGender = event.gender
        this.firebaseAge = event.age
        this.firebaseEmail = event.email
      })

      this.loginForm = formBuilder.group({
        username: ['', Validators.compose([Validators.required, Validators.maxLength(25), Validators.pattern('[a-zA-Z]*')])],
        password: ['', Validators.compose([Validators.required, Validators.minLength(8), Validators.maxLength(16), Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])[a-zA-Z0-9]+$')])],
        cpassword: ['', Validators.compose([Validators.required, Validators.minLength(8), Validators.maxLength(16),  Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])[a-zA-Z0-9]+$')])],
        email: ['', Validators.compose([Validators.required, Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')])],
        age: ['',  AgeValidator.isValid],
        gender: ['', Validators.required],
        commuteMethod: ['', Validators.required],
    });

  }

  ngOnInit() {
  }

  async updateProfile() {
    /* validation */
    if(this.username=="" || this.password=="" || this.commuteMethod==null || this.gender==null || this.age==null || this.email==""){
      this.showAlert("Error", "One or more fields are empty.")
      return
    }

    if(this.cpassword !== ""){
      if(this.password !== this.cpassword){
        this.showAlert("Error", "Password does not match.")
        return
      }
    }

    /* update profile */
    if(this.username !== this.firebaseUsername) {
			//await this.user.updateEmail(this.username) /* update account username(email) */
			this.mainuser.update({ /* update firebase variable */
				username: this.username
			})
    }

    if(this.password !== this.firebasePassword) {
      await this.user.updatePassword(this.password) /* update account password */
      this.mainuser.update({ /* update firebase variable */
				password: this.password
			})
    }

    if(this.commuteMethod !== this.firebaseCommuteMethod) {
      this.mainuser.update({ /* update firebase variable */
				commuteMethod: this.commuteMethod
			})
    }

    if(this.gender !== this.firebaseGender) {
      this.mainuser.update({ /* update firebase variable */
				gender: this.gender
			})
    }

    if(this.age !== this.firebaseAge) {
      this.mainuser.update({ /* update firebase variable */
				age: this.age
			})
    }

    if(this.email !== this.user.getEmail()) {
      this.mainuser.update({ /* update firebase variable */
				email: this.email
			})
    }

    this.showAlert("Success", "Update successfully.")
    this.router.navigate(['/tabs/profile'])
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alert.create({
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
