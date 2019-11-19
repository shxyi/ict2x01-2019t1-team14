import { AfterContentInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationStart } from '@angular/router';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { Subscription  } from 'rxjs/Subscription';
import { Storage } from '@ionic/storage';
import { NavController, Platform } from '@ionic/angular';
import { filter } from 'rxjs/operators';
import { LocationAccuracy } from '@ionic-native/location-accuracy/ngx';
import { Marker, MarkerOptions, LatLng } from '@ionic-native/google-maps';

declare var google;

@Component({
    selector: 'app-home',
    templateUrl: 'home.page.html',
    styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit, AfterContentInit {
    map;
    currentMapTrack = null;
    @ViewChild('mapElement', { static: true }) mapElement;
    directionsService = new google.maps.DirectionsService;  //calculate direction between two locations
    directionsDisplay = new google.maps.DirectionsRenderer; //display direction in map
    directionForm: FormGroup;   //get input value from user
    currentLocation: any = {
        lat: "",
        lng: "",
        accuracy: ""

    }

    createMarker(loc: LatLng, title: string) {
        let markerOptions: MarkerOptions = {
            position: loc,
            title: title
        };
        return this.map.addMarker(markerOptions);
    }

    isTracking = false;
    trackedRoute = [];
    previousTracks = [];

    positionSubscription: Subscription;

    constructor(public navCtrl: NavController, private plt: Platform, private fb: FormBuilder, private geolocation: Geolocation, private storage: Storage, private locationAccuracy: LocationAccuracy) {
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

            this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

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

    ngOnInit(): void {
    }

    createDirectionForm() {
        this.directionForm = this.fb.group({
            //source: ['', Validators.required],
            destination: ['', Validators.required],
            travelMode: ['', Validators.required]
        });
    }

    ngAfterContentInit(): void {

        this.geolocation.getCurrentPosition().then((resp) => {
            this.currentLocation.lat = resp.coords.latitude;
            this.currentLocation.lng = resp.coords.longitude;
            this.currentLocation.accuracy = resp.coords.accuracy;

            this.map = new google.maps.Map(this.mapElement.nativeElement, {
                zoom: 15,
                center: { lat: resp.coords.latitude, lng: resp.coords.longitude }
            });

            this.createMarker(this.currentLocation, "Me").then((marker: Marker) => {
                marker.showInfoWindow();
            });
        });

        //const mapOptions = new google.maps.Map(this.mapElement.nativeElement, {
         //   zoom: 15,
        //    center: this.currentLocation
        //});

       // this.directionsDisplay.setMap(this.map);     

    }

    generateRoutes(formValues) {
        this.geolocation.getCurrentPosition().then((resp) => {
            this.currentLocation.lat = resp.coords.latitude;
            this.currentLocation.lng = resp.coords.longitude;
        });
   
        this.map = new google.maps.Map(this.mapElement.nativeElement, {
            zoom: 11.5,
            center: this.currentLocation//{ lat: 1.3227352, lng: 103.8143577 }
        });

      
        const that = this;
        this.directionsService.route({
            origin: this.currentLocation,                                          //start location
            destination: formValues.destination,                                //destination
            travelMode: formValues.travelMode,                                  //commute method
            provideRouteAlternatives: true
        }, (response, status) => {
            if (status === 'OK') {                   
                for (var i = 0, len = response.routes.length; i < len; i++) {                  
                    new google.maps.DirectionsRenderer({                        //display routes
                        map: this.map,
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

    startTracking() {
        this.isTracking = true;
        this.trackedRoute = [];

        this.positionSubscription = this.geolocation.watchPosition()
            .pipe(
                filter((p) => p.coords !== undefined) //Filter Out Errors
            )
            .subscribe(data => {
                setTimeout(() => {
                    this.trackedRoute.push({ lat: data.coords.latitude, lng: data.coords.longitude });
                    this.redrawPath(this.trackedRoute);
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
    }

    showHistoryRoute(route) {
        this.redrawPath(route);
    }
}