import React from 'react';
import axios from 'axios';
import Posts from '../components/Posts.jsx';
import UserEventList from '../components/UserEventList.jsx';
import 'react-image-gallery/styles/css/image-gallery.css';
import ImageGallery from 'react-image-gallery';
import { galleryConversion } from '../helpers/helpers.js';
import dummyPosts from '../components/dummyPosts.jsx';

class User extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      userEmail: null,
      posts: [],
      events: [1]
    };

    if (props.currentUser) {
      this.getCurrentUser()
      .then(() => {
        this.getPosts();
      });
    } else {
      let locationSplit = window.location.href.split('/');
      let email = locationSplit[locationSplit.length - 1];
      this.state.userEmail = email;
      this.getPosts();
    }
    this.getEventsByUser = this.getEventsByUser.bind(this);

  }

  getCurrentUser () {
    return axios.get('/api/currentuser')
    .then((response) => {
      this.setState({userEmail: response.data.email});
    });
  }

  getPosts () {
    return axios.get('/api/posts/users/' + this.state.userEmail)
    .then((response) => {
//      this.setState({posts: response.data});
      var galleryposts = galleryConversion(dummyPosts);
      this.setState({
        posts: dummyPosts,
        galleryposts: galleryposts
      });
    });
  }

  getEventsByUser () {
    console.log('clicked Get events');

    this.getCurrentUser()
    .then((response) => {
      return axios.get('/event/user', {params: {email: this.state.userEmail}})
      .then((data)=>{
        this.setState({events: data.data});
        console.log('state----',this.state.events);
      });

    });


  }

  handleImageLoad(event) {
    console.log('Image loaded ', event.target)
  }

//        <Posts posts={this.state.posts} />

  componentDidMount() {
    this.getEventsByUser();
  }


/*
  createdAt:"2017-08-26T17:27:12.000Z"
  creator_user_id:"115245116847689960870"
  date:"2017-08-26T17:27:06.137Z"
  desc:"gfdsgsdfgfdsg"
  end:"2017-08-26T17:27:09.999Z"
  id:1
  start:"2017-08-26T17:27:08.318Z"
  title:"asdads"
  trail_id:339
  trailname:null
  updatedAt:"2017-08-26T17:27:12.000Z"

*/
  render() {
    return (
      <div>
        <UserEventList events={this.state.events} />
        <ImageGallery className='imagegallery'
          items={this.state.galleryposts}
          slideInterval={2000}
          onImageLoad={this.handleImageLoad}
          thumbnailPosition={'top'}
        />

      </div>
    );
  }
}

export default User;