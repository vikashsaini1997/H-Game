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
const helpers = require('./helper/Helper')


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

let clientData = {};

io.on("connection", async (socket) => {
    //await client.quit();
    socket.on("game_play_contest_id", async function (contest_id, userId) {
        console.log('contest_idadfasdfasdf',contest_id)

        client.on('error', (err) => console.log('Redis Client Error', err));

        const CheckUsercontest = await db.contests.findOne({
            where: {
                id: contest_id,
            },
        });

        if (CheckUsercontest.contest_size < 2) {
            let socket_key = "connectToRoom" + contest_id
            let data = {
                player_message: "Minimum two user required",
                player_status: true
            }
            socket.emit(socket_key, data)

        } else {

            //Game status change//
            await db.contests.update({
                status: "2",
            }, {
                where: {
                    id: contest_id,
                },
            });

            const CheckAlreadyContest = await db.contests.findOne({
                where: {
                    status: ["0","1"],
                    entry_fee: CheckUsercontest.entry_fee,
                    category_id:CheckUsercontest.category_id
                },
            });


            if (CheckAlreadyContest) {
            }else{
                // New contest create//
                var End_time = Math.floor(new Date().getTime() / 1000) + parseInt(CheckUsercontest.waiting_time);
                await db.contests.create({
                    category_id: CheckUsercontest.category_id,
                    random_id: uuidv4(),
                    contest_type: 0,
                    entry_fee: CheckUsercontest.entry_fee,
                    status: "1",
                    admin_comission: '0',
                    winning_amount: '0',
                    contest_size: '0',
                    waiting_time: CheckUsercontest.waiting_time,
                    end_time: End_time,
                });
                //New game create end
            }

            var gameAnnouncedFunction = setInterval(async function () {
                let EndgameCHeck = await client.get("eg" + contest_id);
                if (EndgameCHeck != "1") {

                    var contestDetails = await db.contests.findOne({
                        where: {
                            id: contest_id
                        }
                    })

                    var winner_status = await db.join_contest_details.findOne({
                        where: {
                            contest_id: contest_id,
                            win_status: "1"
                        }
                    })

                
                    const value = await client.get(contest_id);
                    let convArray = value ? value.split(",") : [];

                    // helpers.AnncouncedNumberArr

                    var contestArryFinal = [];
                    if (convArray.length == 0) {
                        const CheckgameRule = await db.contests.findOne({
                            where: {
                                id: contest_id,
                            },
                        });

                        let myArray = CheckgameRule.game_rule_number.split("");
                        var addition = myArray[0];
                        var NumberValueGame = myArray[1];

                        while (contestArryFinal.length < 90) {
                            //var r = Math.floor(Math.random() * 90) + 1;

                            // addition, subtract
                            var randdomNumber = helpers.AnncouncedNumberArr(NumberValueGame, addition)
                            if (contestArryFinal.indexOf(randdomNumber) === -1) contestArryFinal.push(randdomNumber);
                        }
                        let sContestArryFinal = contestArryFinal.toString();
                        await client.set(contest_id, sContestArryFinal);
                    } else {
                        contestArryFinal = convArray;
                    }

                    let getUser = await client.get("user_" + contest_id);
                    let getUserIDCount = await client.get("userID_" + userId);
                    console.log('testerrrrrrrr->>>>',getUserIDCount)
                    getUserIDCount = getUserIDCount ? parseInt(getUserIDCount) : 0;

                    let end_cnt = 89;
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
                        client.del(contest_id)
                    } else {


                        let userArray = getUser ? getUser.split(",") : [];

                        let combineArry = userArray.concat([userId.toString()]).filter((x, i, a) => a.indexOf(x) == i);

                        let randomNum = 0;

                        randomNum = contestArryFinal[getUserIDCount];


                        getUserIDCount++;
                        let sGetUserIDCount = getUserIDCount.toString();
                        await client.set("userID_" + userId, sGetUserIDCount);

                        let sCombineArry = combineArry.toString();
                        await client.set("user_" + contest_id, sCombineArry);

                        var gameNumbercheck=contestDetails.game_rule_number.split("");
                        
                            var addition=gameNumbercheck[0];
                            var NumberValueGame=gameNumbercheck[1];

                        let data = {
                            number: parseInt(randomNum),
                            winner_status: "continue",
                            player_status: false,
                            game_symbol:addition,
                            game_number:NumberValueGame,
                        }
                        console.log('data->>>>',data)

                        let socket_key = "connectToRoom" + contest_id


                        if (contestDetails.status != 3) {
                            socket.emit(socket_key, data)
                        } else {
                            if (userId == winner_status.user_id) {
                                let data = {
                                    winner_status: "winner",
                                    player_status: false
                                }
                                socket.emit(socket_key, data)
                            } else {
                                let data = {
                                    winner_status: "loser",
                                    player_status: false
                                }
                                socket.emit(socket_key, data)
                            }
                        }
                    }
                } else {
                    client.del("eg" + contest_id);

                    let winnerUserId = await client.get("userid_const_win" + contest_id);

                    let data = {};
                    if (winnerUserId == userId.toString()) {
                        var randomNum = "";
                        data = {
                            number: parseInt(randomNum),
                            winner_status: "winner",
                            player_status: false
                        }
                    } else {
                        var randomNum = "";
                        data = {
                            number: parseInt(randomNum),
                            winner_status: "loser",
                            player_status: false
                        }
                    }
                    let socket_key = "connectToRoom" + contest_id
                    socket.emit(socket_key, data)
                    client.del("userid_const_win" + contest_id);
                    clearInterval(gameAnnouncedFunction)
                    client.del("user_" + contest_id);
                    //client.set("userID_" + userId, "")
                    client.del("userID_" + userId);
                    client.del(contest_id)

                }

            }, 5000);
        }

    })

    socket.on("contest_list_on", async function (category_id) {
        const contest_list_data = await db.contests.findAll({
            where: {
                category_id: category_id,
                status: ['1', '0'],
                contest_type: '0',
            },
            order: [
                ['entry_fee', 'ASC'],
            ]
        });

        var Storedata = [];
        contest_list_data.forEach(function (item) {
            var Timervalue = item.end_time - Math.floor(new Date().getTime() / 1000);
            Storedata.push({
                'id': item.id,
                'category_id': item.category_id,
                'random_id': item.random_id,
                'contest_type': item.contest_type,
                'admin_comission': item.admin_comission,
                'winning_amount': item.winning_amount,
                'contest_size': item.contest_size,
                'entry_fee': item.entry_fee,
                'status': item.status,
                'waiting': Timervalue,
                'end_time': item.end_time,
            });
        });
        const contestListKey = "contest_list_emit_" + category_id
        socket.emit(contestListKey, Storedata);
    })
    
    socket.on("contest_timer_increase", async function (contest_id) {
        let end_time = Math.floor(new Date().getTime() / 1000) + 120;
        let OneUserjoin = Math.floor(new Date().getTime() / 1000) + 120;
        if (contest_id) {
            const Checkuserjoin = await db.contests.findOne({
                where: {
                    id: contest_id,
                    status: ['1', '0']
                }
            });
            if (Checkuserjoin && Checkuserjoin.contest_size >= 1) {
                const contest_list_data = await db.contests.update({
                    end_time: OneUserjoin,
                    status: "0",
                },
                    {
                        where: {
                            id: contest_id
                        }
                    })
            } else {
                const contest_list_data = await db.contests.update({
                    end_time: end_time,
                    status: "0",
                },
                    {
                        where: {
                            id: contest_id
                        }
                    })
            }
        }
    })
});


//Waiting item update sta//
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
// cron.schedule('* * * * * *', async function (req, res) {
//     const Checktime = await db.contests.findAll({
//         where: {
//             waiting_time: '0',
//             contest_size: '0',
//         }
//     });

//     Checktime.forEach(async function (item) {
//         await db.contests.update({
//             waiting_time: "100",
//             status: "1"
//         },
//             {
//                 where: {
//                     id: item.id,
//                 }
//             });
//     });


// });
//Timer update user not add //

//Timer update user not add//


/* status updat */
// var contestStatus = cron.schedule('* * * * * *', async function (req, res) {

//     const contest_table_data = await db.contests.findAll({
//         where: {
//             waiting_time: '0',
//             status:'1',
//             contest_type:'0'
//         },
//     });
//     contest_table_data.forEach(async function (item) {

//         await db.contests.update({
//             status: '2',
//         },
//             {
//                 where: {
//                     id: item.id,
//                 }
//             });

//             await db.contests.create({
//                 category_id: item.category_id,
//                 entry_fee: item.entry_fee,
//                 waiting_time: '120',
//                 contest_type:0,
//                 admin_comission: "0",
//                 winning_amount: "0",
//                 status: "1",
//                 contest_size: 0,
//                 random_id: uuidv4()
//             })
//     });
// });
/* status update sto*/

//user not join contest delete cron//
// cron.schedule('0 0 */24 * * *', async function(){
//    const contest_table_data = await db.contests.findAll();

//    contest_table_data.forEach(async function (item) {
//        if(item.contest_size <= 2){
//             await db.contests.destroy({
//                 where: {
//                 id: item.id
//                 }
//             });
//        }
//    });

// });

//user not join contest delete cron Stop//

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