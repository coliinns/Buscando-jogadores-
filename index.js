const { 
    Client, 
    GatewayIntentBits, 
    Partials, 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    Events 
} = require('discord.js');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
    partials: [Partials.Channel]
});

const CANAL_BUSCANDO = "1408186643696980108"; 
const CANAL_CONVITES = "1392555751351914517";

const pedidosAtivos = new Map();

// IDs dos cargos
const cargosGolpes = {
    "buscar_cassino": "1408211090612944906",
    "buscar_cayo": "1408190721847988275",
    "buscar_vicent": "1408211381622280242",
    "lester_1": "1408440723392565391",
    "lester_2": "1408440828631847034",
    "lester_3": "1408440909003100212",
    "lester_4": "1408441029245534281",
    "lester_5": "1408441127459229868"
};

// Função para gerar espaços proporcionais ao tamanho do nickname
function gerarEspacosProporcionais(tamanho) {
    let espacos = '';
    for (let i = 0; i < tamanho; i++) {
        espacos += ' ';
    }
    return espacos;
}

client.once(Events.ClientReady, () => {
    console.log(`✅ Bot logado como ${client.user.tag}`);
});

client.on(Events.MessageCreate, async (message) => {
    if (message.content === "!setup" && message.channel.id === CANAL_BUSCANDO) {
        const embed = new EmbedBuilder()
            .setDescription("**Clique no botão abaixo** para escolher a missão ou golpe \nem que deseja buscar apoio de jogadores na comunidade. \n\nSua solicitação será **enviada para o canal <#1360720462518157514> exposta por 10 minutos**, buscaremos membros disponíveis para prestar suporte. \n\n**<:warn:1408450910039834734> Fique atento para notificação de jogador encontrado!**")
            .setColor(0xffec00)
            .setImage("https://cdn.discordapp.com/attachments/1372351881288089670/1408439764885045268/upscalemedia-transformed_1.jpeg?ex=68a9bf3f&is=68a86dbf&hm=35cdff7c77d2666825c6271f2070d74cde7d209419c11f0399442b368e5a8b24&");

        const buttons = [
            new ButtonBuilder()
                .setCustomId("buscar_cayo")
                .setLabel("Cayo Perico")
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId("buscar_cassino")
                .setLabel("Cassino Diamond")
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId("buscar_vicent")
                .setLabel("Vicent — Cluckin' Bell")
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId("lester_main")
                .setLabel("Missões do Lester")
                .setStyle(ButtonStyle.Primary)
        ];

        const row = new ActionRowBuilder().addComponents(buttons);

        await message.channel.send({ embeds: [embed], components: [row] });
    }
});

client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isButton()) return;

    const golpes = {
        "buscar_cayo": "Cayo Perico",
        "buscar_cassino": "Cassino Diamond",
        "buscar_vicent": "Vicent — Cluckin' Bell"
    };

    const ajudarMap = {
        "buscar_cayo": "ajudar_cayo",
        "buscar_cassino": "ajudar_cassino",
        "buscar_vicent": "ajudar_vicent"
    };

    if (golpes[interaction.customId]) {
        const golpe = golpes[interaction.customId];
        const cargo = `<@&${cargosGolpes[interaction.customId]}>`;
        const canal = await client.channels.fetch(CANAL_CONVITES);

        const avatarURL = interaction.user.displayAvatarURL({ size: 512, dynamic: true });
        const nickLength = interaction.user.username.length;
        const espacos = gerarEspacosProporcionais(nickLength);

        const embed = new EmbedBuilder()
            .setDescription(`${interaction.user} está **buscando apoio de jogadores** para o golpe de ${cargo}.${espacos} **Marque sua presença clicando no botão abaixo** e ganhe dinheiro em equipe. @everyone <a:moneybag:1405178051935076392>`)
            .setColor(0xffd700)
            .setThumbnail(avatarURL);

        const button = new ButtonBuilder()
            .setCustomId(ajudarMap[interaction.customId])
            .setLabel("Quero ajudar!")
            .setStyle(ButtonStyle.Success);

        const row = new ActionRowBuilder().addComponents(button);

        const msg = await canal.send({ embeds: [embed], components: [row] });
        pedidosAtivos.set(msg.id, interaction.user.id);

        const replyMsg = await interaction.reply({ content: "<a:Verify_yellow:1408449321929674893> Pedido de apoio enviado para o canal <#1360720462518157514> \n**<:warn:1408450910039834734> Fique atento para notificação de jogador encontrado!**", ephemeral: true });
        setTimeout(() => interaction.deleteReply().catch(() => {}), 10 * 60 * 1000);
        setTimeout(() => msg.delete().catch(() => {}), 10 * 60 * 1000);
    }

    // Separar os botões do Lester em duas linhas
    if (interaction.customId === "lester_main") {
        const canal = await client.channels.fetch(CANAL_BUSCANDO);

        const embed = new EmbedBuilder()
            .setDescription("**Selecione a missão do Lester abaixo:**")
            .setColor(0xffec00);

        const buttonsLesterRow1 = [
            new ButtonBuilder()
                .setCustomId("lester_1")
                .setLabel("Assalto ao Banco Fleeca")
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId("lester_2")
                .setLabel("Fuga da Prisão")
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId("lester_3")
                .setLabel("Invasão ao Laboratório Humane")
                .setStyle(ButtonStyle.Primary)
        ];

        const buttonsLesterRow2 = [
            new ButtonBuilder()
                .setCustomId("lester_4")
                .setLabel("Financiamento Serie A")
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId("lester_5")
                .setLabel("Assalto ao Banco Pacific Standard")
                .setStyle(ButtonStyle.Primary)
        ];

        const row1 = new ActionRowBuilder().addComponents(buttonsLesterRow1);
        const row2 = new ActionRowBuilder().addComponents(buttonsLesterRow2);

        const msg = await canal.send({ embeds: [embed], components: [row1, row2] });

        setTimeout(() => msg.delete().catch(() => {}), 10 * 60 * 1000);
    }

    if (interaction.customId.startsWith("lester_") && interaction.customId !== "lester_main") {
        const canal = await client.channels.fetch(CANAL_CONVITES);
        const cargo = `<@&${cargosGolpes[interaction.customId]}>`;
        const usuario = interaction.user;

        const embed = new EmbedBuilder()
            .setDescription(`${usuario} está **buscando apoio de jogadores** para a missão ${cargo}. **Marque sua presença clicando no botão abaixo** e ganhe dinheiro em equipe. <a:moneybag:1405178051935076392>)`)
            .setColor(0xffd700)
            .setThumbnail(usuario.displayAvatarURL({ size: 512, dynamic: true }));

        const button = new ButtonBuilder()
            .setCustomId(`ajudar_${interaction.customId}`)
            .setLabel("Quero ajudar!")
            .setStyle(ButtonStyle.Success);

        const row = new ActionRowBuilder().addComponents(button);

        const msg = await canal.send({ embeds: [embed], components: [row] });
        pedidosAtivos.set(msg.id, interaction.user.id);

        const replyMsg = await interaction.reply({ 
    content: "<a:Verify_yellow:1408449321929674893> Pedido de apoio enviado para o canal <#1360720462518157514>\n**<:warn:1408450910039834734> Fique atento para notificação de jogador encontrado!**", 
    ephemeral: true 
});

// Apagar a mensagem de resposta do usuário após 10 minutos
setTimeout(() => interaction.deleteReply().catch(() => {}), 10 * 60 * 1000);

// Apagar a mensagem do bot convites após 10 minutos
setTimeout(() => msg.delete().catch(() => {}), 10 * 60 * 1000);

    }

    if (interaction.customId.startsWith("ajudar_")) {
        const pedidoId = interaction.message.id;
        const quemPediuId = pedidosAtivos.get(pedidoId);

        if (!quemPediuId) {
            return interaction.reply({ content: "❌ Não encontrei quem pediu este convite.", ephemeral: true });
        }

        const quemPediu = `<@${quemPediuId}>`;
        const quemAjudou = interaction.user;
        const canal = await client.channels.fetch(CANAL_CONVITES);

        let golpe = interaction.customId.replace("ajudar_", "");
        let cargo = "";
        switch (golpe) {
            case "cayo": cargo = `<@&${cargosGolpes["buscar_cayo"]}>`; break;
            case "cassino": cargo = `<@&${cargosGolpes["buscar_cassino"]}>`; break;
            case "vicent": cargo = `<@&${cargosGolpes["buscar_vicent"]}>`; break;
            case "lester_1": cargo = `<@&${cargosGolpes["lester_1"]}>`; break;
            case "lester_2": cargo = `<@&${cargosGolpes["lester_2"]}>`; break;
            case "lester_3": cargo = `<@&${cargosGolpes["lester_3"]}>`; break;
            case "lester_4": cargo = `<@&${cargosGolpes["lester_4"]}>`; break;
            case "lester_5": cargo = `<@&${cargosGolpes["lester_5"]}>`; break;
        }

        const msg = await canal.send(`**Jogador encontrado!** ${quemAjudou} quer ajudar ${quemPediu} na missão de ${cargo}. \n**Obrigado pelo apoio!** Se comunique comigo no canal de voz <#1377710109115027547>`);
        setTimeout(() => msg.delete().catch(() => {}), 10 * 60 * 1000);
    }
});

client.login(process.env.TOKEN);
