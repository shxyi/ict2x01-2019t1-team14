import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore'
import { UserService } from '../user.service';
import { Router } from '@angular/router' /* import page navigation */
import { AlertController } from '@ionic/angular'; /* import pop up modal alert */

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.page.html',
  styleUrls: ['./edit-profile.page.scss'],
})
export class EditProfilePage implements OnInit {
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
    public alert: AlertController,
  ) {
    this.mainuser = afs.doc(`users/${user.getUID()}`)
		this.sub = this.mainuser.valueChanges().subscribe(event => {
      this.username = this.firebaseUsername = event.username
      this.password = this.firebasePassword = event.password
      this.commuteMethod = this.firebaseCommuteMethod = event.commuteM
      this.gender = this.firebaseGender = event.gender
      this.age = this.firebaseAge = event.age
      this.email = this.firebaseEmail = event.email
    })
  }

  ngOnInit() {
  }

  async updateProfile() {
    /* validation */
    if(this.username=="" || this.password=="" || this.commuteMethod==null || this.gender==null || this.age==null || this.email==""){
      this.showAlert("Error", "One or more fields are empty.")
      return
    }
    else if(this.username==this.firebaseUsername && this.password==this.firebasePassword && this.commuteMethod==this.firebaseCommuteMethod &&
      this.gender==this.firebaseGender && this.age==this.firebaseAge && this.email==this.firebaseEmail){
      this.showAlert("System Message", "You have change nothing.")
      this.router.navigate(['/tabs/profile'])
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
    
    if(this.email !== this.firebaseEmail) {
      if(this.email.includes('@')) {
        await this.user.updateEmail(this.email) /* update account username(email) */
        this.mainuser.update({ /* update firebase variable */
          email: this.email
        })
      }
      else {
        this.showAlert("Error", "Email is in the wrong format.")
        return
      }
    }

    this.showAlert("Success", "Update successfully.")
    this.router.navigate(['/tabs/direction'])
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
