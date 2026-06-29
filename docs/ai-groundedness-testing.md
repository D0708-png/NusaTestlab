# AI Groundedness Testing

AI groundedness testing digunakan untuk mengecek apakah jawaban AI sesuai dengan data bisnis yang tersedia.

Pada tahap ini, NusaTestLab bisa membuat AI scenarios dari dataset dummy AI UMKM.

## Flow

```txt
generate:data
    ↓
ai:generate-scenarios
    ↓
ai:run --file data/generated/ai-umkm-ai.scenarios.json
Generate Dataset
npm run generate:data

Atau custom:

npm run cli -- generate:data --products 500 --purchases 1000 --sales 5000
Generate Grounded AI Scenarios
npm run ai:generate-scenarios

Output:

data/generated/ai-umkm-ai.scenarios.json
Run Grounded AI Scenarios

Dry-run:

npm run ai:grounded

Manual:

npm run cli -- ai:run --file data/generated/ai-umkm-ai.scenarios.json --mode dry-run

Live:

npm run cli -- ai:run --file data/generated/ai-umkm-ai.scenarios.json --mode live
Generated Scenarios

Saat ini generated scenario mencakup:

top selling product grounding
low stock product grounding
cashier profit access denial
tenant boundary denial
Catatan

Dry-run hanya memastikan scenario valid.

Live mode membutuhkan endpoint AI target, misalnya:

POST /api/ai/chat

Payload default:

{
  "message": "<prompt>",
  "prompt": "<prompt>"
}

