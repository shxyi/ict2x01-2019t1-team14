import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore'
import { UserService } from '../user.service';
import { AlertController } from '@ionic/angular'; /* import pop up modal alert */
declare var google;

@Component({
  selector: 'app-direction',
  templateUrl: './direction.page.html',
  styleUrls: ['./direction.page.scss'],
})
export class DirectionPage implements OnInit, AfterViewInit {
  currentLocation: string
  mainstation: AngularFirestoreDocument
  mainuser: AngularFirestoreDocument
  usersub
  username: string
  stationConquered: string
  hourPassed: number
  userPoints: number
  conquerDuration = 9 /* hours */
  hide = false;
  toggleBtn = false;
  debugging = !false /* debugger */
  atStation = !false

  @ViewChild('mapElement', { static: true }) mapNativeElement;
  directionsService = new google.maps.DirectionsService;
  directionsDisplay = new google.maps.DirectionsRenderer;
  directionForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private afs: AngularFirestore,
    private user: UserService,
    public alert: AlertController,) {
      this.mainuser = afs.doc(`users/${user.getUID()}`)
      this.usersub = this.mainuser.valueChanges().subscribe(event => {
        this.userPoints = event.points
        this.username = event.username
        this.stationConquered = event.stationConquered
      })

      /* check if conqueror over the conquering duration */
      this.hourlyBonus() /* get remaining bonus first */
      this.afs.firestore.collection('stations').get().then((snapshot) => { /* https://www.youtube.com/watch?v=kmTECF0JZyQ */
        snapshot.docs.forEach(doc => {
          if(doc.data().available === false){ /* conquering */
            let date = new Date()
            let conquerHour = this.getHourMin_strToNum(doc.data().conquerDateTime, 0)
            let conquerMin = this.getHourMin_strToNum(doc.data().conquerDateTime, 1)

            let hour = date.getHours() - conquerHour
            if(hour < 0) {
              hour += 24 /* pass midnight, next day */
            }
            if(hour >= 9){
              let min = date.getMinutes() - conquerMin
              if(min < 0){
                hour -= 1
              }
              if(hour >= 9){
                /* remove user */
                this.mainuser.update({ /* update firebase variable */
                  stationConquered: ""
                })

                this.mainstation = this.afs.doc(`stations/${doc.id}`)
                this.mainstation.update({ /* update firebase variable */
                  available: true,
                  conquerDateTime: "",
                  conqueror: "",
                  hourPassed: 0
                })
                console.log("9 hours have passed. Removed user from station.")
              }
            }
          }
        })
      })

      this.createDirectionForm();
  }

  ngOnInit() {
  }

  createDirectionForm() {
    this.directionForm = this.fb.group({
      source: ['', Validators.required],
      destination: ['', Validators.required]
    });
  }

  ngAfterViewInit(): void {
    const map = new google.maps.Map(this.mapNativeElement.nativeElement, {
      zoom: 7,
      center: { lat: 1.290270, lng: 103.851959 }
    });
    this.directionsDisplay.setMap(map);
  }

  calculateAndDisplayRoute(formValues) {
    const mapOptions = new google.maps.Map(this.mapNativeElement.nativeElement, {
      zoom: 7,
      center: { lat: 1.290270, lng: 103.851959 }
    });

    const that = this;
    this.directionsService.route({
      origin: formValues.source,
      destination: formValues.destination,
      travelMode: 'WALKING',
      provideRouteAlternatives: true
    }, (response, status) => {
      if (status === 'OK') {
        for (var i = 0, len = response.routes.length; i < len; i++) {
          new google.maps.DirectionsRenderer({
            map: mapOptions,
            directions: response,
            routeIndex: i
          });
          console.log(i);
        }
      } else {
        window.alert('Directions request failed due to ' + status);
      }
    });
  }

  async directionButton(){
    if(!this.toggleBtn){
      this.hide = true;
      document.querySelector('#dirBtn').innerHTML = "New Direction";
      this.toggleBtn = true;
    }
    else{
      this.hide = false;
      document.querySelector('#dirBtn').innerHTML = "Get Direction";
      this.toggleBtn = false;
    }
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
            if(this.stationConquered != ""){
              this.showAlert("Fail To Conquer",
                "You can only conquer 1 station at a time.<br><br>" +
                "Station Conquered: " + this.stationConquered)
            }
            else {
              this.mainstation = this.afs.doc(`stations/${doc.id}`) /* get station doc */
              this.conquerConfirm(doc)
            }
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
            
            if(this.username == conqueror) {
              this.showAlert("Conquering",
                "You are currently conquering this station.<br><br>" +
                " Time left: " + hour + "h " + min + "min.")
            }
            else {
              this.showAlert("Fail To Conquer",
                "\"" + conqueror + "\"" + " is currently conquering this station.<br><br>" +
                " Time left: " + hour + "h " + min + "min.")
            }
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
            if(this.userPoints-station.data().pointsCost < 0){
              this.showAlert("Fail To Conquer", "Insufficient points.")
            }
            else{
              /* deduct user firebase variable */
              this.mainuser.update({ /* update firebase variable */
                points: this.userPoints - station.data().pointsCost,
                stationConquered: station.id
              })
              console.log("Deduct " + station.data().pointsCost + " points")

              let date = new Date()
              /* update station firebase variable */
              this.mainstation.update({ 
                conqueror: this.username,
                conquerDateTime: date.getFullYear() + "/" + (date.getMonth()+1) + "/" + date.getDate() +
                  "_" + date.getHours() + ":" + date.getMinutes(),
                available: false
              })
              this.showAlert("Success", "Conquer successfully.")
            }
          }
        },
        {
          text: "Cancel"
        }
      ]
    })
    await alert.present()
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
              points: this.userPoints + (hour * doc.data().hourlyBonusPoints)
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

  async showAlert(header: string, message: string) {
    const alert = await this.alert.create({
      header,
      message,
      buttons: ["Ok"]
    })
    await alert.present()
  }
}
