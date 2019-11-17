import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore'
import { UserService } from '../user.service';
import { Router } from '@angular/router' /* import page navigation */
import { AngularFireAuth } from '@angular/fire/auth'; /* import from app.module.ts */
import * as firebase from "firebase"

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  mainuser: AngularFirestoreDocument
  sub
  username: string
  commuteMethod: any
  gender: any
  age: number
  email: string
  avatar: string

  constructor(
    private afs: AngularFirestore,
    private user: UserService,
    public router: Router,
    public afAuth: AngularFireAuth,
  ) {
    this.mainuser = afs.doc(`users/${user.getUID()}`)
		this.sub = this.mainuser.valueChanges().subscribe(event => {
      this.username = event.username
      this.commuteMethod = event.commuteMethod
      this.gender = event.gender
      this.age = event.age
      this.email = event.email

      if(this.gender === "Female") {
        this.avatar = "../assets/icon/female.png"
      }
      else {
        this.avatar = "../assets/icon/male.png"
      }
    })
  }

  ngOnInit() {
  }

  async editProfile(){
    this.router.navigate(['/edit-profile'])
  }

  async logOut() {
    console.log("Logged out")
    this.afAuth.auth.signOut();
    this.router.navigate(['/login'])
  }
}
