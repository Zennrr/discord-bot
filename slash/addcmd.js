const { SlashCommandBuilder } = require("@discordjs/builders");
const { Message } = require("discord.js")
const {QuickDB} = require("quick.db")
const db = QuickDB()

module.exports = {

    data: new SlashCommandBuilder()
    .setName("addcmd")
    .setDescription("add custom commands")
    .addStringOption((option) => option.setName("name").setDescription("commands name").setRequired(true))
    .addStringOption((option) => option.setName("content").setDescription("commands content").setRequired(true)),

    run: (client, message, args, interaction) => {

        let cmdName = interaction.options.getString("name")
        
        let cmdResponse = interaction.options.getString("content")

        let database = db.get(`${message.guild.id}`)

        if(database && !database.find(x => x.name === cmdName.toLowerCase()))
            return message.channel.send(":x: This command already exists")

        let data = {
            name: cmdName.toLowerCase(),
            response: cmdResponse
        }

        db.push(`${message.guild.id}`, data)

        return message.channel.send("Added **" + cmdName.toLowerCase() + "** as a command")



    }
}