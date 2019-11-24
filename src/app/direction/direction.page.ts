import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore'
import { UserService } from '../user.service';
import { AlertController } from '@ionic/angular'; /* import pop up modal alert */
import { Router } from '@angular/router';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { Subscription } from 'rxjs';
import { Storage } from '@ionic/storage';
import { NavController, Platform } from '@ionic/angular';
import { filter } from 'rxjs/operators';
import { LocationAccuracy } from '@ionic-native/location-accuracy/ngx';
import { Marker, MarkerOptions, LatLng } from '@ionic-native/google-maps';
import { Geofence } from '@ionic-native/geofence/ngx';

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

    map;
    currentMapTrack = null;
    markers = [];
    polylines = [];
    shadows = [];
    data = [];
    marker;
    drawMang;
    savedCircle;
    distance = 0;

    buttonDisabled = false;

  @ViewChild('mapElement', { static: true }) mapNativeElement;
  directionsService = new google.maps.DirectionsService;
  directionsDisplay = new google.maps.DirectionsRenderer;
  directionForm: FormGroup;
  userLocation: any = {
        lat: "",
        lng: "",
    }
  start: any = {
        lat: "",
        lng: "",
    }

    isTracking = false;
    trackedRoute = [];
    previousTracks = [];

    positionSubscription: Subscription;

  constructor(
    private fb: FormBuilder,
    private afs: AngularFirestore,
    private user: UserService,
    public alert: AlertController,
    public router: Router,
    private plt: Platform,
    private geolocation: Geolocation,
    private storage: Storage,
    //private geofence: Geofence,
    public navCtrl: NavController,) {
      this.mainuser = afs.doc(`users/${user.getUID()}`)
      this.usersub = this.mainuser.valueChanges().subscribe(event => {
        this.userPoints = event.points
        this.username = event.username
        this.stationConquered = event.stationConquered
      })

      /*geofence.initialize().then(
          () => console.log('Geofence Plugin Ready'),
          (err) => console.log(err)
      )
      this.addGeofence();*/

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


    ionViewDidLoad() {
        this.plt.ready().then(() => {
            this.loadHistoricRoutes();

            let mapOptions = {
                zoom: 8,
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: false
            };

            this.map = new google.maps.Map(this.mapNativeElement.nativeElement, mapOptions);

            this.geolocation.getCurrentPosition().then((pos) => {
                let latLng = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
                this.map.setCentre(latLng);
                this.map.setZoom(15);
            });
        });
    }

    loadHistoricRoutes() {
        this.storage.get('routes').then(data => {
            if (data) {
                this.previousTracks = data;
            }
        });
    }

  ngOnInit() {
  }

  async errorAlert() {
   const alert = await this.alert.create({
       header: "Error!",
       message: "Directions request failed.",
       buttons: ['OK']
     });

     await alert.present();
   }

  createDirectionForm() {
    this.directionForm = this.fb.group({
      //source: ['', Validators.required],
      destination: ['', Validators.required]
    });
  }

  ngAfterViewInit(): void {
    /*const map = new google.maps.Map(this.mapNativeElement.nativeElement, {
      zoom: 7,
      center: { lat: 1.290270, lng: 103.851959 }
    });
    this.directionsDisplay.setMap(map);*/
      this.geolocation.getCurrentPosition().then((resp) => {
          this.userLocation.lat = resp.coords.latitude;
          this.userLocation.lng = resp.coords.longitude;

          this.map = new google.maps.Map(this.mapNativeElement.nativeElement, {
              zoom: 15,
              center: { lat: resp.coords.latitude, lng: resp.coords.longitude }
          });

          this.marker = new google.maps.Marker({
              map: this.map,
              animation: google.maps.Animation.DROP,
              position: { lat: resp.coords.latitude, lng: resp.coords.longitude }
          });
          this.markers.push(this.marker);


      });
  }

  calculateAndDisplayRoute(formValues) {
      this.geolocation.getCurrentPosition().then((resp) => {                  //get user current location
          this.start.lat = resp.coords.latitude;
          this.start.lng = resp.coords.longitude;
          //this.addGeofence(resp.coords.latitude, resp.coords.longitude);
      });

      this.map = new google.maps.Map(this.mapNativeElement.nativeElement, {
          zoom: 11.5,
          center: this.currentLocation//{ lat: 1.3227352, lng: 103.8143577 }
      });

    const that = this;
    this.directionsService.route({
      origin: this.start,
      destination: formValues.destination,
      travelMode: 'WALKING',
      provideRouteAlternatives: true
    }, (response, status) => {
      if (status === 'OK') {
        for (var i = 0, len = response.routes.length; i < len; i++) {
          new google.maps.DirectionsRenderer({
            map: this.map,
            directions: response,
            routeIndex: i
          });
          console.log(i);
        }
      } else {
        this.errorAlert();
        this.buttonDisabled = !this.buttonDisabled;
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

  async showFeedbackAlert() {
    const alert = await this.alert.create({ /* https://ionicframework.com/docs/v3/api/components/alert/AlertController/ */
      header: "Feedback",
      message:
        "Do you wish to provide a feedback for this route?<br><br>" +
        "Additional points will be awarded.",
      buttons: [
        {
          text: 'Feedback',
          handler: () => {
            this.router.navigate(['/feedback'], { // https://stackoverflow.com/questions/52187282/ionic-4-how-to-pass-data-between-pages-using-navctrl-or-router-service
              queryParams: { // pass object to another page
                routePts: this.distance // data
              }
            });
          }
        },
        {
          text: "Cancel"
        }
      ]
    })
    await alert.present()
    }

    ////////////////////Geolocation/////////////////////////////////////////////////////////////////
    startTracking() {
        this.isTracking = true;
        this.trackedRoute = [];

        this.positionSubscription = this.geolocation.watchPosition()                //keep tracking user location
            .pipe(
                filter((p) => p.coords !== undefined) //Filter Out Errors
            )
            .subscribe(data => {
                setTimeout(() => {
                    this.trackedRoute.push({ lat: data.coords.latitude, lng: data.coords.longitude });
                    this.redrawPath(this.trackedRoute);

                    if (this.marker && this.marker.setMap) {      //remove previous marker
                        this.marker.setMap(null);
                    }

                    this.marker = new google.maps.Marker({       //display updated user location
                        map: this.map,
                        position: { lat: data.coords.latitude, lng: data.coords.longitude }
                    });
                    this.markers.push(this.marker);
                    this.distance = this.calculateDistance(this.start.lat, this.start.lng, data.coords.latitude, data.coords.longitude)
                });
            });

    }

    redrawPath(path) {
        if (this.currentMapTrack) {
            this.currentMapTrack.setMap(null);
        }

        if (path.length > 1) {
            this.currentMapTrack = new google.maps.Polyline({
                path: path,
                geodesic: true,
                strokeColor: '#ff00ff',
                strokeOpacity: 1.0,
                strokeWeight: 3
            });
            this.currentMapTrack.setMap(this.map);
        }
    }

    stopTracking() {
        let newRoute = { finished: new Date().getTime(), path: this.trackedRoute };
        this.previousTracks.push(newRoute);
        this.storage.set('routes', this.previousTracks);

        this.isTracking = false;
        this.positionSubscription.unsubscribe();
        this.currentMapTrack.setMap(null);

        // feed back alert
        this.showFeedbackAlert()
    }

    showHistoryRoute(route) {
        this.redrawPath(route);
    }
    ///////distance calculate////////////////////////////////
    toRad(degrees) {
        return degrees * Math.PI / 180;
    }

    calculateDistance(lat1, lon1, lat2, lon2) {
        var R = 6371; // km
        var dLat = this.toRad((lat2 - lat1));
        var dLon = this.toRad((lon2 - lon1));
        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c;
        return d;
    }
    ////////geofence//////////////////////////////////////////
    /*private addGeofence() {
        //options describing geofence
        let fence = {
            id: '69ca1b88-6fbe-4e80-a4d4-ff4d3748acdb', //any unique ID
            latitude: 1.359754,1.3555354,//1.381473, //center of geofence radius
            longitude: 103.7512594,103.7402279,//103.8449685,
            radius: 50, //radius to edge of geofence in meters
            transitionType: 1, //trigger when enter
            notification: { //notification settings
                id: 1, //any unique ID
                title: 'Yio Chu Kang MRT', //notification title
                text: 'Conquer Yio Chu Kang MRT.', //notification body
                openAppOnClick: true //open app when notification is tapped
            },
        }

        this.geofence.addOrUpdate(fence).then(
            () => this.showAlert('Geofence added', 'yeah'),
            (err) => console.log('Geofence failed to add')
        );
    }*/
}
