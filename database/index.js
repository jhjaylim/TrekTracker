var models = require('./models');

getUserByEmail = (email) => {
  return models.users.findOne({
    where: {email}
  })
  .then((user) => {
    if (user) {
      return user;
    } else {
      return new Promise((resolve, reject) => {
        reject('There is no user registered under the email ' + email);
      });
    }
  });
};

getTrailByID = (id) => {
  return models.trails.findOne({
    where: {id}
  })
  .then((trail) => {
    if (trail) {
      return trail;
    } else {
      return new Promise((resolve, reject) => {
        reject('There is no trail under the id ' + id);
      });
    }
  });
};

getTrailsByName = (name) => {
  if (!name || name.constructor !== String) {
    return new Promise((resolve, reject) => {
      reject('Expected a string but instead was passed in ' + name);
    });
  }

  return models.trails.findAll({
    where: {name}
  })
  .then((trails) => {
    for (let i = 0; i < trails.length; i++) {
      trails[i].latitude = parseFloat(trails[i].latitude);
      trails[i].longitude = parseFloat(trails[i].longitude);
    }
    return trails;
  });
};

getAllTrails = () => {
  return models.trails.findAll()
  .then((trails) => {
    for (let i = 0; i < trails.length; i++) {
      trails[i].latitude = parseFloat(trails[i].latitude);
      trails[i].longitude = parseFloat(trails[i].longitude);
    }
    return trails;
  });
};

registerInterest = (userId, eventid) => {


  models.interestedInEvent.findOrCreate({where: {user_id: userId, event_id: eventid}})
  .spread((user, created) => {
    console.log('USER', user);
    console.log(user.get({plain: true}));
    console.log('--------------------interestedInEvent created: ', created);
  })
}


createTrail = (id, name, directions = '', latitude = 0, longitude = 0, description = '', traillength = 0) => {
  if (!name || name.constructor !== String) {
    return new Promise((resolve, reject) => {
      reject('Expected trail name to be a non-empty string, but instead got ' + name);
    })
    .catch(err => console.log(err));
  }
  if (directions === undefined || directions === null || directions.constructor !== String) {
    return new Promise((resolve, reject) => {
      reject('Expected trail directions to be a string, but instead got ' + directions);
    })
    .catch(err => console.log(err));
  }
  if (description === undefined) { //  || description === null || description.constructor !== String
    return new Promise((resolve, reject) => {
      reject('Expected trail description to be a string, but instead got ' + description);
    })
    .catch(err => console.log(err));
  }
  if (traillength === undefined || traillength === null) { //|| traillength.constructor !== String
    return new Promise((resolve, reject) => {
      reject('Expected trail length to be a string, but instead got ' + traillength);
    })
    .catch(err => console.log(err));
  }
  return models.trails.findOne({
    where: {id}
  })
  .then((trail) => {
    // If a trail with this ID already exist, don't attempt to create another one
    if (trail) {
      trail.latitude = parseFloat(trail.latitude);
      trail.longitude = parseFloat(trail.longitude);
      return trail;
    }
    return models.trails.create({
      id, name, directions, latitude, longitude, description, traillength
    });
  })
  .catch( err => console.log(err));
};

// posterData can be either a user ID or a user email (REMEMBER: user IDs are STRINGS, NOT numbers)
// trailData can be either a trail ID or a trail name
// posterDataType should either be 'id' or 'email'
createPost = (posterEmail, trailId, title, text, imageUrl, latitude=0, longitude=0) => {
  if (!posterEmail || posterEmail.constructor !== String) {
    return new Promise((resolve, reject) => {
      reject('Expected poster email to be a string, but instead it was ' + posterEmail);
    });
  }
  if (!title || title.constructor !== String) {
    return new Promise((resolve, reject) => {
      reject('Expected title to be a string, but instead it was ' + title);
    });
  }
  if (!text || text.constructor !== String) {
    return new Promise((resolve, reject) => {
      reject('Expected text to be a string, but instead it was ' + text);
    });
  }
  if (!imageUrl || imageUrl.constructor !== String) {
    return new Promise((resolve, reject) => {
      reject('Expected image url to be a string, but instead it was ' + imageUrl);
    });
  }
  return module.exports.getUserByEmail(posterEmail)
  .then((poster) => {
    return models.posts.create({
      title,
      text,
      image_url: imageUrl,
      view_count: 0,
      flag_count: 0,
      latitude,
      longitude,
      poster_user_id: poster.id,
      trail_id: trailId
    });
  })
  .catch(err => console.log(err));
};

createEvent = (creatorId, trailId, eventTitle, eventDesc, eventTrail, eventDate, eventStart, eventEnd) => {
  if (!creatorId) {
    throw new Error ('Expected the event creator id to exist, but instead it was ' + creatorId);
  }
  if (!trailId) {
    throw new Error ('Expected the trail id to exist, but instead it was ' + trailId);
  }
  if (!eventTitle || eventTitle.constructor !==  String) {
    throw new Error('Expected the title to be a string, but instead it was ' + eventTitle);
  }
  if (!eventDesc || eventDesc.constructor !==  String) {
    throw new Error('Expected the description to be a string, but instead it was ' + eventDesc);
  }
  if (!eventTrail || eventTrail.constructor !==  String) {
    throw new Error('Expected the trail name to be a string, but instead it was ' + eventTrail);
  }
  if (!eventDate || eventDate.constructor !==  String) {
    throw new Error ('Expected the date to be a string, but instead it was ' + eventDate);
  }
  if (!eventStart || eventStart.constructor !==  String) {
    throw new Error ('Expected the start time to be a string, but instead it was ' + eventStart);
  }
  if (!eventEnd || eventEnd.constructor !== String) {
    throw new Error ('Expected the end time to be a string, but instead it was ' + eventEnd);
  }
  return models.events.create({
    title: eventTitle,
    desc: eventDesc,
    trailname: eventTrail,
    date: eventDate,
    start: eventStart,
    end: eventEnd,
    creator_user_id: creatorId,
    trail_id: trailId,
  }).then((event)=>{
    event = event.dataValues;
    console.log('--------------------------------DB EVENT CREATED!!!!', event);

    registerInterest(event.creator_user_id, event.id);
    return event;
  })
  .catch(err => console.log(err));
};



module.exports.getAllEventsNearLocations = (trailIdList) => {
  var orQuery = trailIdList.map((id)=>{
    return {trail_id: id}
  });
  return models.events.findAll({
    where: {
      $or: orQuery
    }
  })
  .then((events)=>{
    return events.map((event)=>{
      return event.dataValues;
    });
  });
};


getAllEventsByTrailId = (trailId) => {
  return getAllEventsNearLocations([trailId])
  .then((events)=>{
    return events[0];
  });
};

// get all events by user

getAllEventsByUserId = (userId) => {

  return models.events.findAll({where: { creator_user_id: userId}});
  
};

getAllEventsByUserEmail = (email) => {
  return models.users.findOne({where: {email} })
  .then((user)=>{
    return models.events.findAll({where: { creator_user_id: user.id}});
  })
  .catch((err) =>{
    console.log("Error: ", err);
    throw err;
  });
};

getEventById = (eventId) => {
  return models.events.findOne({where: {id:eventId}})
  .catch((err)=>{
    console.log("Error: ", err);
    throw err;
  });
};
getAllEventsById = (eventIdList) => {

  var orQuery = eventIdList.map((id)=>{
    return {id:id};
  });
  return models.events.findAll({
    where: {
      $or: orQuery
    }
  })
  .catch((err)=>{
    console.log("Error: ", err);
    throw err;
  });
};

getPostsByUserEmail = (email) => {
  return getUserByEmail(email)
  .then((user) => {
    return models.posts.findAll({
      where: {
        poster_user_id: user.id
      }
    })
    .then((posts) => {
      for (let i = 0; i < posts.length; i++) {
        posts[i].latitude = parseFloat(posts[i].latitude);
        posts[i].longitude = parseFloat(posts[i].longitude);
        posts[i].poster_user_id = parseInt(posts[i].poster_user_id);
      }
      return replaceReferenceModelIdsWithModels(posts, 'poster_user_id', models.users, 'poster');
    });
  });
};

getPostsByTrailId = (id) => {
  return models.posts.findAll({
    where: {trail_id: id}
  })
  .then((posts) => {
    for (let i = 0; i < posts.length; i++) {
      posts[i].latitude = parseFloat(posts[i].latitude);
      posts[i].longitude = parseFloat(posts[i].longitude);
      posts[i].poster_user_id = parseInt(posts[i].poster_user_id);
    }
    return replaceReferenceModelIdsWithModels(posts, 'poster_user_id', models.users, 'poster');
  });
};

getInterestedEventsByUserId = (userId) => {
  return models.interestedInEvent.findAll({
    where: {user_id: userId}
  })
  .then((interested)=>{
    interested = interested.map((event)=>{
      return event.dataValues;
    });
    return interested;
  });

};

// Used when getting an array of models that contain foreign keys
// and, for each instance in the array, will replace the foreign
// key with the model it is pointing to
//
// modelArray - the array of existing models where each model contains a foreign ID
// idToReplace - a string representing the name of the foreign key that will be replaced
// modelToReplaceWith - the sequelize model that will be searched for using the foreign key
// modelKey - the key where the new foreign-referenced model will be replaced within each element of modelArray
let replaceReferenceModelIdsWithModels = (modelArrayImmutable, idToReplace, modelToReplaceWith, modelKey) => {
  let modelArray = JSON.parse(JSON.stringify(modelArrayImmutable));
  let getModelPromises = []; // An array of promises, one for each model in the model array
  modelArray.forEach((model) => {
    let referenceModelId = model[idToReplace];
    delete model[idToReplace];
    getModelPromises.push(
      modelToReplaceWith.findOne({
        where: {
          id: referenceModelId
        }
      })
      .then((referenceModel) => {
        model[modelKey] = referenceModel;
        return model;
      })
    );
  });
  return Promise.all(getModelPromises)
  .then(() => {
    return modelArray;
  });
};

//POST
module.exports.createTrail = createTrail;
module.exports.createEvent = createEvent;
module.exports.createPost = createPost;
module.exports.registerInterest = registerInterest;

//GET
module.exports.getUserByEmail = getUserByEmail;

module.exports.getTrailsByName = getTrailsByName;
module.exports.getTrailByID = getTrailByID;
module.exports.getAllTrails = getAllTrails;

module.exports.getEventById = getEventById;
module.exports.getAllEventsNearLocations = getAllEventsNearLocations;
module.exports.getAllEventsByTrailId = getAllEventsByTrailId;
module.exports.getAllEventsByUserEmail = getAllEventsByUserEmail;
module.exports.getAllEventsByUserId = getAllEventsByUserId;
module.exports.getInterestedEventsByUserId = getInterestedEventsByUserId;
module.exports.getAllEventsById = getAllEventsById;
module.exports.getPostsByUserEmail = getPostsByUserEmail;
module.exports.getPostsByTrailId = getPostsByTrailId;
