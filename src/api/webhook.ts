import { Request, Response } from 'express';
import { makeWebhookService, WebhookPayload } from '../services/makeWebhookService';

export async function handleWebhook(req: Request, res: Response) {
  try {
    const payload = req.body as WebhookPayload;
    const response = await makeWebhookService.handleWebhook(payload);
    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}