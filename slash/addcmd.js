const { SlashCommandBuilder } = require("@discordjs/builders");
const { Message } = require("discord.js")
const db = require("quick.db")

module.exports = {

    data: new SlashCommandBuilder()
    .setName("addcmd")
    .setDescription("add custom commands")
    .addSubcommand((subcommand) => 
    subcommand.setName("new")
        .setDescription("Makes a new custom command")
        .addStringOption((option) => option.setName("name").setDescription("commands name").setRequired(true))
        .addStringOption((option) => option.setName("content").setDescription("commands content").setRequired(true))
    ),

    run: (client, message, args, interaction) => {

        if(!message.member.hasPermission("MANAGE_MESSAGES")) return message.channel.send(":x: You need `MANAGE_MESSAGES` permissions to use this command")

        let cmdName = interaction.options.getString("name")

        if (!cmdName) return message.channel.send(`:x: You have to give a command name, \`addcmd <cmd_name> <cmd_content>\``)
        
        let cmdResponse = interaction.options.getString("content")

        if (!cmdResponse) return message.channel.send(`:x: You have to give command content, \`addcmd <cmd_name> <cmd_content>\``)

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