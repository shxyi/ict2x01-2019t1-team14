import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore'
import { UserService } from '../user.service';

@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.page.html',
  styleUrls: ['./leaderboard.page.scss'],
})
export class LeaderboardPage implements OnInit {
  mainuser: AngularFirestoreDocument
  mainstation: AngularFirestoreDocument
  usersub
  stationsub
  points: number
  gender: string
  avatar: string
  hourPassed: number
  listOfUsers = []
  topRanking = 15
  stationConquered: string
  debugging = !false /* debugger */

  constructor(
    private afs: AngularFirestore,
    private user: UserService,
  ) {
    this.mainuser = afs.doc(`users/${user.getUID()}`)
    this.usersub = this.mainuser.valueChanges().subscribe(event => {
      this.points = event.points
      this.gender = event.gender
      this.stationConquered = event.stationConquered
      if(this.gender === "Female") {
        this.avatar = "../assets/icon/female.png"
      }
      else {
        this.avatar = "../assets/icon/male.png"
      }
      if(this.stationConquered == ""){
        this.stationConquered = "None"
      }
    })
    this.leaderboard()
  }

  ngOnInit() { }

  async leaderboard() {
    /* store users into an array from the firebase */
    this.afs.firestore.collection('users').get().then((snapshot) => { /* https://www.youtube.com/watch?v=kmTECF0JZyQ */
      snapshot.docs.forEach(doc => {
        this.listOfUsers.push(doc.data())
      })

      /* bubble sort */
      let temp = []
      for(let i=this.listOfUsers.length-1; i>0; i--){
        for(let j=0; j<i; j++){
          if(this.listOfUsers[j].points < this.listOfUsers[j+1].points){
            temp = this.listOfUsers[j]
            this.listOfUsers[j] = this.listOfUsers[j+1]
            this.listOfUsers[j+1] = temp
          }
        }
      }

      let limit = this.topRanking
      if(this.listOfUsers.length < this.topRanking) {
        limit = this.listOfUsers.length
      }
      /* display username */
      for(let i=0; i<limit; i++){
        let row = document.createElement('ion-row');
        row.setAttribute("id", "row"+i)
        /* css */
        row.style.borderStyle = "outset"
        row.style.borderRadius = "20px"
        if(i == 0) {
          row.style.backgroundColor = "gold"
          row.style.borderColor = "orange"
        }
        else if(i == 1) {
          row.style.backgroundColor = "silver"
          row.style.borderColor = "darkgrey"
        }
        else if(i == 2) {
          row.style.backgroundColor = "#CD7F32"
          row.style.borderColor = "#A46628"
        }
        row.style.marginBottom = "3px"
        let rankCol = document.createElement('ion-col');
        rankCol.className = "ion-float-left"
        rankCol.style.textAlign = "center"
        rankCol.textContent = (i+1).toString()
        let nameCol = document.createElement('ion-col');
        nameCol.style.textAlign = "center"
        nameCol.textContent = this.listOfUsers[i].username
        /* append */
        row.appendChild(rankCol)
        row.appendChild(nameCol)
        document.querySelector('#grid').appendChild(row);
      }

      /* display points */
      for(let i=0; i<limit; i++){
        let col = document.createElement('ion-col');
        col.className = "ion-float-right"
        col.style.textAlign = "center"
        col.textContent = this.listOfUsers[i].points
        /* append */
        document.querySelector('#row'+i).appendChild(col);
      }
    })
  }

  async refresh() {
    document.querySelector('#grid').innerHTML = '' /* remove all child */
    this.listOfUsers = [] /* reset data */
    this.leaderboard() /* update leaderboard */
    this.hourlyBonus() /* update conquer hourly bonus (if any) */
  }

  async hourlyBonus() {
    if(this.stationConquered != ""){
      /* get station from firebase database */
      this.afs.firestore.collection('stations').get().then((snapshot) => { /* https://www.youtube.com/watch?v=kmTECF0JZyQ */
        snapshot.docs.forEach(doc => {
          if(doc.id === this.stationConquered) {
            let conquerHour = this.getHourMin_strToNum(doc.data().conquerDateTime, 0)
            let conquerMin = this.getHourMin_strToNum(doc.data().conquerDateTime, 1)

            let date = new Date()
            let hour = date.getHours() - conquerHour
            if(hour < 0) {
              hour += 24 /* pass midnight, next day */
            }
            let min = date.getMinutes() - conquerMin
            if(min < 0){
              hour -= 1
            }

            if(hour > 9){
              hour = 9
            }
            hour -= doc.data().hourPassed
            this.mainuser.update({ /* update firebase variable */
              points: this.points + (hour * doc.data().hourlyBonusPoints)
            })
            console.log("Added " + hour + " hours of conquering bonus")
            this.mainstation = this.afs.doc(`stations/${doc.id}`)
            this.hourPassed = doc.data().hourPassed
            this.mainstation.update({ /* update firebase variable */
              hourPassed: this.hourPassed + hour
            })
          }
        })
      })
    }
  }

  getHourMin_strToNum(str: string, data: number): number { /* split string and return num cast hour*/
    let str1 = str.split('_') /* split date and time */
    let str2 = str1[1].split(':') /* split hour and minute */
    return parseInt(str2[data]) /* num cast */
  }

  async addPoints(){
    this.points += 500
    this.mainuser.update({ /* update firebase variable */
      points: this.points
    })
  }

  async deductPoints(){
    this.points -= 500
    this.mainuser.update({ /* update firebase variable */
      points: this.points
    })
  }
}
