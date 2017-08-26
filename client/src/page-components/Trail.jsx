import React from 'react';
import axios from 'axios';
import Posts from '../components/Posts.jsx';
import Upload from '../components/Upload.jsx';
import Weather from '../components/Weather.jsx';
import 'react-image-gallery/styles/css/image-gallery.css';
import ImageGallery from 'react-image-gallery';
import { galleryConversion } from '../helpers/helpers.js';

class Trail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      trailId: window.location.href.split('id=')[1],
      posts: [],
      galleryposts: [],
      currentUser: null,
      trailInfo: {}
    };
    
    //retrieve trail's posts from server/database
    axios.get('/api/posts/trails/' + this.state.trailId, {params:{trailId:this.state.trailId}})
    .then((response) => {
        var galleryposts = galleryConversion(response.data);
        this.setState({
          posts: response.data,
          galleryposts: galleryposts
        });
    });

    //retrieve current user from server
    axios.get('/api/currentuser')
    .then((response) => {
      if (response.data) {
        this.setState({currentUser: response.data});
      }
    });

    //retrieve current trail info from server/database
    axios.get('/api/trails/' + this.state.trailId)
      .then((response) => {
        if (response) {
          this.setState({trailInfo: response.data});
          console.log(this.state.trailInfo);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  handleImageLoad(event) {
    console.log('Image loaded ', event.target)
  }

//          <Posts posts={this.state.posts} />
  render() {
    return (
      Object.keys(this.state.trailInfo).length === 0 ? (<div></div>) :
        (<div>
          <Weather latitude={this.state.trailInfo.latitude} longitude={this.state.trailInfo.longitude}/>
          {this.state.currentUser ? <Upload/> : <div/>}
          <ImageGallery className='imagegallery'
            items={this.state.galleryposts}
            slideInterval={2000}
            onImageLoad={this.handleImageLoad}
            thumbnailPosition={'top'}
          />
        </div>)
    );
  }
}

export default Trail;