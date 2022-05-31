require('dotenv').config();
const express = require("express");
const app = express();
const { createServer } = require("http");
const { Server } = require("socket.io");
const cors = require('cors');
const { Op } = require("sequelize");
const redis = require('redis');
const client = redis.createClient();

const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const errorHandler = require('./front/middleware/error-handler');
const path = require("path")
const user = require("./models/user");
const db = require("./models");
const cron = require('node-cron');
const { v4: uuidv4 } = require('uuid');


const httpServer = createServer(app);
// const io = new Server(httpServer, { cors:'*',allowEIO3: true });

app.use(cors());

app.set('view engine', 'ejs')
const PORT = process.env.PORT;
// app.use(cors({
//     origin: '*'
// }));
const server = app.listen(PORT, () => console.log(`Server running on ${PORT}`))
const io = require("socket.io")(server, {
    pingTimeout: 60000,
    pingInterval: 25000,
    cors: {
        origin: "*"
    }
})
app.use((req, res, next) => {
    req.io = io;
    return next();
});
const userRoutes = require('./front/routes/user.routes');
const adminRoutes = require('./admin/routes/admin.routes');
const { count, log } = require('console');
const { condition } = require('sequelize');
const { create } = require('domain');
app.use(express.json()) //json allow
app.use(express.urlencoded({ extended: true })) //json allow
app.use(express.static('public'))
app.use('/uploads', express.static(path.join(__dirname, '/uploads')))
app.use('/app/users', userRoutes);
app.use('/app/admin', adminRoutes);
// global error handler
app.use(errorHandler);
const options = {
    definition: {
        info: {
            title: "Housie backend",
            version: "1.0.0",
        },
        securityDefinitions: {
            Bearer: {
                type: "apiKey",
                name: "Authorization",
                in: "header",
            }
        }
    },
    apis: ["./routes/*.yml"],
};
const specs = swaggerJsdoc(options);
app.use(
    "/docs",
    swaggerUi.serve,
    swaggerUi.setup(specs, { explorer: true })
);

// const io = new Server(server);

client.connect();


io.on("connection", async (socket) => {
    //await client.quit();
    socket.on("game_play_contest_id", async function (contest_id, userId) {

        client.on('error', (err) => console.log('Redis Client Error', err));



        var gameAnnouncedFunction = setInterval(async function () {
            let EndgameCHeck = await client.get("eg" + contest_id);
            if (EndgameCHeck != "1") {

                /*  var contestDetails = await db.contests.findOne({
                     where: {
                         id: contest_id
                     }
                 }) */




                /* if (contestDetails.announced_numbers != null) {
                    var nums = contestDetails.announced_numbers.split(",");
     
                    //console.log(typeof(nums));
     
                    if (nums.indexOf(randomNum.toString()) != -1) {
                        // number exists for this contest
                        // do NOTHING
                        // continue
                        // console.log("CONTINUE");
                        return;
                    }
                } else {
                    var nums = [];
                } */




                const value = await client.get(contest_id);
                //const contest_count = await client.get("no_"+contest_id);

                //console.log("value----->>>", value);
                let convArray = value ? value.split(",") : [];
                //console.log("convArray--->>>", convArray);

                var contestArryFinal = [];
                if (convArray.length == 0) {

                    while (contestArryFinal.length < 90) {
                        var r = Math.floor(Math.random() * 90) + 1;
                        if (contestArryFinal.indexOf(r) === -1) contestArryFinal.push(r);
                    }
                    console.log(contestArryFinal);
                    let sContestArryFinal = contestArryFinal.toString();
                    await client.set(contest_id, sContestArryFinal);
                } else {
                    contestArryFinal = convArray;
                }

                console.log('arrayData---->>>>', convArray.length)

                /*client.del(contest_id,function (err, reply) {
                  console.log("Redis_Del-->>>>", reply);
                  console.log('Redis_data----->>>>',err)
                }); */
                let getUser = await client.get("user_" + contest_id);
                let getUserIDCount = await client.get("userID_" + userId);
                getUserIDCount = getUserIDCount ? parseInt(getUserIDCount) : 0;

                let end_cnt = 89;
                console.log("end_cnt<=getUserIDCount------------>>>", end_cnt, getUserIDCount);
                if (end_cnt <= getUserIDCount) {
                    await db.contests.update({
                        announced_numbers: value
                    }, {
                        where: {
                            id: contest_id
                        }
                    });

                    clearInterval(gameAnnouncedFunction)
                    //client.set("user_" + contest_id, "")
                    client.del("user_" + contest_id);
                    //client.set("userID_" + userId, "")
                    client.del("userID_" + userId);
                } else {


                    let userArray = getUser ? getUser.split(",") : [];

                    let combineArry = userArray.concat([userId.toString()]).filter((x, i, a) => a.indexOf(x) == i);




                    let randomNum = 0;
                    //if (contestArryFinal[getUserIDCount]) {

                    console.log("getUserIDCount---->>>", contestArryFinal[getUserIDCount]);
                    randomNum = contestArryFinal[getUserIDCount];
                    // }
                    // else {

                    //     /* randomNum=~~(Math.random() * (90 - 1 + 1) + 1); */

                    //     var nums = convArray;
                    //     nums.push(randomNum);
                    //     //nums = nums.join(",");
                    //     // console.log("convArray--nums->>>", nums);
                    //     nums = nums.toString();
                    //     await client.set(contest_id, nums);
                    // }


                    getUserIDCount++;
                    let sGetUserIDCount = getUserIDCount.toString();
                    await client.set("userID_" + userId, sGetUserIDCount);

                    let sCombineArry = combineArry.toString();
                    await client.set("user_" + contest_id, sCombineArry);




                    //console.log('wrong------->>>>>')

                    // console.log('Valusesssss------>>>>', value);


                    /*              await db.contests.update({
                                     announced_numbers: nums
                                 }, {
                                     where: {
                                         id: contest_id
                                     }
                                 }) */


                    let data = {
                        number: parseInt(randomNum),
                        winner_status: "continue",
                    }

                    console.log('Number', randomNum);

                    console.log('contest_id', contest_id);
                    let socket_key = "connectToRoom" + contest_id

                    console.log("socket_key", socket_key);

                    //socket.join(contest_id);
                    socket.emit(socket_key, data)

                    //io.sockets.in(contest_id).emit('connectToRoom_', data)

                }
            } else {
                client.del("eg" + contest_id);

                let winnerUserId = await client.get("userid_const_win" + contest_id);
                console.log('winnerUserId->>>>', winnerUserId, userId)

                let data = {};
                if (winnerUserId == userId.toString()) {
                    var randomNum="";
                    data = {
                        number: parseInt(randomNum),
                        winner_status: "winner"
                    }
                } else {
                    var randomNum="";
                    data = {
                        number: parseInt(randomNum),
                        winner_status: "loser"
                    }
                }
                let socket_key = "connectToRoom" + contest_id
                socket.emit(socket_key, data)
                client.del("userid_const_win" + contest_id);
          
            }

        }, 5000);

    })

});

//Waiting item update start//
// var Tasker = cron.schedule('* * * * * *', async function (req, res) {

//     const contest_table_data = await db.contests.findAll();
//     const Usercheck = await db.User.findAll({
//         where: {
//             role_id: "3",
//             status: '1'
//         },
//     });

//     if (Usercheck.length >= 1) {
//         contest_table_data.forEach(async function (item) {
//             var timer_counter = item.waiting_time - 1;

//             if (item.waiting_time > 0) {
//                 await db.contests.update({
//                     waiting_time: timer_counter,
//                 },
//                     {
//                         where: {
//                             id: item.id,
//                         }
//                     });
//             }
//         });
//     }
// });
//Waiting item update stop//


/* status updat */
/* var contestStatus = cron.schedule('* * * * * *', async function (req, res) {

    const contest_table_data = await db.contests.findAll({
        where: {
            waiting_time: '0',
            status:'1'
        },
    });
    contest_table_data.forEach(async function (item) {

        await db.contests.update({
            status: '2',
        },
            {
                where: {
                    id: item.id,
                }
            });

            await db.contests.create({
                category_id: item.category_id,
                entry_fee: item.entry_fee,
                waiting_time: '120',
                contest_type:0,
                admin_comission: "0",
                winning_amount: "0",
                status: "1",
                contest_size: 0,
                random_id: uuidv4()
            })
    });
}); */
/* status update sto*/

/* var Anncoumentnumber = cron.schedule('* * * * * *', async function (req, res) {
    const contest_table_data = await db.contests.findAll({
        attributes:['id','announced_numbers','waiting_time'],
        where: {
            ann_number_status: 0
        }
    });


//console.log('checkdata',contest_table_data);


    contest_table_data.forEach(async function (item) {
        var contest_id = item.id;


        //console.log("contest_table_data,contestDetails--->>",JSON.stringify(contestDetails));


         if (item.waiting_time == 0) {
            let contestDetails= contest_table_data.filter(x=>x.id==contest_id);
            //console.log('ContestDetails------->>>',JSON.stringify(contestDetails));
            // var contestDetails = await db.contests.findOne({
            //     where: {
            //         id: contest_id
            //     }
            // })

            contestDetails=contestDetails && contestDetails.length>0 ? contestDetails[0]:{};
            if (contestDetails.announced_numbers) {
                // console.log('CheckA',test)
                var Checkanncoment = contestDetails.announced_numbers.split(',').map(parseFloat);
                //console.log('checkData------->>>',Checkanncoment)
                if (Checkanncoment.length === 89) {
                    await db.contests.update({
                        ann_number_status: 1
                    }, {
                        where: {
                            id: contest_id
                        }
                    })
                }
            }

            const randomNum = ~~(Math.random() * (90 - 1 + 1) + 1);

            if (contestDetails.announced_numbers != null) {
                var nums = contestDetails.announced_numbers.split(",");
                //console.log('testete', nums);

                //console.log(typeof(nums));

                if (nums.indexOf(randomNum.toString()) != -1) {
                    // number exists for this contest
                    // do NOTHING
                    // continue
                    // console.log("CONTINUE");
                    return;
                }
            } else {
                var nums = [];
            }
            console.log('afsadfsafasa', nums);
            nums.push(randomNum);
            nums = nums.join(",");
            //console.log('Numbersss', nums);

            var Updaates= db.contests.update({
                announced_numbers: nums
            }, {
                where: {
                    id: contest_id
                }
            })

            console.log('UpdateVlaues-------->>>>',Updaates)

            let data = {
                number: randomNum,
                winner_status: "winner",
            }

            //console.log('Number', randomNum);

            //console.log('contest_id', contest_id);
            let socket_key = "connectToRoom" + contest_id

            //console.log("socket_key", socket_key)
            //socket.join(contest_id);


            //io.sockets.in(contest_id).emit('connectToRoom_', data)
            io.emit(socket_key, data);
            //  io.emit("ticket_announcement_number", data)
        }
    })
});
 */



// var Cron = cron.schedule('* * * * * *', async function (req, res) {

//     const contest_table_data = await db.contests.findAll({
//         where:{
//             is_processing:0
//         }
//     });

//         contest_table_data.forEach(async function (item) {
//             var contest_id=item.id;


//             if(item.waiting_time == 0){

//                 await db.contests.update({
//                     is_processing: 1
//                 }, {
//                     where: {
//                         id: contest_id
//                     }
//                 })

//                 var gameAnnouncedFunction = setInterval(async function () {

//                     var contestDetails = await db.contests.findOne({
//                         where: {
//                             id: contest_id
//                         }
//                     })


//                     if (contestDetails.dataValues.announced_numbers) {
//                         // console.log('CheckA',test)
//                         var Checkanncoment = contestDetails.dataValues.announced_numbers.split(',').map(parseFloat);
//                         if (Checkanncoment.length === 89) {
//                             clearInterval(gameAnnouncedFunction)
//                         }
//                     }

//                     const randomNum = ~~(Math.random() * (90 - 1 + 1) + 1);

//                     if (contestDetails.announced_numbers != null) {
//                         var nums = contestDetails.announced_numbers.split(",");
//                         console.log('testete',nums);

//                         //console.log(typeof(nums));

//                         if (nums.indexOf(randomNum.toString()) != -1) {
//                             // number exists for this contest
//                             // do NOTHING
//                             // continue
//                             // console.log("CONTINUE");
//                             return;
//                         }
//                     } else {
//                         var nums = [];
//                     }
//                     console.log('afsadfsafasa',nums);
//                     nums.push(randomNum);
//                     nums = nums.join(",");
//                     console.log('Numbersss',nums);

//                     await db.contests.update({
//                         announced_numbers: nums
//                     }, {
//                         where: {
//                             id: contest_id
//                         }
//                     })

//                     let data = {
//                         number: randomNum,
//                         winner_status: "winner",
//                     }

//                     console.log('Number',randomNum);

//                     console.log('contest_id',contest_id);
//                     let socket_key = "connectToRoom" + contest_id

//                     console.log("socket_key", socket_key)
//                     //socket.join(contest_id);


//                     //io.sockets.in(contest_id).emit('connectToRoom_', data)
//                     io.emit(socket_key,data);
//                         //  io.emit("ticket_announcement_number", data) 
//                 }, 2000);
//             }

//             //    io.emit("contest_list_emit", contest_table_data)
//         });
// });


/* var interval = setInterval(async function(){
    const contests = await db.contests.findAll({
        where:{
            status:"1"
        }
    });
    //console.log("TOT CONTESTS",contests.length);

    for(var cLen = 0; cLen < contests.length;cLen++){
        const randomNum = ~~(Math.random() * (90 - 1 + 1) + 1);

        var contestDetails = await db.contests.findOne({
            where:{
                id:contests[cLen].id
            }
        })

        if(contestDetails.announced_numbers!=null){
            var nums = contestDetails.announced_numbers.split(",");

            //console.log(typeof(nums));

            if(nums.indexOf(randomNum.toString())!=-1){
                // number exists for this contest
                // do NOTHING
                // continue
                console.log("CONTINUE");
                continue;
            }
        }else{
            console.log("I AM HERE");
            var nums = [];
        }
       console.log("RAVI");

        nums.push(randomNum);
        nums = nums.join(",");
        //console.log(nums);

        await db.contests.update({
            announced_numbers:nums
        },{
            where:{
                id:contests[cLen].id
            }
        })
    }
}, 2000); */