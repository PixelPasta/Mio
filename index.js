const token = (require('./config.json')).token
const express = require('express')
const app = express()
const {Client, GatewayIntentBits, discordSort} = require('discord.js')
const client = new Client({intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]})
const sleep = ms => new Promise(r => setTimeout(r, ms));
const discord = require('discord.js')
const fetch = require('node-fetch')

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return
    const {commandName, options} = interaction
    if (commandName == 'ping') {
        interaction.reply(`Pong 🏓! ${client.ws.ping} ms`)
        return
    }
    if (commandName == 'anime-search') {
       interaction.deferReply()
        let query = options.getString('search')
        let content = await fetch(`https://api.consumet.org/anime/animepahe/${query.replaceAll(' ', "%20")}`)
        content = await content.json()
        if (content.statusCode == 500) {
            console.log(content.statusCode == 500)
          await sleep(3000)
          interaction.editReply(`Nothing Found! <:mio_shocked:1044958421318897724>`)
          return
        }
        const id = content.results[0].id
        content = await fetch(`https://api.consumet.org/anime/animepahe/info/${id}`)
        content = await content.json()
        const embed = new discord.EmbedBuilder()
        let content2 = await fetch(`https://api.consumet.org/anime/enime/${query}`)
        content2 = await content2.json()
        embed.setColor('#a9c3de')
        embed.setImage(content.image)
      
       embed.setFooter({iconURL: interaction.user.avatarURL({format: 'png'}), text: `Requested by ${interaction.user.username}`})
       embed.setAuthor({iconURL: client.user.avatarURL({format: 'png'}), name: 'Mio'})
        embed.setTitle(content.title)
        embed.setDescription(content.description)
        try {
            embed.addFields(
             {name: 'Release date', value: content2.results[0].releaseDate.toString(), inline: true},
             {name: 'genres', value: content.genres.join(", "), inline: true},
             {name: 'status', value: content2.results[0].status, inline: true},
             {name: 'type', value: content2.results[0].type, inline: true}
            )
            const row = new discord.ActionRowBuilder()
			.addComponents(
				new discord.ButtonBuilder()
					.setLabel('MyAnimeList')
                    .setURL(`https://myanimelist.net/anime/${content2.results[0].mappings.mal}`)
					.setStyle(discord.ButtonStyle.Link)
                    .setEmoji(`<:MAL:1044954826452246569>`),
                new discord.ButtonBuilder()
					.setLabel('AniDB')
                    .setURL(`https://anidb.net/anime/${content2.results[0].mappings.anidb}`)
					.setStyle(discord.ButtonStyle.Link)
                    .setEmoji(`<:aniDB:1044955403131301908>`),
                new discord.ButtonBuilder()
					.setLabel('AniDB')
                    .setURL(`https://anilist.co/anime/${content2.results[0].mappings.anilist}`)
					.setStyle(discord.ButtonStyle.Link)
                    .setEmoji(`<:ALl:1044956506698825768>`),    
			);
            interaction.editReply({embeds: [embed], components: [row]})
         } 
         catch(err) {

             embed.addFields(
                 {name: 'Release date', value: 'unavailable', inline: true},
                 {name: 'genres', value: content.genres.join(", "), inline: true},
                 {name: 'status', value:'unavailable', inline: true},
                 {name: 'type', value: 'unavailable', inline: true}
                )

                interaction.editReply({embeds: [embed]})
         }
       
     
    }
    if (commandName == 'manga-search') {
        interaction.deferReply()
        let query = options.getString('search')
        let content = await fetch(`https://api.consumet.org/manga/mangadex/${query}`)
        content = await content.json()
      
        if (content.results.length === 0) {
            await sleep(3000)
            interaction.editReply(`Nothing found! <:mio_shocked:1044958421318897724> `)
            return
        }
        let id = content.results[0].id
        let details = new Object()
        content = await fetch(`https://api.consumet.org/manga/mangadex/info/${id}`)
        content = await content.json()
        details['name'] = content.title
        details['desc'] = content.description.en
        details['genres'] = content.genres.join(', ')
        details['themes'] = content.themes.join(', ')
        details['status'] = content.status
        details['release_date'] = content.releaseDate
        content = await fetch(`https://api.mangadex.org/manga/${id}?includes[]=cover_art&includes[]=author`)
        content = await content.json()
        details['cover'] = `https://uploads.mangadex.org/covers/${id}/${content.data.relationships[2].attributes.fileName}`
        details['mangaka'] = content.data.relationships[0].attributes.name
        details['amz'] = content.data.attributes.links.amz
        details['mal'] = content.data.attributes.links.mal
        if (details.genres == null || details.genres.length == 0) details.genres = 'Title unavailable'
        if (details.name == null || details.name.length == 0) details.name = 'unavailable'
        if (details.desc == null || details.desc.length == 0) details.desc = 'unavailable'
        if (details.themes == null || details.themes.length == 0) details.themes = 'unavailable'
        if (details.status == null || details.status.length == 0) details.status = 'unavailable'
        if (details.release_date == null || details.release_date.length == 0)  details.release_date = 'unavailable'
        if (details.amz == null || details.amz.length == 0) details.amz = 'unavailable'
        if (details.mal == null || details.mal.length == 0) details.mal = 'unavailable'
        console.log(details)
        const embed = new discord.EmbedBuilder()
        embed.setFooter({iconURL: interaction.user.avatarURL({format: 'png'}), text: `Requested by ${interaction.user.username}`})
        embed.setAuthor({iconURL: client.user.avatarURL({format: 'png'}), name: 'Mio'})
        embed.setColor('#a9c3de')
        embed.setTitle(details.name)
        embed.setDescription(details.desc)
        embed.addFields(
            {name:'genres', value: details.genres, inline: true},
            {name: 'themes', value:details.themes, inline: true},
            {name:'status', value: details.status, inline: true},
            {name:'Release Date', value:details.release_date.toString(), inline: true},
            {name: 'mangaka', value:details.mangaka})
            
        embed.setImage(details.cover)
        const row = new discord.ActionRowBuilder()
        if (details.mal !== 'unavailable') {
			row.addComponents(
				new discord.ButtonBuilder()
					.setLabel('MyAnimeList')
                    .setURL(`https://myanimelist.net/manga/${details.mal}`)
					.setStyle(discord.ButtonStyle.Link)
                    .setEmoji(`<:MAL:1044954826452246569>`)
                    )}
        if (details.amz !== 'unavailable') {
            row.addComponents(
				new discord.ButtonBuilder()
					.setLabel('Amazon')
                    .setURL(`${details.amz}`)
					.setStyle(discord.ButtonStyle.Link)
                    .setEmoji(`<:amz:1046790998270939178>`), 
)} 
            await sleep(3000)
            if (row.components.length === 0) {
                interaction.editReply({embeds: [embed]})
                return
            }
        interaction.editReply({embeds: [embed], components: [row]})
    }
})

app.get('/', async (req, res) => {
    res.sendStatus(200)
})

client.login(token)
client.on('ready', async () => {
    client.user.setStatus('idle')
    client.user.setActivity(`J-POP`,  { type: discord.ActivityType.Listening })
//     const commands = client.application.commands
// commands?.create({
//     name: 'manga-search',
//     description: 'search for an manga',
//     options: [{
//         name: 'search',
//         type: 3,
//         required: true,
//         description: 'the manga you want to search for'

//     }]
// })
console.log('Client running')
})

process.on('uncaughtException', (err) => {
    console.log(err)
})

app.listen(3000, async () => {
    console.log(`Listening to 3000`)
})