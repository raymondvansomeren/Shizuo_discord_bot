const baseEmbed = require('../modules/base-embed.js');

const { joinVoiceChannel } = require('@discordjs/voice');
const { play } = require('../modules/play.js');

const moment = require('moment');
const momentDurationFormatSetup = require('moment-duration-format');

module.exports = {
    queueObject: class queueObject
    {
        constructor(interaction, message)
        {
            this.interaction = interaction;
            this.textChannel = interaction.channel;
            this.message = message;

            this.voiceChannel = interaction.member?.voice?.channel;
            if (this.voiceChannel === undefined
                || this.voiceChannel === null)
            {
                const embed = baseEmbed.get(interaction.client)
                    .setDescription('You aren\'t in a voice channel in this server or I can\'t see that voice channel');
                // this.message?.delete()
                    // .catch(error =>
                    //     {
                    //         // Nothing
                    //     });
                // this.textChannel.send({ embeds: [embed], ephemeral: true });
                this.interaction.editReply({ embeds: [embed], ephemeral: true });
                this.destructor();
                return;
            }
            if (!this.voiceChannel?.joinable)
            {
                const embed = baseEmbed.get(interaction.client)
                    .setDescription('I can\'t join your voice channel');
                // this.message?.delete()
                    // .catch(error =>
                    //     {
                    //         // Nothing
                    //     });
                // this.textChannel.send({ embeds: [embed], ephemeral: true });
                this.interaction.editReply({ embeds: [embed], ephemeral: true });
                this.destructor();
                return;
            }
            this.connection = undefined;
            this.songs = [];
            this.volume = 5;
            this.playing = false;
            this.fullStop = false;
            this.loop = 'none';
            this.player = undefined;
            this.resource = undefined;
        }
        destructor()
        {
            // TODO handle destruction of object
            //      Such as disconnect and message
        }

        getTextChannel()
        {
            return this.textChannel;
        }
        setTextChannel(textChannel)
        {
            this.textChannel = textChannel;
        }

        getVoiceChannel()
        {
            return this.voiceChannel;
        }
        setVoiceChannel(voiceChannel)
        {
            this.voiceChannel = voiceChannel;
        }

        getMessage()
        {
            return this.message;
        }
        setMessage(message)
        {
            this.message = message;
        }

        getConnection()
        {
            return this.connection;
        }
        setConnection(connection)
        {
            this.connection = connection;
        }

        getSongs(id = undefined)
        {
            if (id < this.songs.length)
            {
                return this.songs.at(id);
            }
            else if (id >= this.songs.length)
            {
                return undefined;
            }
            return this.songs;
        }
        setSongs(songs)
        {
            this.songs = songs;
        }
        addSong(song, interaction = undefined, playlist = false)
        {
            this.songs.push(song);
            this.interaction.client.queue.set(this.interaction.guild.id, this);

            momentDurationFormatSetup;

            if (this.songs.length === 1)
            {
                try
                {
                    // Here we try to join the voicechat and save our connection into our object.
                    this.setConnection(joinVoiceChannel({
                        channelId: this.getVoiceChannel().id,
                        guildId: this.interaction.guild.id,
                        selfDeaf: true,
                        adapterCreator: this.interaction.guild.voiceAdapterCreator,
                    }));
                    interaction.editReply({ embeds: [
                        baseEmbed.get(this.interaction.client)
                            .setDescription(`Now playing **[${song.title}](${song.url})**`)
                            .addFields([
                                { name: 'Duration', value: `${moment.duration(song.duration, 'seconds').format('h:mm:ss').padStart(4, '0:0')} minutes`, inline: true },
                            ])
                            .setThumbnail(song.thumbnail),
                    ] });
                    // Calling the play function to start a song
                    play(this.interaction, this.getSongs(0));
                    return true;
                }
                catch (error)
                {
                    this.getConnection()?.disconnect();
                    this.interaction.client.queue.delete(this.interaction.guild.id);

                    const embed = baseEmbed.get(this.interaction.client)
                        .setDescription('Something went wrong, try again later');
                    if (this.interaction.deferred || this.interaction.replied)
                    {
                        this.interaction.editReply({ embeds: [embed.data], ephemeral: true });
                    }
                    else
                    {
                        this.interaction.reply({ embeds: [embed.data], ephemeral: true });
                    }
                    this.interaction.client.logger.error(error);
                    return false;
                }
            }
            else if (interaction !== undefined
                    && this.songs.length > 1)
            {
                if (!playlist)
                {
                    interaction.editReply({ embeds: [
                        baseEmbed.get(this.interaction.client)
                            .setDescription(`Added **[${song.title}](${song.url})** to the queue`)
                            .addFields([
                                { name: 'Duration', value: `${moment.duration(song.duration, 'seconds').format('h:mm:ss').padStart(4, '0:0')} minutes`, inline: true },
                            ])
                            .setThumbnail(song.thumbnail),
                    ] });
                }
                return true;
            }
            return false;
        }

        getVolume()
        {
            return this.volume;
        }
        setVolume(volume)
        {
            this.volume = volume;
        }

        isPlaying()
        {
            return this.playing;
        }
        play(resource = undefined)
        {
            this.playing = true;
            if (resource !== undefined)
            {
                this.player.play(resource);
            }
            else
            {
                this.player.unpause();
            }
        }
        pause()
        {
            this.playing = false;
            this.player.pause();
        }
        stop()
        {
            this.playing = false;
            this.fullStop = true;
            this.player.stop();
            this.songs = [];
            this.connection?.disconnect();
        }
        getFullStop()
        {
            return this.fullStop;
        }

        getLoopState()
        {
            return this.loop;
        }
        loopNone()
        {
            this.loop = 'none';
        }
        loopSingle()
        {
            this.loop = 'single';
        }
        loopQueue()
        {
            this.loop = 'all';
        }

        getPlayer()
        {
            return this.player;
        }
        setPlayer(player)
        {
            this.player = player;
        }

        getAudioResource()
        {
            return this.resource;
        }
        setAudioResource(resource)
        {
            this.resource = resource;
            this.play(this.resource);
        }
    },
};