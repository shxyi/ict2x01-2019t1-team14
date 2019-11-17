import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore'
import { UserService } from '../user.service';
import { AlertController } from '@ionic/angular'; /* import pop up modal alert */

@Component({
  selector: 'app-sanyin-route',
  templateUrl: './sanyin-route.page.html',
  styleUrls: ['./sanyin-route.page.scss'],
})
export class SanyinRoutePage implements OnInit {
  currentLocation: string
  listOfStation = []
  mainuser: AngularFirestoreDocument
  conquerDuration = 9 /* hours */
  debugging = !true /* debugger */
  atStation = !false

  constructor(
    private afs: AngularFirestore,
    private user: UserService,
    public alert: AlertController,
  ) { }

  ngOnInit() {
  }

  async otherLocation() {
    this.currentLocation = document.querySelector('#currentLocation').innerHTML = "Other Location"
    this.atStation = !false
  }

  async yiochukang() {
    this.currentLocation = document.querySelector('#currentLocation').innerHTML = "Yio Chu Kang"
    this.atStation = !true
  }

  async angmokio() {
    this.currentLocation = document.querySelector('#currentLocation').innerHTML = "Ang Mo Kio"
    this.atStation = !true
  }

  async conquer() {
    /* check availability from firebase database */
    this.afs.firestore.collection('stations').get().then((snapshot) => { /* https://www.youtube.com/watch?v=kmTECF0JZyQ */
      snapshot.docs.forEach(doc => {
        if(doc.id === this.currentLocation) {
          if(doc.data().available === true) { /* conquer available */
            this.mainuser = this.afs.doc(`stations/${doc.id}`)
            this.conquerConfirm(doc)
          }
          else if(doc.data().available === false) { /* conquer not available */
            let conqueror = doc.data().conqueror
            let date = new Date()
            let conquerHour = this.getHourMin_strToNum(doc.data().conquerDateTime, 0)
            let conquerMin = this.getHourMin_strToNum(doc.data().conquerDateTime, 1)

            /* conqueror time left calculation */
            let carryFlag = false
            let min = date.getMinutes() - conquerMin
            if(min < 0) {
              min += 60
              carryFlag = true /* used up an hour */
            }
            min = 60 - min
            if(min == 60) {
              min = 0
            }
            
            let hour = date.getHours() - conquerHour
            if(hour < 0) {
              hour += 24 /* pass midnight, next day */
            }
            hour = this.conquerDuration - hour
            if(!carryFlag && date.getMinutes()>conquerMin)
              hour -= 1

            this.showAlert("Fail To Conquer",
            "\"" + conqueror + "\"" + " is currently conquering this station.<br><br>" +
            " Time left: " + hour + "h " + min + "min.")
          }
        }
      })
    })
  }

  getHourMin_strToNum(str: string, data: number): number { /* split string and return num cast hour*/
    let str1 = str.split('_') /* split date and time */
    let str2 = str1[1].split(':') /* split hour and minute */
    return parseInt(str2[data]) /* num cast */
  }

  async conquerConfirm(station: any) { /* conquer modal */
    const alert = await this.alert.create({ /* https://ionicframework.com/docs/v3/api/components/alert/AlertController/ */
      header: "Conquer",
      message: 
        "Do you wish to conquer this station?<br><br>" +
        "<li>Points Cost: " + station.data().pointsCost + "</li>" +
        "<li>Hourly Bonus Points: " + station.data().hourlyBonusPoints + "</li>",
      buttons: [
        {
          text: 'Conquer',
          handler: () => {
            let date = new Date()
            this.mainuser.update({ /* update firebase variable */
              conqueror: "chris", /* <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< */
              conquerDateTime: date.getFullYear() + "/" + (date.getMonth()+1) + "/" + date.getDate() +
                "_" + date.getHours() + ":" + date.getMinutes()
            })
            this.showAlert("Success", "Conquer successfully.")
          }
        },
        {
          text: "Cancel"
        }
      ]
    })
    await alert.present()
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
