import { AfterContentInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationStart } from '@angular/router';
import { Geolocation } from '@ionic-native/geolocation/ngx';
//import { Storage } from '@ionic/storage';
declare var google;

@Component({
    selector: 'app-home',
    templateUrl: 'home.page.html',
    styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit, AfterContentInit {
    map;
    @ViewChild('mapElement', { static: true }) mapElement;
    directionsService = new google.maps.DirectionsService;  //calculate direction between two locations
    directionsDisplay = new google.maps.DirectionsRenderer; //display direction in map
    directionForm: FormGroup;   //get input value from user
    currentLocation: any = {
        lat: 0,
        lng: 0
    }

    isTracking = false;
    trackingRoute = [];
    previousRoutes = [];

    constructor(private fb: FormBuilder, private geolocation: Geolocation) {
        this.createDirectionForm();
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
        });
        const mapOptions = new google.maps.Map(this.mapElement.nativeElement, {
            zoom: 8,
            center: { lat: 1.3139375, lng: 103.2851307 }
        });
        this.directionsDisplay.setMap(this.map);
    }

    generateRoutes(formValues) {
        const mapOptions = new google.maps.Map(this.mapElement.nativeElement, {
            zoom: 8,
            center: { lat: 1.3139375, lng: 103.2851307 }
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
}