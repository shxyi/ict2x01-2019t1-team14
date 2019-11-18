import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
declare var google;
@Component({
  selector: 'app-direction',
  templateUrl: './direction.page.html',
  styleUrls: ['./direction.page.scss'],
})
export class DirectionPage implements OnInit, AfterViewInit {
  @ViewChild('mapElement', {static: true}) mapNativeElement;
  directionsService = new google.maps.DirectionsService;
  directionsDisplay = new google.maps.DirectionsRenderer;
  directionForm: FormGroup;
  constructor(private fb: FormBuilder) {
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
      center: {lat: 1.290270, lng: 103.851959}
    });
    this.directionsDisplay.setMap(map);
  }

  calculateAndDisplayRoute(formValues) {
       const mapOptions = new google.maps.Map(this.mapNativeElement.nativeElement, {
         zoom: 7,
         center: {lat: 1.290270, lng: 103.851959}
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
}
