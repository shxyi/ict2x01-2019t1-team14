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
  sub
  points: number
  listOfUsers = []
  topRanking = 15
  debugging = !false /* debugger */

  constructor(
    private afs: AngularFirestore,
    private user: UserService,
  ) {
    /* debugger */
    if (!this.debugging) {
      this.mainuser = afs.doc(`users/${user.getUID()}`)
      this.sub = this.mainuser.valueChanges().subscribe(event => {
        this.points = event.points
      })
    }
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
        let col = document.createElement('ion-col');
        col.className = "ion-float-left"
        col.textContent = this.listOfUsers[i].username
        /* append */
        row.appendChild(col)
        document.querySelector('#grid').appendChild(row);
      } 

      /* display points */
      for(let i=0; i<limit; i++){
        let col = document.createElement('ion-col');
        col.className = "ion-float-right"
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
