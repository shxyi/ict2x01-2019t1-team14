import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth'; /* import from app.module.ts */
import { AlertController } from '@ionic/angular'; /* import pop up modal alert */
import { Router } from '@angular/router' /* import page navigation */
import { AngularFirestore } from '@angular/fire/firestore' /* for firebase doc */
import { UserService } from '../user.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {

  /* variables */ 
  username: string
  password: string
  cpassword: string
  email: string
  gender: any
  age: number
  commuteMethod: any
  points: number = 0
  

  constructor(
    public afAuth: AngularFireAuth,
    public alert: AlertController,
    public router: Router,
    public afstore: AngularFirestore,
    public user: UserService,
  ) { }

  ngOnInit() {
  }

  async register(){
    const { username, password, cpassword, email, gender, age, commuteMethod, points } = this 

    /* validation */
    if(username=="" || password=="" || cpassword=="" || email=="" || gender==null || age==null || commuteMethod==null){
      this.showAlert("Error", "One or more fields are empty.")
      return
    }

    if(password !== cpassword){
      this.showAlert("Error", "Password does not match.")
      return
    }

    /* register */
    try {
       const result = await this.afAuth.auth.createUserWithEmailAndPassword(username+'@firebase.com', password)
       this.afstore.doc(`users/${result.user.uid}`).set({ /* create firebase doc */
         username,
         password,
         email,
         gender,
         age,
         commuteMethod,
         points,
        })
        this.user.setUser({
          uid: result.user.uid,
          username,
          password,
          email,
          gender,
          age,
          commuteMethod,
          points,
        })

        this.showAlert("Sucess", "Registered successfully.")
        this.router.navigate(['/login'])
    } catch(error) {
        this.showAlert("Error", error.message)
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
}
