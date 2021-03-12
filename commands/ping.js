module.exports = {
    name: 'ping',
    execute(bot, message, args)
    {
        // Calculates ping between sending a message and editing it, giving a nice round-trip latency.
        const t = new Date();
        message.channel.send('Ping?')
            .then(messages =>
            {
                const tt = new Date();
                const ping = tt - t;
                messages.edit(`Pong! Latency is ${ping} ms`);
            });
    },
};