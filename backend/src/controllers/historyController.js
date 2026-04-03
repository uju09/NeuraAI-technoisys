import { prisma } from '../utils/prisma.js';
import { logger } from '../utils/logger.js';
import { redisClient } from '../utils/redisClient.js';

export async function getHistory(req, res) {
  try {
    const { userId } = req.params;
    const components = await prisma.component.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        prompt: true,
        validated: true,
        created_at: true,
        code: true
      }
    });

    res.status(200).json({ history: components });
  } catch (error) {
    logger.error(`Get History Error: ${error.message}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function deleteComponent(req, res) {
  try {
    const { id } = req.params;
    
    const component = await prisma.component.findUnique({ where: { id } });
    if (!component) {
      return res.status(404).json({ error: "Component not found" });
    }

    await prisma.component.delete({ where: { id } });

    const cacheKey = `component:prompt:${Buffer.from(component.prompt).toString('base64')}`;
    await redisClient.del(cacheKey);

    res.status(200).json({ success: true });
  } catch (error) {
    logger.error(`Delete Component Error: ${error.message}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
