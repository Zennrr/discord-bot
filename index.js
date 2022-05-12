// Require the necessary discord.js classes
const fs = require('node:fs');
const {Client, Collection, Intents} = require('discord.js');
const {token} = require('./config.json');

// Create new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS]});

const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

for (const file of eventFiles){
    const event = require(`./events/${file}`);
    if(event.once){
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles){
    const command = require(`./commands/${file}`)
    // Set a new item in the collection
    // With the key as the command name and the values as the exported module
    client.commands.set(command.data.name, command);
}

//Replying to commands
client.on('interactionCreate', async interaction => {
    if(!interaction.isCommand()) return;
    

    const command = client.commands.get(interaction.commandName);

    if(!command) return;

    try{
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({content: 'There was and error while executing this command!', ephemeral: true});
    }
});

// Login to Discord with your clients token
client.login(process.env.DJS_TOKEN);