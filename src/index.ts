import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import prisma from './prisma.js';
import { PostStatus } from '@prisma/client';

const app = new Hono();

app.use('/*', cors())
app.post('/api', async (c) => {
  const { title, content } = await c.req.json();
  const newPost = await prisma.post.create({
    data: { title, content, status: PostStatus.DRAFT },
  });
  return c.json(newPost, 201);
});

app.get('/api', async (c) => {
  const posts = await prisma.post.findMany();
  return c.json(posts);
});

app.put('/api/:id', async (c) => {
  const { id } = c.req.param();
  const { title, content } = await c.req.json();
  const updatedPost = await prisma.post.update({
    where: { id: Number(id) },
    data: { title, content, status: PostStatus.PUBLISHED },
  });
  return c.json(updatedPost);
});

app.delete('/api/:id', async (c) => {
  const { id } = c.req.param();
  await prisma.post.delete({
    where: { id: Number(id) },
  });
  return c.json({ message: 'Post deleted successfully' });
});

serve({
  fetch: app.fetch,
  port: 2626,
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`);
});