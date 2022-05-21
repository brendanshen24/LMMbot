const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
const cron = require('cron')
let request = require('request');
const fs = require('fs');
const {diff} = require('just-diff');

const differenceanalyser = (differences,oldjson, newjson) =>{
    //console.log(differences)
    for (let i = 0; i < differences.length; i++) {
        if (differences[i]['value'] != undefined){
            if (differences[i]['value']['address'] != undefined){//this is a big boi
                channel.send('All new schedules for ' + differences[i]['value']['locationKey'] + ' were added today.')
            }
            if (differences[i]['value']['description'] != undefined){
                channel.send('The schedule:' + differences[i]['value']['description'] + 'at ' + newjson[differences[i]['path'][0]]['locationKey'] + 'was added today.')
            }
        }
        if (differences[i]['value'] === undefined){
            //console.log(oldjson[differences[i]['path'][0]][differences[i]['path'][1]][differences[i]['path'][2]])
            channel.send('The schedule:' + oldjson[differences[i]['path'][0]][differences[i]['path'][1]][differences[i]['path'][2]]['description'] + 'was deleted from location: ' +  oldjson[differences[i]['path'][0]]['locationKey'] + ' today.')
        }
    }
}

const requestfunction = () =>{
    //read yesterdays json
    let rawdata = fs.readFileSync('schedules.json');
    let yesterdayjson = JSON.parse(rawdata);

    //get todays json
    request("http://www.massage-vancouver.com/schedule-info.json", function(err, response, body) {
        if (err) {
            let error = "cannot connect to the server";
            console.log(error);
        } else {
            let jsontoday = JSON.parse(body);

            //get differencess
            const differences = diff(yesterdayjson, jsontoday)
            if (differences.length === 0){
                channel.send('No new schedules added today.')
            }
            if (differences.length != 0){
                differenceanalyser(differences,yesterdayjson,jsontoday)
            }
            //console.log(yesterdayjson[10]['schedules'][542]);

            //write todays file to json
            const jsonContent = JSON.stringify(jsontoday);
            fs.writeFile("schedules.json", jsonContent, 'utf8', function (err) {
                if (err) {
                    console.log("An error occured while writing JSON Object to File.");
                    return console.log(err);
                }
            })

        }
    })
}


client.once("ready", () => {
    let scheduledMessage = new cron.CronJob('00 00 00 * * *', () => {
        global.guild = client.guilds.cache.get('SERVER ID');
        global.channel = guild.channels.cache.get('TEXT CHANNEL ID');
        requestfunction()
    });
    scheduledMessage.start()
});


client.login('ENTER DISCORD BOT KEY HERE');