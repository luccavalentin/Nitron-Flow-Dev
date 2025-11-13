#!/bin/bash

# Script para deployar todas as Edge Functions

echo "🚀 Iniciando deploy de todas as Edge Functions..."

# Projects
supabase functions deploy projects/get
supabase functions deploy projects/create
supabase functions deploy projects/update
supabase functions deploy projects/delete
supabase functions deploy projects/get-by-id
supabase functions deploy projects/init-roadmap

# Clients
supabase functions deploy clients/get
supabase functions deploy clients/create
supabase functions deploy clients/update
supabase functions deploy clients/delete

# Tasks
supabase functions deploy tasks/get
supabase functions deploy tasks/create
supabase functions deploy tasks/update
supabase functions deploy tasks/delete
supabase functions deploy tasks/move

# Roadmap
supabase functions deploy roadmap/get
supabase functions deploy roadmap/create
supabase functions deploy roadmap/update
supabase functions deploy roadmap/delete

# Workspace
supabase functions deploy workspace/get
supabase functions deploy workspace/patch
supabase functions deploy workspace/snapshot
supabase functions deploy workspace/commit

# GitHub
supabase functions deploy github/connect
supabase functions deploy github/repos
supabase functions deploy github/commit-push

# Supabase
supabase functions deploy supabase/connect
supabase functions deploy supabase/projects
supabase functions deploy supabase/delete

# Deploy
supabase functions deploy deploy/start
supabase functions deploy deploy/debug
supabase functions deploy deployments/get

# Finance
supabase functions deploy finance/sync-kiwify
supabase functions deploy finance/products

# FINCORE
supabase functions deploy fincore/summary
supabase functions deploy fincore/distribute
supabase functions deploy fincore/simulate
supabase functions deploy fincore/insights

# Budgets & Receipts
supabase functions deploy budgets/create
supabase functions deploy budgets/get
supabase functions deploy budgets/send
supabase functions deploy receipts/get
supabase functions deploy receipts/generate

# Payments & Licenses
supabase functions deploy payments/get
supabase functions deploy licenses/get

# AI
supabase functions deploy ai/chat
supabase functions deploy ai/stt

# Creative Sessions
supabase functions deploy creative-sessions/get
supabase functions deploy creative-sessions/create

# Activities & Snapshots
supabase functions deploy activities/get
supabase functions deploy snapshots/get

# Backup
supabase functions deploy backup/run

echo "✅ Deploy completo!"

