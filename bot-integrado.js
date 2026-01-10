import { makeWASocket, DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion } from '@whiskeysockets/baileys';
import pino from 'pino';
import qrcode from 'qrcode-terminal';
import { fluxos } from './fluxos.js';
import { carregarDatabase } from './database.js';
import { notificarMudanca } from './servidor.js';

// Carrega base de dados ao iniciar (aguarda se for async)
await carregarDatabase();

// Variável global para armazenar a função de notificação
let funcaoNotificar = null;

// Variável global para armazenar o QR Code atual
export let qrCodeAtual = null;

// Função para registrar a função de notificação
export function registrarNotificacao(funcao) {
    funcaoNotificar = funcao;
}

// Função para notificar mudanças (pode ser chamada de outros módulos)
export function notificarAtualizacao() {
    if (funcaoNotificar) {
        funcaoNotificar();
    }
}

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
                qrCodeAtual = qr;
                console.log('\n📱 QR Code gerado! Acesse: http://localhost:3000/qrcode\n');
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
                qrCodeAtual = null;
                console.log('✅ Bot online!\n');
            }
        });

        sock.ev.on('messages.upsert', async ({ messages }) => {
            const msg = messages[0];
            if (!msg.message || msg.key.fromMe || msg.key.remoteJid.endsWith('@g.us')) return;

            const de = msg.key.remoteJid;
            const texto = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';

            console.log(`📨 ${de.split('@')[0]}: ${texto}`);

            const resposta = fluxos(de, texto.trim());
            
            if (resposta) {
                await new Promise(r => setTimeout(r, 1500));
                await sock.sendMessage(de, { text: resposta });
                console.log('✅ Resposta enviada\n');
                
                // Notifica mudança no painel web
                notificarAtualizacao();
            }
        });
    } catch (erro) {
        console.error('❌ Erro:', erro.message);
        process.exit(1);
    }
}

console.log('🚀 Iniciando bot...\n');
conectar().catch(console.error);
