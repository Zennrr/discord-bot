// Require the necessary discord.js classes
const fs = require('node:fs');
const {Client, Collection, Intents} = require('discord.js');
const dotenv = require("dotenv");
const {token} = require('./config.json');
const { Player } = require("discord-player");
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const TOKEN = process.env.TOKEN

const LOAD_SLASH = process.argv[2] == "load"

const CLIENT_ID = "640935639864311869"
const GUILD_ID = "973957021307133993"

// Create new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS , "GUILD_VOICE_STATES"]});

const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

for (const file of eventFiles){
    const event = require(`./events/${file}`);
    if(event.once){
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

// Music player stuff
client.player = new Player(client,{
    ytdlOptions: {
        quality: "highestaudio",
        highWaterMark: 1 << 25
        }
    })

client.slashcommands = new Discord.Collection
let commands = []

const slashFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"))
for (const file of slashFiles){
    const slashcmd = require(`./commands/${file}`)
    client.slashcommands.set(slashcmd.data.name, slashcmd)
    if(LOAD_SLASH) commands.push(slashcmd.data.toJSON())
}

if(LOAD_SLASH){
    const rest = new REST({ version: "9"}).setToken(TOKEN)
    console.log("Deploying slash commands")

    rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID, {body: commands}))
    .then(() => {
        console.log("Succesfully loaded")
        process.exit(0)
    })
    .catch((error) => {
        console.log(error)
        process.exit(1)
    })
}

else {
    client.on("Ready", () =>{
        console.log(`Logged in as ${client.user.tag}`)
    })

    client.on("interactionCreate", (interaction) =>{
        async function handleCommand() {
            if(!interaction.isCommand()) return

            const slashcmd = client.slashcommands.get(interaction.commandName)
            if(!slashcmd) interaction.reply("Not a valid command")

            await interaction.deferReply()
            await slashcmd.run({client, interaction})
        }
        handleCommand()
    })
    client.login(TOKEN)
}