const express = require('express');
const router = express.Router();
const _ = require('lodash');

const Event = require('../models/event');
const Users = require('../models/user');
const Email = require('../models/email');
const Booking = require('../models/booking');

const {
  authUser,
  authRole,
  checkAuthenticated,
  checkNotAuthenticated,
  adminUser,
} = require('../middleware/auth');
const { log } = require('console');

/*<><><><>< static pages <><><><><*/

router.get('/', (req, res) => {
  Event.find({}, function (err, foundevents) {
    if (err) {
      console.log(err);
      return res.render('index', {
        errorMessages: 'Error fetching posts',
        events: [],
        isAuthenticated: req.isAuthenticated(),
        eventsCount: '',
      });
    }

    console.log('foundevents', foundevents);

    res.render('index', {
      errorMessages: '',
      events: foundevents,
      isAuthenticated: req.isAuthenticated(),
    });
  });
});

router.get('/contact', function (req, res) {
  res.render('contact', {
    contact: 'contactContent',
  });
});

router.get('/thanks', function (req, res) {
  res.render('thanks');
});

/*error page*/
router.get('/404', (req, res) => {
  res.render('404');
});

/*____________________________________________________________________________________*/

/*Page related to database*/

/*getting all in one */

router.get('/allpostsinone', function (req, res) {
  Event.find({}, function (err, foundposts) {
    if (!err) {
      res.render('allposts', {
        allposts: foundposts,
      });
    }
  });
});

/*for events*/
// router.get('/allevents/:eventId', function (req, res) {


//   const requestedEventId = req.params.eventId;

//   /*const requestedPostId = req.params.postId.toString();*/
//   console.log(requestedEventId + ' tt');



//   Event.findOne(
//     {
//       _id: requestedEventId,
//     },
//     function (err, foundevents) {
//       console.log('events', foundevents);
//       if (err) {
//         console.log(err);
//       } else {
//         res.render('event', {
//           eventTitle: foundevents.eventTitle,
//           eventBody: foundevents.eventBody,
//         });
//         console.log('events', foundevents + ' err From posts/route');
//       }
//     }
//   );
// });





// to book an event

// Route to create a booking for an event


router.get('/allevents/:eventId', function (req, res) {
  const requestedEventId = req.params.eventId;

  Event.findOne({ _id: requestedEventId }, function (err, foundEvent) {
    if (err) {
      console.log(err);
      return res.status(500).render('event', { error: 'Internal Server Error' });
    }

    if (!foundEvent) {
      console.log('Event not found');
      return res.status(404).render('event', { error: 'Event not found' });
    }

    // Assume Booking is your booking model
    Booking.find({ eventId: requestedEventId }, function (err, bookings) {
      if (err) {
        console.log(err);
        return res.status(500).render('event', { error: 'Internal Server Error' });
      }

      res.render('event', {
        eventTitle: foundEvent.eventTitle,
        eventBody: foundEvent.eventBody,
        bookings: bookings,
      });
    });
  });
});




router.post('/event/book', async (req, res) => {
  const { userName, phoneNumber, email, eventId } = req.body;
  console.log('req.body', req.body);
  console.log('eventid', eventId);

  try {
    const event = await Event.findById(eventId);
    console.log('Event', event);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const booking = new Booking({
      eventId: eventId,
      userName: userName,
      phoneNumber: phoneNumber,
      email: email,
    });

    await booking.save();
    event.bookings.push(booking);
    await event.save();

    // res.status(201).json(booking);

    // res.render('index', {
    //   errorMessages: 'You have successfully booked your events',
    //   events:"",
    //   isAuthenticated: req.isAuthenticated(),
    // });
// After successfully saving the booking
res.redirect("/?errorMessages=You have successfully booked your event");

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Route to get all bookings for a specific event
router.get('/:eventId/bookings', async (req, res) => {
  const eventId = req.params.eventId;

  try {
    const event = await Event.findById(eventId).populate('bookings');

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const bookings = event.bookings;

    res.status(200).json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/*+++++++++++++++++++++++++++++++++++++++++++++++++++++++*/
/*Handling all related post route*/

/*<L><<><><><<><><><><<><<><><><<><><><><><><><>*/

/*To create a post */
router.post('/compose', checkAuthenticated, function (req, res) {
  const event = new Event({
    topic: req.body.topic,
    eventTitle: req.body.posttitle,
    eventBody: req.body.postbody,
  });
  event.save(function (err) {
    if (!err) {
      console.log('Created Successfully');
  
      res.redirect('/admin/compose');
    }
  });
});



/*===========================strictly for admin only ============*/

router.get('/admindashboard', checkAuthenticated, (req, res) => {
  res.render('admindashboard1', {
    user: '',
    eventsCount: '',
    countUsers: '',
  });
});

// router.get('/admindashboard', checkAuthenticated, (req, res) => {
//   var postQuery;
//   Post.find({}, function (err, foundposts) {
//     if (err) {
//       console.log(err);
//       return;
//     }

//     postQuery = foundposts;
//     postCount = foundposts.length;
//     /*console.log(foundposts);*/
//   });

//   var messageQuery;
//   Message.find({}, (err, foundMessages) => {
//     if (err) {
//       console.log(err);
//       return;
//     }
//     messageQuery = foundMessages;
//     messageCount = foundMessages.length;
//   });

//   console.log('Loggin form admin route ' + postQuery);
//   Users.find({}, function (err, foundUsers) {
//    const  countUsers = foundUsers.length;
//     console.log(foundUsers);

//     console.log("USer length", countUsers);

//     if (!err) {
//       res.render('admindashboard1', {
//         user: req.user.username,
//         emails: foundemails,
//         allposts: postQuery,
//         eventsCount: postCount,
//         countUsers: countUsers,
//         messageCount: messageCount,
//       });
//     }
//   });
// });

router.get('/admindashboard', checkAuthenticated, (req, res) => {
  var postQuery;
  Event.find({}, function (err, foundposts) {
    if (err) {
      console.log(err);
      return;
    }

    postQuery = foundposts;
    postCount = foundposts.length;
  });

  Users.find({}, function (err, foundUsers) {
    const countUsers = err ? 0 : foundUsers.length; // Define countUsers even if there's an error
    console.log(foundUsers);
    res.render('admindashboard1', {
      user: req.user.username,
      allposts: postQuery,
      eventsCount: postCount,
      countUsers: countUsers,
      messageCount: messageCount,
    });
  });
});

router.get('/admin/compose', checkAuthenticated, function (req, res) {
  res.render('compose', {
    topic: req.body.topic,
  });
});





router.get('/allusers', checkAuthenticated, (req, res) => {
  Users.find({}, function (err, foundUsers) {
    console.log('users', foundUsers);
    if (!err) {
      res.render('users', {
        users: foundUsers,
      });
    }
  });
});

router.post('/allusers/delete', checkAuthenticated, (req, res) => {
  const checkItemId = req.body.checkboxofsubscriberdelete;

  Users.findByIdAndRemove(checkItemId, function (err) {
    if (err) {
      console.log(err);
      // Handle the error, you might want to send an error response here
      return res.status(500).send({ message: 'Error deleting user' });
    } else {
      // Redirect after successful deletion
      res.redirect('/allusers');
    }
  });
});

/*This is to delete and manage the posts*/
router.get('/alleventsforadminonly', checkAuthenticated, (req, res) => {
  Event.find({}, function (err, foundposts) {
    if (err) {
      console.log(err);
    } else {
      res.render('alleventsadmin', {
        events: foundposts,
      });
    }
  });
});

router.post('/delete', checkAuthenticated, (req, res) => {
  console.log(req.body);
  const checkedItemid = req.body.checkboxfordelete;
  const checkItemName = req.body.checkboxforedit;
  Event.findByIdAndRemove(checkedItemid, function (err) {
    if (err) {
      console.log(err);
    } else {
      console.log('Deleted Successfully');
    }
  });
  res.redirect('/alleventsforadminonly');
});

module.exports = router;
