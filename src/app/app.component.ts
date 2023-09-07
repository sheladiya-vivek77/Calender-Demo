import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';

import { CalendarEvent, CalendarEventTimesChangedEvent, CalendarView } from 'angular-calendar';
import { Subject } from 'rxjs';
import { isSameDay } from 'date-fns';
import * as moment from 'moment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  viewDate: Date = new Date();
  view: CalendarView = CalendarView.Month;
  activeDayIsOpen: boolean = true;
  refresh: Subject<any> = new Subject();
  eventDate: Date = new Date();
  todayDate: Date = new Date();
  isSubmit: boolean = false;
  checkDateSameOrNot: boolean = false;
  selectedImage = null;
  localStorageData: Array<any> = [];
  events: CalendarEvent[] = [];
  modalForm: FormGroup;
  title: string = 'latest-calender';

  constructor(
    private fb: FormBuilder,
  ) {
    this.modalForm = this.fb.group({
      event_name: ['', [Validators.required]],
      event_desc: ['', [Validators.required]],
      event_image: [''],
    });
  }


  ngOnInit(): void {
    this.checkDateSame()
    let data = JSON.parse(localStorage.getItem('event-data'));
    if (data && data.length) {
      this.localStorageData = data;
      this.pushIntoEvents(data);
    }
  }

  eventTimesChanged({ event, newStart, newEnd }: CalendarEventTimesChangedEvent): void {
    event.start = newStart;
    event.end = newEnd;
    console.log(this.localStorageData);
    console.log(event);
    let findIndex = this.localStorageData.findIndex((res) => res.cssClass == event.cssClass);
    if (findIndex != -1) {
      this.localStorageData[findIndex].start = moment(newStart).toISOString();
      this.localStorageData[findIndex].end = moment(newEnd).toISOString();
      let allEvent = document.querySelectorAll(".new-div-class");
      for (let i = 0; i < allEvent.length; i++) {
        allEvent[i].innerHTML = '';
      }
      localStorage.setItem('event-data', JSON.stringify(this.localStorageData));
      this.pushIntoEvents(this.localStorageData);
    }
  }

  pushIntoEvents(data) {
    data.map((res) => {
      this.events.push({
        start: new Date(res.start),
        end: new Date(res.end),
        title: res.title,
        cssClass: res.cssClass,
        draggable: true,
      });
    });
    this.refresh.next('');

    setTimeout(() => {
      this.localStorageData.map((res) => {
        this.manageEventAdd(res.cssClass, res);
      });
    }, 100);
  }


  checkDateSame() {
    if (isSameDay(this.viewDate, this.todayDate)) {
      this.checkDateSameOrNot = true;
    } else {
      this.checkDateSameOrNot = false;
    }
  }

  onChangeFile(ev) {
    const file = ev.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target.result;
        this.selectedImage = imageUrl;
      };
      reader.readAsDataURL(file);
    }
  }

  letsShowEvent() {
    this.checkDateSame();
    let allEvent = document.querySelectorAll(".new-div-class");
    for (let i = 0; i < allEvent.length; i++) {
      allEvent[i].innerHTML = '';
    }
    setTimeout(() => {
      this.localStorageData.map((res) => {
        this.manageEventAdd(res.cssClass, res);
      });
    }, 100);
  }

  saveModelDetails() {
    this.isSubmit = true;
    if (this.modalForm.valid && this.selectedImage) {
      const randomNumber = Math.floor(Math.random() * (1000 - 10 + 1)) + 10;
      const className = 'latestCalender' + randomNumber;
      this.events.push({
        start: this.eventDate,
        end: this.eventDate,
        title: this.modalForm.value.event_name,
        cssClass: className,
        draggable: true,
      });
      this.refresh.next('');
      setTimeout(() => {
        this.addNewEvent(className, this.modalForm.value);
      }, 100);
    }
  }

  addNewEvent(className, data) {
    const params = {
      start: this.eventDate,
      end: this.eventDate,
      title: data.event_name,
      cssClass: className,
      image: this.selectedImage,
      name: data.event_name,
      description: data.event_desc
    };
    this.localStorageData.push(params);
    localStorage.setItem('event-data', JSON.stringify(this.localStorageData));
    this.manageEventAdd(className, params);
    this.selectedImage = null;
    this.modalForm.reset();
    this.isSubmit = false;
    document.getElementById('modal-close').click();
  }


  manageEventAdd(className, data) {
    let htmlCode = `
    <div class="cards">
      <div class="cards-headers">
        <div>
          <img src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava3.webp" alt="User Avatar"
            style="width: 25px;border-radius: 50%;height:25px;margin-right: 10px;">
        </div>
        <div>
          <h3>${data.name}</h3>
          <p>${data.description}</p>
        </div>
      </div>
      <div>
        <img src="${data.image}"
          alt="Post Image" class="avtar-icon">
        <div class="cards-footer">
          <img src="assets/heart.png" />
          <span>10 likes</span>
        </div>
      </div>
    </div>
    `;

    var calEvents = document.querySelectorAll('.cal-events');
    if (calEvents && calEvents.length && calEvents.length > 0) {
      for (let i = 0; i < calEvents.length; i++) {
        var testFirstElement = calEvents[i].querySelector('.' + className);
        if (testFirstElement) {
          const newDiv = document.createElement('div');
          newDiv.innerHTML = htmlCode;
          newDiv.classList.add('new-div-class');
          calEvents[i].appendChild(newDiv)
          // calEvents[i].innerHTML = htmlCode;
        }
      }
    }
  }

  dayClicked(ev) {
    this.eventDate = ev.date;
    let checkDateIsCurrentMonth = moment(this.eventDate).isSame(this.todayDate, 'month');
    if (checkDateIsCurrentMonth) {
      document.getElementById('demo-id').click();
    }
  }

}
