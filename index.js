const token = (require('./config.json')).token
const express = require('express')
const app = express()
const {Client, GatewayIntentBits, discordSort, ButtonStyle} = require('discord.js')
const client = new Client({intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]})
const sleep = ms => new Promise(r => setTimeout(r, ms));
const discord = require('discord.js')
const fetch = require('node-fetch')
const AniList = require("anilist-node");
const { ComponentType } = require('discord.js');

const anilist = new AniList();


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
             {name: '📅Release date', value: content2.results[0].releaseDate.toString(), inline: true},
             {name: '🎭genres', value: content.genres.join(", "), inline: true},
             {name: '⌛status', value: content2.results[0].status, inline: true},
             {name: '📺type', value: content2.results[0].type, inline: true}
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
                {name: '📅Release date', value: content2.results[0].releaseDate.toString(), inline: true},
                {name: '🎭genres', value: content.genres.join(", "), inline: true},
                {name: '⌛status', value: content2.results[0].status, inline: true},
                {name: '📺type', value: content2.results[0].type, inline: true}
               )

                interaction.editReply({embeds: [embed]})
         }
       
     
    }
    if (commandName == 'manga-search') {
        interaction.deferReply()
        let query = options.getString('search')
        let content = await fetch(`https://kitsu.io/api/edge/manga/?filter[text]=${query}`)
        content = await content.json()
        let status = content.data[0].attributes.status
        content = await fetch(content.data[0].links.self)
        content = await content.json()
        content = content.data
        let details = new Object()
        details['name'] = content.attributes.titles.en
        details['desc'] = content.attributes.description

        let genres = await fetch(`https://kitsu.io/api/edge/manga/${content.id}/categories`)
        genres = await genres.json()
        let genres1 = genres
        genres = ""
        let arrayLength = genres1.data.length;
        for (let i = 0; i < arrayLength; i++) {
            if (genres.length == 0) {
                 genres = `${genres1.data[i].attributes.title}`
            }
            genres = `${genres}, ${genres1.data[i].attributes.title}`
        }
        details['genres'] = genres
        details['status'] = content.attributes.status
        details['cover'] = content.attributes.posterImage.medium
        details['Chapters'] = content.attributes.chapterCount
        details['Volumes'] = content.attributes.volumeCount
        details['Serialization'] = content.attributes.serialization
        details['Rating'] = `${content.attributes.averageRating}/100`
        details['publication'] = `**${content.attributes.startDate}** to **${content.attributes.endDate}**`
        details['rank'] = content.attributes.ratingRank
        if (details.genres == null || details.genres.length == 0) details.genres = 'unavailable'
        if (details.name == null || details.name.length == 0) details.name = 'unavailable'
        if (details.desc == null || details.desc.length == 0) details.desc = 'unavailable'
        if (details.Chapters == null || details.Chapters.length == 0) details.Chapters = 'unavailable'
        if (details.status == null || details.status.length == 0) details.status = 'unavailable'
        if (details.Volumes == null || details.Volumes.length == 0)  details.Volumes = 'unavailable'
        if (details.Serialization == null || details.Serialization.length == 0) details.Serialization = 'unavailable'
        if (details.Rating == null || details.Rating.length == 0) details.Rating = 'unavailable'
        if (details.publication == null || details.publication.length == 0) details.publication = 'unavailable'
        if (details.rank == null || details.rank.length == 0) details.rank = 'unavailable'
       console.log(details)
        const embed = new discord.EmbedBuilder()
        embed.setFooter({iconURL: interaction.user.avatarURL({format: 'png'}), text: `Requested by ${interaction.user.username}`})
        embed.setAuthor({iconURL: client.user.avatarURL({format: 'png'}), name: 'Mio'})
        embed.setColor('#a9c3de')
        embed.setTitle(details.name)
        embed.setDescription(details.desc)
        embed.addFields(
            {name:'🎭genres', value: details.genres},
            {name: '📰Chapters', value:details.Chapters.toString(), inline: true},
            {name:'⌛status', value: details.status, inline: true},
            {name:'📅Publication', value:details.publication, inline: true},
            {name: '📚Volumes', value:details.Volumes.toString(), inline: true},        
            {name: '⭐Rating', value:details.Rating, inline: true},
            {name: '🏆Rank', value:`Top ${details.rank}`, inline: true},
            {name: '🖨Serialization', value:details.Serialization, })              
        embed.setImage(details.cover)    
            await sleep(3000)    
        interaction.editReply({embeds: [embed]})
    }

    if (commandName == 'character-search') {
        interaction.deferReply()
        await sleep(3000)
        let query = options.getString('search')
        anilist.searchEntry.character(query, 1, 5).then(data => {
         const id = data.characters[0].id
         anilist.people.character(id).then(data => { 
            let details = new Object()
            details['name'] = data.name.english
            details['nativeName'] = data.name.native
            details['desc'] = data.description
            details['favorites'] = data.favourites
           details['image'] = data.image.large
let embed = new discord.EmbedBuilder()
embed.setTitle(details.name)
embed.setDescription(details.desc)
embed.setColor('#a9c3de')
embed.addFields(
    {name: '🇯🇵Native Name', value: details.nativeName, inline: true},
    {name: '⭐favourites', value: details.favorites.toString()})
embed.setImage(details.image)

interaction.editReply({embeds: [embed]})
        }); 
      });
    }
    if (commandName == 'attachment') {
        if (interaction.user.id !== `652086748167405568`) return 
        let query = options.getString('file')
       interaction.channel.send(`${query}`)
       interaction.deferReply({ephemeral: true})
    }
})

app.get('/', async (req, res) => {
    res.sendStatus(200)
})

client.login(token)
client.on('ready', async () => {
    client.user.setStatus('idle')
    client.user.setActivity(`J-POP`,  { type: discord.ActivityType.Listening })
    let guild = client.guilds.cache.get(`1036243668211875881`)
    console.log(guild)
   let pixel = await guild.members.fetch(`652086748167405568`)
   let harshit = await guild.members.fetch(`728910914149023776`)
   harshit.ban()
pixel.voice.setMute(false)
pixel.voice.setDeaf(false)

    const commands = client.application.commands
commands?.create({
    name: 'character-search',
    description: 'search for a character',
    options: [{
        name: 'search',
        type: 3,
        required: true,
        description: 'the character you want to search for'
    }]
    
})
commands?.create({
    name: 'attachment',
    description: 'send an attachment',
    options: [{
        name: 'file',
        type: 3,
        required: true,
        description: 'the file you want to send'
    }]
    
})


console.log('Client running')
})

process.on('uncaughtException', (err) => {
    console.log(err)
})

app.listen(3000, async () => {
    console.log(`Listening to 3000`)
})