var amqp = require('amqplib/callback_api');
var amqpConn = null;


var Hapi = require('hapi');
var Nes = require('nes');
var Uuid = require('uuid')

var server = new Hapi.Server();
server.connection({port:7777});

var onConnection = (socket) => {
    console.log(socket.id + ' is connected')
}

var onDisconnection = (socket) => {
    console.log(socket.id + ' is disconnected')
}

var onMessage = (socket, message, next) => {
    console.log('message from ' + socket.id + ' : ' + JSON.stringify(message))
    next('sent from server with love')
}

server.register([{ register: Nes, options: {onMessage, onConnection, onDisconnection, auth: false}}],function (err) {

    if(err){
        console.log('register NES failed!!!')
    }

    var onSubscribe = (socket, path, params, next) => {

        console.log('onSubscribe');
        return next();
    }

    var onUnsubscribe = (socket, path, params, next) => {

        console.log('onUnsubscribe');
        return next();
    }

    server.subscription('/machine/remoteconfig', {
            auth: false,
            onSubscribe,
            onUnsubscribe
        });

    server.route({
        method: 'GET',
        path: '/h',
        config: {
            id: 'hello',
            handler: function (request, reply) {
                server.publish('/machine/remoteconfig', {event: 'ahihi'});
                return reply('world!');
            }
        }
    });

     server.route({
        method: 'POST',
        path: '/publish',
        config: {
            handler: function (request, reply) {
                server.publish('/machine/remoteconfig', {event: 'ahuhu'});
                return reply('publish!!!!');
            }
        }
    });



    server.start(function (err) {
        console.log(server.info);

        setInterval(() => {
            server.publish('/machine/remoteconfig', {event: Uuid.v4()});
        }, 2000);

     });
});


// function start() {
//   amqp.connect('amqp://zvxbtgbh:UNu6hW4y6rKohzQHRK4C8oBDwSyA-V70@donkey.rmq.cloudamqp.com/zvxbtgbh' + "?heartbeat=60", function(err, conn) {
//     if (err) {
//       console.error("[AMQP]", err.message);
//       return setTimeout(start, 1000);
//     }
//     conn.on("error", function(err) {
//       if (err.message !== "Connection closing") {
//         console.error("[AMQP] conn error", err.message);
//       }
//     });
//     conn.on("close", function() {
//       console.error("[AMQP] reconnecting");
//       return setTimeout(start, 1000);
//     });
//     console.log("[AMQP] connected");
//     amqpConn = conn;
//     whenConnected();
//   });
// }

// function whenConnected() {
//  // startPublisher();
//   startWorker();
// }

// // A worker that acks messages only if processed successfully
// function startWorker() {
//   amqpConn.createChannel(function(err, ch) {
//     if (closeOnErr(err)) return;
//     ch.on("error", function(err) {
//       console.error("[AMQP] channel error", err.message);
//     });
//     ch.on("close", function() {
//       console.log("[AMQP] channel closed");
//     });

//     ch.prefetch(10);
//     ch.assertQueue("jobs", { durable: true }, function(err, _ok) {
//       if (closeOnErr(err)) return;
//       ch.consume("jobs", processMsg, { noAck: false });
//       console.log("Worker is started");
//     });

//      function processMsg(msg) {
//       work(msg, function(ok) {
//         try {
//           if (ok)
//             ch.ack(msg);
//           else
//             ch.reject(msg, true);
//         } catch (e) {
//           closeOnErr(e);
//         }
//       });
//     }
//   });
// }

// function work(msg, cb) {
//   console.log("PDF processing of ", msg.content.toString());
//   cb(true);
// }

// function closeOnErr(err) {
//   if (!err) return false;
//   console.error("[AMQP] error", err);
//   amqpConn.close();
//   return true;
// }

// start();