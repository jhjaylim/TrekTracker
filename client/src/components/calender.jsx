import React from 'react';
import BigCalendar from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css'
import EventForm from './eventForm.jsx'
import NewEventForm from './eventFormNoButton.jsx'
import RaisedButton from 'material-ui/RaisedButton';
import axios from 'axios';
import {isLoggedIn} from '../helpers/helpers.js';


var moment = require('moment');

BigCalendar.momentLocalizer(moment);
moment().format("YYYY-MM-DD HH:mm");



class Calendar extends React.Component {
  constructor(props) {
  	super(props);
  	this.state = {
  	  formStatus: false,
      isLoggedIn: false
  	}
    this.isLoggedIn = isLoggedIn.bind(this);
  	this.handleOpen = this.handleOpen.bind(this);
    this.RSVP = this.RSVP.bind(this);

    //Feel free to refactor if you can think of a better way to check when the page reloads
    if (this.state.trails) {
      this.isLoggedIn()
        .then((res) => {
          this.setState({
            isLoggedIn: res,
          });
        })
        .catch((err) => {
          console.log('error determining login status, ', err);
          this.setState({
            isLoggedIn: null,
          });
      });
    }
  }

  RSVP (event) {
    console.log(event)
    axios.post('/event/interested', {
      event: event
    })
    .then(function(response){
      console.log('RSVPd')
    })
    .catch(function(error){
      console.log('we dont want you to come')
    })
  }

  handleOpen () {
    this.setState({formStatus: !this.state.formStatus});
  }

  handleClose () {
    this.setState({formStatus: false});
  }


  render () {
    var trailIds = this.props.trails.map(function(trail){
      return trail.trailId;
    })
    var eventList = this.props.events.filter(function(event){
      if(trailIds.includes(event.trail_id)){
        return event;
      }
    })
    var startTime = new Date()
    startTime = startTime.setHours(4);
    var newEvent = this.state.formStatus === false ? null : <NewEventForm events={this.props.events} trails={this.props.trails}/>
    return (
      <div>
        <h3 className="callout">
          Click an event to see more info, or
          drag the mouse over the calendar to select a date/time range.
        </h3>
        {this.state.isLoggedIn ? <RaisedButton label="Plan a hike!" onClick={this.handleOpen} /> : <span></span>}
        {newEvent}
        <BigCalendar
          selectable
          events= {eventList}
          defaultView='week'
          min={new Date('2017, 1, 7, 05:00')}
          max={new Date('2017, 1, 7, 22:00')}
          scrollToTime={new Date(2010, 1, 1, 6)}
          defaultDate={new Date()}
          onSelectEvent={this.RSVP}// pull up info for event, sign up button included
          onSelectSlot={this.handleOpen}// open form to create new event
        />
      </div>
    )
  }
}


export default Calendar;
