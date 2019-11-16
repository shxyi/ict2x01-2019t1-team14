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

  constructor(
    private afs: AngularFirestore,
    private user: UserService,
    public router: Router,
    public alert: AlertController,
  ) {
    this.mainuser = afs.doc(`users/${user.getUID()}`)
		this.sub = this.mainuser.valueChanges().subscribe(event => {
      this.username = event.username
      this.password = event.password
      this.commuteMethod = event.commuteMethod
      this.gender = event.gender
      this.age = event.age
      this.email = event.email
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

    if(this.cpassword !== ""){
      if(this.password !== this.cpassword){
        this.showAlert("Error", "Password does not match.")
        return
      }
    }

    /* update profile */
    if(this.username !== this.user.getUsername()) {
			await this.user.updateEmail(this.username) /* update account username(email) */
			this.mainuser.update({ /* update firebase variable */
				username: this.username
			})
    }

    if(this.password !== this.user.getPassword()) {
      await this.user.updatePassword(this.password) /* update account password */
      this.mainuser.update({ /* update firebase variable */
				password: this.password
			})
    }

    if(this.commuteMethod !== this.user.getCommuteMethod()) {
      this.mainuser.update({ /* update firebase variable */
				commuteMethod: this.commuteMethod
			})
    }

    if(this.gender !== this.user.getGender()) {
      this.mainuser.update({ /* update firebase variable */
				gender: this.gender
			})
    }

    if(this.age !== this.user.getAge()) {
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
