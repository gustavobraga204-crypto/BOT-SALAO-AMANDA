import { makeWASocket, DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion } from '@whiskeysockets/baileys';
import pino from 'pino';
import qrcode from 'qrcode-terminal';
import { fluxos } from './fluxos.js';
import { carregarDatabase } from './database.js';
import { obterSessao } from './sessoes.js';

// Carrega base de dados ao iniciar
carregarDatabase();

async function conectar() {
    try {
        const { state, saveCreds } = await useMultiFileAuthState('./auth');
        const { version } = await fetchLatestBaileysVersion();
        
        const sock = makeWASocket({
            auth: state,
            version,
            logger: pino({ level: 'silent' }),
            browser: ['Amanda Nails Designer', 'Chrome', '4.0.0'],
            connectTimeoutMs: 60000,
            defaultQueryTimeoutMs: 0,
            keepAliveIntervalMs: 30000,
            markOnlineOnConnect: false,
            printQRInTerminal: false,
            syncFullHistory: false,
            generateHighQualityLinkPreview: false,
            getMessage: async () => undefined
        });

        sock.ev.on('creds.update', saveCreds);
        
        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;
            
            if (qr) {
                console.log('\n📱 Escaneie o QR Code:\n');
                qrcode.generate(qr, { small: true });
                console.log('\n⏳ Aguardando...\n');
            }
            
            if (connection === 'close') {
                const code = lastDisconnect?.error?.output?.statusCode;
                console.log('❌ Desconectado. Código:', code);
                if (code !== DisconnectReason.loggedOut) {
                    console.log('🔄 Reconectando em 3s...');
                    await new Promise(r => setTimeout(r, 3000));
                    await conectar();
                } else {
                    console.log('🔒 Sessão encerrada.');
                }
            }
            
            if (connection === 'open') {
                console.log('✅ Bot online!\n');
            }
        });

        sock.ev.on('messages.upsert', async ({ messages }) => {
            const msg = messages[0];
            if (!msg.message || msg.key.fromMe || msg.key.remoteJid.endsWith('@g.us')) return;

            const de = msg.key.remoteJid;
            const texto = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
            const textoNormalizado = texto.trim().toLowerCase();

            console.log(`📨 ${de.split('@')[0]}: ${texto}`);

            // Palavras de início permitidas
            const palavrasInicio = ['oi', 'olá', 'ola', 'bom dia', 'boa tarde', 'boa noite', 'hello', 'start', 'iniciar'];
            
            // Verifica se o usuário tem sessão ativa
            const sessaoAtual = obterSessao(de);
            const temSessaoAtiva = sessaoAtual && sessaoAtual.etapa && sessaoAtual.etapa !== 'cadastro_nome';
            
            // Se não tem sessão ativa, só aceita palavras de início
            if (!temSessaoAtiva && !palavrasInicio.includes(textoNormalizado)) {
                await sock.sendMessage(de, { 
                    text: '👋 Olá! Para iniciar, envie uma das seguintes mensagens:\n\n' +
                          '• Oi\n' +
                          '• Olá\n' +
                          '• Bom dia\n' +
                          '• Boa tarde\n' +
                          '• Boa noite\n' +
                          '• Hello\n' +
                          '• Start ou Iniciar'
                });
                return;
            }

            const resposta = fluxos(de, texto.trim());
            
            if (resposta) {
                await new Promise(r => setTimeout(r, 1500));
                await sock.sendMessage(de, { text: resposta });
                console.log('✅ Resposta enviada\n');
            }
        });
    } catch (erro) {
        console.error('❌ Erro:', erro.message);
        process.exit(1);
    }
}

console.log('🚀 Iniciando bot...\n');
conectar().catch(console.error);
