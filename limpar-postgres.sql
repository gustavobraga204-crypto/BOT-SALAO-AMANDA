-- Script para limpar todas as tabelas do banco PostgreSQL
-- Execute este script no painel do Render ou em qualquer cliente PostgreSQL

-- Remove todos os agendamentos
DELETE FROM agendamentos;

-- Remove todos os clientes
DELETE FROM clientes;

-- Confirma a limpeza
SELECT 'Banco limpo com sucesso!' AS status;

-- Verifica se está vazio
SELECT 
    (SELECT COUNT(*) FROM clientes) AS total_clientes,
    (SELECT COUNT(*) FROM agendamentos) AS total_agendamentos;
