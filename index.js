// Require the necessary discord.js classes
const fs = require("fs");
const {Client, Collection, Intents, Events} = require('discord.js');
const dotenv = require("dotenv");
const { Player } = require("discord-player");
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const Discord = require("discord.js");
const path = require('node:path');

dotenv.config()
const TOKEN = process.env.TOKEN

const LOAD_SLASH = process.argv[2] == "load"

const CLIENT_ID = "640935639864311869"
const GUILD_ID = "973957021307133993"

// Create new client instance
const client = new Discord.Client({
        intents: [
            Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILDS
        ]
    });

// Music player stuff
client.player = new Player(client,{
    ytdlOptions: {
        quality: "highestaudio",
        highWaterMark: 1 << 25
        }
    })

client.slashcommands = new Discord.Collection
let commands = []

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

const slashFiles = fs.readdirSync("./slash").filter(file => file.endsWith(".js"))
for (const file of slashFiles){
    const slashcmd = require(`./slash/${file}`)
    client.slashcommands.set(slashcmd.data.name, slashcmd)
    if(LOAD_SLASH) commands.push(slashcmd.data.toJSON())
}

if(LOAD_SLASH){
    const rest = new REST({ version: "9"}).setToken(TOKEN)
    console.log("Deploying slash commands")


    rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands })
	    .then(() => console.log('Successfully registered application commands.'))
	    .catch(console.error);
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