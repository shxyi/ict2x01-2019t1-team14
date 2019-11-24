import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router' /* import page navigation */
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore'
import { UserService } from '../user.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-shake-dice',
  templateUrl: './shake-dice.page.html',
  styleUrls: ['./shake-dice.page.scss'],
})
export class ShakeDicePage implements OnInit {
  mainuser: AngularFirestoreDocument
  sub
  points: number
  hide = true;
  multiplier: number
  feedbackPts: number /* from yudi route points */
  totalPts: number

  constructor(
    public router: Router,
    private afs: AngularFirestore,
    private user: UserService,
    public activatedRoute : ActivatedRoute,
  ) {
    this.mainuser = afs.doc(`users/${user.getUID()}`)
		this.sub = this.mainuser.valueChanges().subscribe(event => {
      this.points = event.points
    })

    this.activatedRoute.queryParams.subscribe((res)=>{
      this.feedbackPts = res['routePts']
    });
    /* navigation code from previous page to pass data(object) to this page
    this.router.navigate(['/shake-dice'], { // https://stackoverflow.com/questions/52187282/ionic-4-how-to-pass-data-between-pages-using-navctrl-or-router-service
      queryParams: { // pass object to another page
        routePts: 540 // data
      }
    });
    */
  }

  ngOnInit() {
  }

  async diceRoll(){
    let div = document.querySelector('#dice-container')
    div.innerHTML = '' /* remove child */
    let gif = document.createElement('ion-img');
    gif.src = "../assets/icon/diceroll.gif";
    div.appendChild(gif);
    
    setTimeout(()=>{
      div.innerHTML = '' /* remove child */
      let img = document.createElement('ion-img');
      let rng = Math.floor(Math.random() * 6) + 1; /* random number generator */
      switch(rng){
        case 1: img.src = "../assets/icon/1.png"; break;
        case 2: img.src = "../assets/icon/2.png"; break;
        case 3: img.src = "../assets/icon/3.png"; break;
        case 4: img.src = "../assets/icon/4.png"; break;
        case 5: img.src = "../assets/icon/5.png"; break;
        case 6: img.src = "../assets/icon/6.png"; break;
      }
      div.appendChild(img);

      this.hide = false
      this.multiplier = rng
      this.totalPts = this.feedbackPts * this.multiplier
      this.mainuser.update({ /* update firebase variable */
				points: this.points + this.totalPts
			})

    }, 1300) /* delay 1.3 seconds for gif to end */
  }

  async home() {
    this.router.navigate(['tabs/direction'])
  }
}
