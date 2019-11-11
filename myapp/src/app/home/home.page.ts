import { AfterContentInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
declare var google;

@Component({
    selector: 'app-home',
    templateUrl: 'home.page.html',
    styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit, AfterContentInit {
    map;
    @ViewChild('mapElement', { static: true }) mapElement;
    directionsService = new google.maps.DirectionsService;
    directionsDisplay = new google.maps.DirectionsRenderer;
    directionForm: FormGroup;
    constructor(private fb: FormBuilder) {
        this.createDirectionForm();
    }

    ngOnInit(): void {
    }

    createDirectionForm() {
        this.directionForm = this.fb.group({
            source: ['', Validators.required],
            destination: ['', Validators.required],
            travelMode: ['', Validators.required]
        });
    }

    ngAfterContentInit(): void {
        this.map = new google.maps.Map(
            this.mapElement.nativeElement, {
                center: { lat: 1.3139375, lng: 103.2851307 },
                zoom: 8
            });
    }

    generateRoutes(formValues) {
        const mapOptions = new google.maps.Map(this.mapElement.nativeElement, {
            zoom: 8,
            center: { lat: 1.3139375, lng: 103.2851307 }
        });
        const that = this;
        this.directionsService.route({
            origin: formValues.source,
            destination: formValues.destination,
            travelMode: formValues.travelMode, 
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