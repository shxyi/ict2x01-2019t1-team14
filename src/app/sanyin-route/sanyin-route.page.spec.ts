import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SanyinRoutePage } from './sanyin-route.page';

describe('SanyinRoutePage', () => {
  let component: SanyinRoutePage;
  let fixture: ComponentFixture<SanyinRoutePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SanyinRoutePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SanyinRoutePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
