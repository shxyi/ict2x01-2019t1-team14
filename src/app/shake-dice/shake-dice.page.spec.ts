import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShakeDicePage } from './shake-dice.page';

describe('ShakeDicePage', () => {
  let component: ShakeDicePage;
  let fixture: ComponentFixture<ShakeDicePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShakeDicePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShakeDicePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
