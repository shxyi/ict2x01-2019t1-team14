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

  constructor(
    private afs: AngularFirestore,
    private user: UserService,
  ) {
    this.mainuser = afs.doc(`users/${user.getUID()}`)
		this.sub = this.mainuser.valueChanges().subscribe(event => {
      this.points = event.points
    })
  }

  ngOnInit() {
  }
  
  async addPoints(){
    this.points += 500
    this.mainuser.update({ /* update firebase variable */
      points: this.points
    })
  }

  async deductPoints(){
    this.points -= 50
    this.mainuser.update({ /* update firebase variable */
      points: this.points
    })
  }
}
