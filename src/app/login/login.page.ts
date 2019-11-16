import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth'; /* import from app.module.ts */
import { AlertController } from '@ionic/angular'; /* import pop up modal alert */
import { Router } from '@angular/router' /* import page navigation */
import { UserService } from '../user.service';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore'

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  /* variables */ 
  username: string
  password: string
  email: string
  gender: any
  age: number
  commuteMethod: any
  points: number
  mainuser: AngularFirestoreDocument
  sub

  constructor(
    public afAuth: AngularFireAuth,
    public alert: AlertController,
    public router: Router,
    public user: UserService,
    private afs: AngularFirestore,
  ) {
    let date = new Date()
    console.log("Current Date ",date) 
  }

  ngOnInit() {
  }

  async login(){
    const { username, password, email, gender, age, commuteMethod, points } = this 

    /* validation */
    if(username=="" || password==""){
      this.showAlert("Error", "One or more fields are empty.")
      return
    }

    /* login */
    try{
      const result = await this.afAuth.auth.signInWithEmailAndPassword(username+'@firebase.com', password)
      if(result.user){
        this.user.setUser({
          uid: result.user.uid,
          username,
          password,
          email,
          gender,
          age,
          commuteMethod,
          points
        })

        /* clear field */
        this.username = ""
        this.password = ""

        console.log("Login successfully.")
        this.router.navigate(['/tabs'])
      }
    } catch(error){
      /*console.dir(error)*/ /* specific error code */
      if(error.code === "auth/user-not-found"){
        this.showAlert("Error", "User not found.")
      }
      else if(error.code === "auth/wrong-password"){
        this.showAlert("Error", "The password is incorrect.")
      }
      else{
        this.showAlert("Error", error.message)
      }
    }
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alert.create({
      header,
      message,
      buttons: ["Ok"]
    })
    await alert.present()
  }

  async registerPage() {
    this.router.navigate(['/register'])
  }
}
